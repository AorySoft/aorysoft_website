// CSP Report-Only collector. Rate-limited, size-capped, persists deduped rows
// to Supabase for 7–14 day review (FRONTEND_AUDIT). robots Disallow: /api/.
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { allowCspReport } from "@/lib/csp-report-rate-limit";
import {
  extractCspReports,
  pruneCspReports,
  recordCspReports,
} from "@/lib/csp-reports";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 16_384;

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const ipKey = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  if (!allowCspReport(ipKey)) {
    return new NextResponse(null, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (text.length > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  let payload: unknown = null;
  if (text.trim()) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      return new NextResponse(null, { status: 204 });
    }
  }

  const rows = extractCspReports(payload);
  if (rows.length > 0) {
    console.info("[csp-report]", JSON.stringify(rows));
    try {
      await recordCspReports(rows);
    } catch (error) {
      console.error("[csp-report] persist failed:", error);
    }
  }

  // Opportunistic retention: 30-day age prune + 500-row hard cap.
  try {
    await pruneCspReports();
  } catch (error) {
    console.error("[csp-report] prune failed:", error);
  }

  return new NextResponse(null, { status: 204 });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { Allow: "POST, OPTIONS" },
  });
}
