import type { MetadataRoute } from "next";
import type { IndexablePage } from "@/lib/seo/indexable";
import { absoluteUrl } from "@/lib/site";

/**
 * lastmod only when we have a real timestamp (posts, services from
 * updated_at). Static pages omit it — a build-time "now" is noise that
 * crawlers learn to ignore (FRONTEND_AUDIT N5).
 */
export function toSitemapEntries(pages: IndexablePage[]): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: absoluteUrl(page.path),
    ...(page.lastModified ? { lastModified: new Date(page.lastModified) } : {}),
    changeFrequency:
      page.path === "/" || page.path.startsWith("/blog")
        ? ("weekly" as const)
        : page.path === "/privacy" || page.path === "/terms"
          ? ("yearly" as const)
          : ("monthly" as const),
    priority:
      page.path === "/"
        ? 1
        : page.path === "/services" || page.path.startsWith("/services/")
          ? 0.9
          : page.path === "/contact" || page.path === "/quote"
            ? 0.8
            : 0.6,
  }));
}
