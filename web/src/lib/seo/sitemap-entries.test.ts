import { describe, expect, it, vi } from "vitest";
import { toSitemapEntries } from "./sitemap-entries";

vi.mock("@/lib/data", () => ({}));

describe("toSitemapEntries", () => {
  it("omits lastmod for static pages and keeps it for dated content", () => {
    const entries = toSitemapEntries([
      { path: "/about", title: "About", description: "d" },
      {
        path: "/blog/hello",
        title: "Hello",
        description: "d",
        lastModified: "2026-10-01T12:00:00Z",
      },
    ]);

    expect(entries[0]).not.toHaveProperty("lastModified");
    expect(entries[1].lastModified).toEqual(new Date("2026-10-01T12:00:00Z"));
  });

  it("keeps priorities for core pages", () => {
    const [home, services] = toSitemapEntries([
      { path: "/", title: "Home", description: "d" },
      { path: "/services/ai-agents", title: "Agents", description: "d" },
    ]);
    expect(home.priority).toBe(1);
    expect(services.priority).toBe(0.9);
  });
});
