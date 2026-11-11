/**
 * Invisible Suspense boundary for the public pages (N7 option A).
 *
 * With a boundary, Next's static HTML paints the shell first and reveals the
 * page content in a second pass, which keeps LCP on slow CPUs at the
 * pre-Batch-8 level (measured: ~2.5 s vs ~3.1 s without it at 4x CPU).
 * It renders nothing, so no spinner ever appears in raw HTML; the page content
 * and its h1 stay in the HTML. Trade-off: visitors with JavaScript disabled
 * see a blank page, because the content is revealed by an inline script.
 */
export default function MarketingLoading() {
  return null;
}
