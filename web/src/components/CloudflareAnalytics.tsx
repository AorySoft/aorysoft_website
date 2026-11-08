// Cloudflare Web Analytics (plan §10): cookie-free, no consent banner needed.
// Renders nothing until NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN is set, so local
// development and previews stay beacon-free. The token is public by design.
import Script from "next/script";

export default function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
  if (!token) return null;

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
    />
  );
}
