// Robots policy (SEO). Allows the marketing site, but blocks the admin panel
// and the newsletter token routes (which are noindexed in their HTML too).
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/feedback",
          "/newsletter/confirm",
          "/newsletter/unsubscribe",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
