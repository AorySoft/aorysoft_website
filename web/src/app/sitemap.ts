import type { MetadataRoute } from "next";
import { getIndexablePages } from "@/lib/seo/indexable";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getIndexablePages();
  const now = new Date();

  return pages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: page.lastModified ? new Date(page.lastModified) : now,
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
