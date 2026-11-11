import { canView } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import SetupNotice from "../SetupNotice";
import {
  AdminEmptyState,
  AdminTableBody,
  AdminTableHead,
  AdminTableShell,
} from "../components/AdminTableShell";

export const metadata = { title: "Admin — CSP reports" };

/**
 * Owner-only read view of deduped CSP Report-Only violations.
 * Review for 7–14 days before flipping CSP to enforce.
 */
export default async function CspReportsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">CSP reports</h1>
        <SetupNotice what="CSP report storage needs a connected Supabase project" />
      </div>
    );
  }

  const { role } = await getSessionRole();
  // Owner-only (settings area); editors must not see CSP violation details.
  if (role !== "owner" || !canView(role, "settings")) {
    return (
      <div className="rounded-atelier-lg border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        CSP report review is owner-only.
      </div>
    );
  }

  const service = getServiceClient();
  if (!service) {
    return <SetupNotice what="SUPABASE_SERVICE_ROLE_KEY is not configured" />;
  }

  const { data, error } = await service
    .from("csp_reports")
    .select(
      "id, directive, blocked_uri, document_path, hit_count, first_seen_at, last_seen_at",
    )
    .order("last_seen_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">CSP reports</h1>
        <p role="alert" className="rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Could not load CSP reports: {error.message}. Apply{" "}
          <code className="font-mono text-ink">supabase/0011_csp_reports.sql</code>{" "}
          if the table is missing.
        </p>
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CSP reports</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-subtle">
          Deduped Report-Only violations from browsers. Review for at least 7–14
          days of production traffic before enforcing Content-Security-Policy.
          Look for repeated blocks of Turnstile, Supabase, analytics, or Next
          inline scripts.
        </p>
        <p className="mt-2 text-xs text-ink-subtle">
          SQL:{" "}
          <code className="font-mono">
            select * from csp_reports order by last_seen_at desc;
          </code>
        </p>
      </div>

      {rows.length === 0 ? (
        <AdminEmptyState
          title="No CSP reports yet"
          description="Violations appear here after browsers POST to /api/csp-report under Report-Only CSP."
        />
      ) : (
        <AdminTableShell>
          <AdminTableHead>
            <tr>
              <th scope="col" className="px-4 py-3">Directive</th>
              <th scope="col" className="px-4 py-3">Blocked URI</th>
              <th scope="col" className="px-4 py-3">Document</th>
              <th scope="col" className="px-4 py-3">Count</th>
              <th scope="col" className="px-4 py-3">First</th>
              <th scope="col" className="px-4 py-3">Last</th>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface/80">
                <td className="px-4 py-3 font-mono text-xs text-ink">{row.directive}</td>
                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-ink-muted">
                  {row.blocked_uri || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                  {row.document_path || "—"}
                </td>
                <td className="px-4 py-3 text-ink-muted">{row.hit_count}</td>
                <td className="px-4 py-3 text-ink-subtle">
                  {new Date(row.first_seen_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-ink-subtle">
                  {new Date(row.last_seen_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </AdminTableBody>
        </AdminTableShell>
      )}
    </div>
  );
}
