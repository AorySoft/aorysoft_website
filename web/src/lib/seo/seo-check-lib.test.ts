import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkPageContent,
  isEnvironmentError,
  normalizePath,
  readSiteDefaults,
} from "../../../scripts/seo-check-lib.mjs";
import { SITE_DEFAULT_TITLE, SITE_DESCRIPTION } from "@/lib/site";

const defaults = {
  defaultTitle: "AorySoft | AI-first solutions, real-world impact",
  defaultDescription: "Site default description.",
};

function page({
  title = "About | AorySoft",
  description = "About AorySoft.",
  canonical = "https://www.aorysoft.com/about",
  robots = "index, follow",
  h1 = "How we build",
  jsonLd = true,
} = {}) {
  return [
    "<html><head>",
    title === null ? "" : `<title>${title}</title>`,
    description === null ? "" : `<meta name="description" content="${description}"/>`,
    canonical === null ? "" : `<link rel="canonical" href="${canonical}"/>`,
    `<meta name="robots" content="${robots}"/>`,
    jsonLd ? '<script type="application/ld+json">{}</script>' : "",
    "</head><body>",
    h1 === null ? "" : `<h1>${h1}</h1>`,
    "</body></html>",
  ].join("");
}

const run = (html: string, p = "/about", xRobotsTag: string | null = null) =>
  checkPageContent({ path: p, html, xRobotsTag, defaults });

describe("checkPageContent", () => {
  it("passes a complete page", () => {
    expect(run(page())).toEqual([]);
  });

  it("flags a page that falls back to the site default title", () => {
    expect(run(page({ title: defaults.defaultTitle }))).toContain(
      "/about: <title> is the site default — set a page title",
    );
  });

  it("allows the default title on the home page only", () => {
    expect(
      run(page({ title: defaults.defaultTitle, canonical: "https://www.aorysoft.com" }), "/"),
    ).toEqual([]);
  });

  it("flags the site default description on inner pages", () => {
    expect(run(page({ description: defaults.defaultDescription }))).toContain(
      "/about: meta description is the site default — set a page description",
    );
  });

  it("flags a canonical that does not match the URL path", () => {
    expect(run(page({ canonical: "https://www.aorysoft.com/" }))).toContain(
      "/about: canonical points to /, expected /about",
    );
  });

  it("flags noindex via meta robots or X-Robots-Tag", () => {
    expect(run(page({ robots: "noindex, nofollow" }))).toContain(
      "/about: page is noindex (meta robots) but listed in the sitemap",
    );
    expect(run(page(), "/about", "noindex")).toContain(
      "/about: page is noindex (X-Robots-Tag) but listed in the sitemap",
    );
  });

  it("flags missing title, description, canonical, h1 and JSON-LD", () => {
    const failures = run(
      page({ title: null as never, description: null as never, canonical: null as never, h1: null as never, jsonLd: false }),
    );
    expect(failures).toEqual([
      "/about: missing <title>",
      "/about: missing meta description",
      "/about: missing canonical",
      "/about: missing <h1>",
      "/about: missing JSON-LD",
    ]);
  });
});

describe("helpers", () => {
  it("normalizes paths", () => {
    expect(normalizePath("https://www.aorysoft.com")).toBe("/");
    expect(normalizePath("https://www.aorysoft.com/about/")).toBe("/about");
    expect(normalizePath("/services/ai-agents")).toBe("/services/ai-agents");
  });

  it("reads the real defaults from src/lib/site.ts", () => {
    const source = readFileSync(path.resolve(__dirname, "../site.ts"), "utf8");
    expect(readSiteDefaults(source)).toEqual({
      defaultTitle: SITE_DEFAULT_TITLE,
      defaultDescription: SITE_DESCRIPTION,
    });
  });

  it("classifies network errors as environment errors, not content failures", () => {
    expect(isEnvironmentError(new TypeError("fetch failed"))).toBe(true);
    expect(isEnvironmentError({ cause: { code: "ECONNREFUSED" } })).toBe(true);
    expect(isEnvironmentError(new Error("/about: missing <h1>"))).toBe(false);
  });
});
