import path from "node:path";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import {
  supabaseImagePattern,
  type SupabaseImagePattern,
} from "./src/lib/image-remote-patterns";
import { cspReportOnly } from "./src/lib/csp-policy";

// CSP sources and rationale live in src/lib/csp-policy.ts.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // Reporting API endpoint group (pairs with CSP report-to csp).
  {
    key: "Reporting-Endpoints",
    value: 'csp="/api/csp-report"',
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: cspReportOnly,
  },
];

/**
 * F16: only our exact Supabase project host + public storage path.
 * `next build` fails with a clear message when NEXT_PUBLIC_SUPABASE_URL is
 * missing; dev/other phases fall back to no remote images instead of crashing.
 */
function imageRemotePatterns(phase: string): SupabaseImagePattern[] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (phase === PHASE_PRODUCTION_BUILD) return [supabaseImagePattern(url)];
  try {
    return [supabaseImagePattern(url)];
  } catch (error) {
    console.warn(
      `[next.config] ${error instanceof Error ? error.message : String(error)} Remote images are disabled for this run.`,
    );
    return [];
  }
}

export default function nextConfig(phase: string): NextConfig {
  return {
    // Pin the workspace root to web/ (a stray lockfile in the user profile
    // otherwise makes Turbopack infer the wrong root).
    turbopack: { root: path.resolve(__dirname) },
    images: {
      remotePatterns: imageRemotePatterns(phase),
    },
    async headers() {
      return [
        {
          source: "/:path*",
          headers: securityHeaders,
        },
      ];
    },
  };
}
