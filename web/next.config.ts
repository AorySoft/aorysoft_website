import type { NextConfig } from "next";

/**
 * Security headers (FRONTEND_AUDIT F01 + Batch 2 CSP follow-up).
 *
 * CSP is Report-Only until production reports are reviewed — do not flip to
 * enforcing Content-Security-Policy without that review.
 *
 * Allowed CSP sources and why:
 * - 'self' — app origin (HTML, Next bundles, same-origin APIs)
 * - script-src challenges.cloudflare.com — Turnstile widget
 * - script-src static.cloudflareinsights.com — Cloudflare Web Analytics beacon
 * - script-src va.vercel-scripts.com — Vercel Analytics
 * - script-src 'unsafe-inline' — Next.js / React inline bootstrap scripts
 * - style-src 'unsafe-inline' — Tailwind + Next inline style tags
 * - img-src data: blob: — inline/SVG and client-generated previews
 * - img-src https://*.supabase.co — Supabase Storage media (covers, avatars)
 * - font-src 'self' data: — next/font self-hosted files (+ data URLs)
 * - connect-src *.supabase.co + wss — Supabase REST/Auth/Realtime
 * - connect-src challenges.cloudflare.com — Turnstile siteverify (server also; client may ping)
 * - connect-src static.cloudflareinsights.com — analytics beacon
 * - connect-src vitals.vercel-insights.com / va.vercel-scripts.com — Vercel Analytics
 * - frame-src challenges.cloudflare.com — Turnstile iframe
 * - frame-ancestors 'none' — clickjacking protection (pairs with X-Frame-Options)
 * - worker-src 'self' blob: — Next / Turnstile workers if used
 * - base-uri 'self' — block injected <base> hijacks
 * - form-action 'self' — forms/server actions stay same-origin (Turnstile uses
 *   frame/fetch, not cross-origin form posts — verified safe for current forms)
 * - object-src 'none' — no Flash/plugins
 * - report-uri / report-to — POST violations to /api/csp-report
 *
 * Fonts are loaded via next/font (self-hosted at build), so fonts.googleapis.com
 * is intentionally omitted.
 */
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    "https://challenges.cloudflare.com",
    "https://static.cloudflareinsights.com",
    "https://va.vercel-scripts.com",
  ].join(" "),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  [
    "connect-src",
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://challenges.cloudflare.com",
    "https://static.cloudflareinsights.com",
    "https://vitals.vercel-insights.com",
    "https://va.vercel-scripts.com",
  ].join(" "),
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
  "report-uri /api/csp-report",
  "report-to csp",
].join("; ");

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

function supabaseImageHosts(): { protocol: "https"; hostname: string; pathname: string }[] {
  const patterns: { protocol: "https"; hostname: string; pathname: string }[] = [
    {
      protocol: "https",
      hostname: "*.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      if (hostname && hostname !== "localhost") {
        patterns.unshift({
          protocol: "https",
          hostname,
          pathname: "/storage/v1/object/public/**",
        });
      }
    } catch {
      // ignore malformed env during local tooling
    }
  }
  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImageHosts(),
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

export default nextConfig;
