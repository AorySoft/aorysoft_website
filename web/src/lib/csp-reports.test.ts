import { describe, expect, it } from "vitest";
import { extractCspReports, normalizeCspReport, stripUriQuery } from "./csp-reports";

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

describe("stripUriQuery (via normalizeCspReport)", () => {
  it("drops query strings and fragments from blocked URIs", () => {
    expect(
      normalizeCspReport({
        "effective-directive": "connect-src",
        "blocked-uri": "https://evil.example/collect?token=secret#frag",
        "document-uri": "https://www.aorysoft.com/newsletter/confirm?token=abc",
      }),
    ).toEqual({
      directive: "connect-src",
      blockedUri: "https://evil.example/collect",
      documentPath: "/newsletter/confirm",
    });
  });

  it("keeps CSP keywords and reduces data: URIs to the scheme", () => {
    expect(stripUriQuery("inline")).toBe("inline");
    expect(stripUriQuery("eval")).toBe("eval");
    expect(stripUriQuery("data:image/png;base64,AAAA")).toBe("data");
    expect(stripUriQuery("relative/path?x=1")).toBe("relative/path");
  });
});
