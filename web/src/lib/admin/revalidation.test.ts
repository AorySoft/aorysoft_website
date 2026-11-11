import { describe, expect, it } from "vitest";
import { revalidationTargets } from "./revalidation";

const has = (
  targets: ReturnType<typeof revalidationTargets>,
  path: string,
  type?: "page" | "layout",
) => targets.some((t) => t.path === path && t.type === type);

describe("revalidationTargets", () => {
  it.each(["posts", "services", "cases", "reviews"] as const)(
    "%s refreshes the public layout (nav gates) and the sitemap",
    (key) => {
      const targets = revalidationTargets(key);
      expect(has(targets, "/", "layout")).toBe(true);
      expect(has(targets, "/sitemap.xml")).toBe(true);
    },
  );

  it("reviews also refresh the /reviews page", () => {
    expect(has(revalidationTargets("reviews"), "/reviews")).toBe(true);
  });

  it("cases refresh /work and services refresh every detail page", () => {
    expect(has(revalidationTargets("cases"), "/work")).toBe(true);
    expect(has(revalidationTargets("services"), "/services/[slug]", "page")).toBe(
      true,
    );
    expect(has(revalidationTargets("posts"), "/blog/[slug]", "page")).toBe(true);
  });

  it("jobs and categories do not purge the whole layout", () => {
    expect(has(revalidationTargets("jobs"), "/", "layout")).toBe(false);
    expect(has(revalidationTargets("categories"), "/", "layout")).toBe(false);
  });

  it("always refreshes the admin list and never repeats a target", () => {
    const targets = revalidationTargets("cases");
    expect(has(targets, "/admin/cases")).toBe(true);
    const ids = targets.map((t) => `${t.type ?? ""}:${t.path}`);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
