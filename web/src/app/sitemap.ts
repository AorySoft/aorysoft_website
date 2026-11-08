// Dynamic sitemap (SEO). Lists the static marketing routes plus every published
// blog post. Runs at build/regeneration time; the posts query reuses the anon
// client so RLS still applies (only `published` rows are visible to anon).
import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/careers`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/quote`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Published posts only; a null result (Supabase not connected) yields the
  // static routes alone rather than failing the sitemap.
  const posts = await getPublishedPosts();
  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
