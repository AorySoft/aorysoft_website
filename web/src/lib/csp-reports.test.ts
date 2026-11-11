import { describe, expect, it } from "vitest";
import { extractCspReports, normalizeCspReport } from "./csp-reports";

describe("normalizeCspReport", () => {
  it("maps legacy CSP fields", () => {
    expect(
      normalizeCspReport({
        "effective-directive": "script-src",
        "blocked-uri": "https://evil.example/x.js",
        "document-uri": "https://www.aorysoft.com/contact",
      }),
    ).toEqual({
      directive: "script-src",
      blockedUri: "https://evil.example/x.js",
      documentPath: "/contact",
    });
  });

  it("returns null without a directive", () => {
    expect(normalizeCspReport({ "blocked-uri": "https://x" })).toBeNull();
  });
});

describe("extractCspReports", () => {
  it("reads Reporting API batches", () => {
    const rows = extractCspReports([
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "img-src",
          blockedURI: "https://cdn.example/a.png",
          documentURL: "https://www.aorysoft.com/blog",
        },
      },
    ]);
    expect(rows).toEqual([
      {
        directive: "img-src",
        blockedUri: "https://cdn.example/a.png",
        documentPath: "/blog",
      },
    ]);
  });
});
