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
 * - connect-src static.cloudflareinsights.com — analytics beacon script host
 * - connect-src cloudflareinsights.com — beacon POSTs RUM data to /cdn-cgi/rum
 *   (observed in Chromium during verification; required before enforcing)
 * - connect-src vitals.vercel-insights.com / va.vercel-scripts.com — Vercel Analytics
 *   (Speed Insights loads/posts via same-origin /_vercel/speed-insights on Vercel)
 * - vercel.live (+ vercel.com / assets.vercel.com / ws-us3.pusher.com) — Vercel
 *   Toolbar on preview/logged-in visits; values from Vercel's toolbar CSP docs
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
export const cspReportOnly = [
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
    "https://vercel.live",
  ].join(" "),
  "style-src 'self' 'unsafe-inline' https://vercel.live",
  "img-src 'self' data: blob: https://*.supabase.co https://vercel.live https://vercel.com",
  "font-src 'self' data: https://vercel.live https://assets.vercel.com",
  [
    "connect-src",
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://challenges.cloudflare.com",
    "https://static.cloudflareinsights.com",
    "https://cloudflareinsights.com",
    "https://vitals.vercel-insights.com",
    "https://va.vercel-scripts.com",
    "https://vercel.live",
    "wss://ws-us3.pusher.com",
  ].join(" "),
  "frame-src https://challenges.cloudflare.com https://vercel.live",
  "worker-src 'self' blob:",
  // upgrade-insecure-requests is ignored in Report-Only (Chromium logs an
  // error on every page). Re-add it when switching to an enforced CSP.
  "report-uri /api/csp-report",
  "report-to csp",
].join("; ");
