import "server-only";

import { getServiceClient } from "@/lib/supabase/admin";

export type CspReportRow = {
  directive: string;
  blockedUri: string;
  documentPath: string;
};

const MAX_URI = 500;
const MAX_PATH = 300;
const MAX_DIRECTIVE = 120;

/** Hard cap on stored deduped rows (service-role cleanup). */
export const CSP_REPORTS_MAX_ROWS = 500;
/** Drop rows whose last hit is older than this. */
export const CSP_REPORTS_RETENTION_DAYS = 30;

function clip(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function pathFromUri(uri: unknown): string {
  if (typeof uri !== "string" || !uri.trim()) return "";
  try {
    const parsed = new URL(uri);
    return clip(parsed.pathname || "/", MAX_PATH);
  } catch {
    return clip(uri, MAX_PATH);
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Normalize one browser report body into storage columns. */
export function normalizeCspReport(body: Record<string, unknown>): CspReportRow | null {
  const directive = clip(
    asString(body["effective-directive"] ?? body.effectiveDirective ?? body["violated-directive"] ?? body.violatedDirective),
    MAX_DIRECTIVE,
  );
  if (!directive) return null;

  const blockedUri = clip(
    asString(body["blocked-uri"] ?? body.blockedURI ?? ""),
    MAX_URI,
  );
  const documentPath = pathFromUri(body["document-uri"] ?? body.documentURI ?? body.documentURL);

  return { directive, blockedUri, documentPath };
}

/** Extract up to a few normalized rows from a CSP payload (legacy or Reporting API). */
export function extractCspReports(payload: unknown): CspReportRow[] {
  const out: CspReportRow[] = [];

  const push = (body: Record<string, unknown>) => {
    const row = normalizeCspReport(body);
    if (row) out.push(row);
  };

  if (Array.isArray(payload)) {
    for (const entry of payload.slice(0, 5)) {
      if (!entry || typeof entry !== "object") continue;
      const row = entry as Record<string, unknown>;
      if (row.body && typeof row.body === "object") {
        push(row.body as Record<string, unknown>);
      } else {
        push(row);
      }
    }
    return out;
  }

  if (payload && typeof payload === "object") {
    const legacy = payload as Record<string, unknown>;
    if (legacy["csp-report"] && typeof legacy["csp-report"] === "object") {
      push(legacy["csp-report"] as Record<string, unknown>);
    } else {
      push(legacy);
    }
  }

  return out;
}

/**
 * Upsert deduped rows via service role. Failures are logged; the HTTP collector
 * still returns 204 so browsers are not encouraged to retry forever.
 */
export async function recordCspReports(rows: CspReportRow[]): Promise<void> {
  if (rows.length === 0) return;
  const supabase = getServiceClient();
  if (!supabase) return;

  const now = new Date().toISOString();
  for (const row of rows) {
    const { data: existing, error: selectError } = await supabase
      .from("csp_reports")
      .select("id, hit_count")
      .eq("directive", row.directive)
      .eq("blocked_uri", row.blockedUri)
      .eq("document_path", row.documentPath)
      .maybeSingle();

    if (selectError) {
      console.error("[csp-report] select failed:", selectError.message);
      continue;
    }

    if (existing?.id) {
      const { error } = await supabase
        .from("csp_reports")
        .update({
          hit_count: (existing.hit_count ?? 1) + 1,
          last_seen_at: now,
        })
        .eq("id", existing.id);
      if (error) console.error("[csp-report] update failed:", error.message);
      continue;
    }

    const { error } = await supabase.from("csp_reports").insert({
      directive: row.directive,
      blocked_uri: row.blockedUri,
      document_path: row.documentPath,
      hit_count: 1,
      first_seen_at: now,
      last_seen_at: now,
    });
    if (error) console.error("[csp-report] insert failed:", error.message);
  }
}

/**
 * Opportunistic retention: drop rows older than 30 days, then trim to the
 * hard row cap by deleting the least-recently-seen leftovers.
 * Runs via service role from the report endpoint (no anon write path).
 */
export async function pruneCspReports(): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase) return;

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - CSP_REPORTS_RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString();

  const { error: ageError } = await supabase
    .from("csp_reports")
    .delete()
    .lt("last_seen_at", cutoffIso);
  if (ageError) {
    console.error("[csp-report] age prune failed:", ageError.message);
  }

  const { count, error: countError } = await supabase
    .from("csp_reports")
    .select("id", { count: "exact", head: true });
  if (countError) {
    console.error("[csp-report] count failed:", countError.message);
    return;
  }

  const total = count ?? 0;
  if (total <= CSP_REPORTS_MAX_ROWS) return;

  const overflow = total - CSP_REPORTS_MAX_ROWS;
  const { data: oldest, error: oldestError } = await supabase
    .from("csp_reports")
    .select("id")
    .order("last_seen_at", { ascending: true })
    .limit(overflow);

  if (oldestError) {
    console.error("[csp-report] overflow select failed:", oldestError.message);
    return;
  }

  const ids = (oldest ?? []).map((row) => row.id).filter(Boolean);
  if (ids.length === 0) return;

  const { error: trimError } = await supabase
    .from("csp_reports")
    .delete()
    .in("id", ids);
  if (trimError) {
    console.error("[csp-report] overflow prune failed:", trimError.message);
  }
}
