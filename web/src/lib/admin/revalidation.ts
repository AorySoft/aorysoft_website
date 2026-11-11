import type { ResourceKey } from "./resource-types";
import { resources } from "./resource-catalog";

export type RevalidationTarget = { path: string; type?: "page" | "layout" };

/**
 * Resources whose publish state changes public chrome or crawl surfaces:
 * nav/footer gates (Blog, Case studies) live in the (marketing) layout, the
 * sitemap/llms list them, and some pages are fully static. Editing these
 * must refresh the whole public layout tree + the sitemap (FRONTEND_AUDIT N1).
 */
const LAYOUT_AFFECTING: ReadonlySet<ResourceKey> = new Set([
  "posts",
  "services",
  "cases",
  "reviews",
]);

/** Every path to revalidate after an admin create/update/delete. */
export function revalidationTargets(key: ResourceKey): RevalidationTarget[] {
  const targets: RevalidationTarget[] = resources[key].revalidate.map((path) => ({
    path,
  }));

  // Dynamic routes: the "page" form revalidates every instance of the pattern.
  if (key === "posts") targets.push({ path: "/blog/[slug]", type: "page" });
  if (key === "services") targets.push({ path: "/services/[slug]", type: "page" });
  if (key === "cases") targets.push({ path: "/work" });
  if (key === "reviews") targets.push({ path: "/reviews" });

  if (LAYOUT_AFFECTING.has(key)) {
    targets.push({ path: "/", type: "layout" });
    targets.push({ path: "/sitemap.xml" });
  }

  targets.push({ path: `/admin/${key}` });

  // De-duplicate while keeping order.
  const seen = new Set<string>();
  return targets.filter((target) => {
    const id = `${target.type ?? ""}:${target.path}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
