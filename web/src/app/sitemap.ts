import type { MetadataRoute } from "next";
import { getIndexablePages } from "@/lib/seo/indexable";
import { toSitemapEntries } from "@/lib/seo/sitemap-entries";

// ISR: admin publish/unpublish also revalidates /sitemap.xml on demand (N1).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return toSitemapEntries(await getIndexablePages());
}
