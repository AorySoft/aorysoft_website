import { describe, expect, it } from "vitest";
import { cspReportOnly } from "./csp-policy";

function directive(name: string): string[] {
  const found = cspReportOnly
    .split(";")
    .map((d) => d.trim().split(/\s+/))
    .find(([n]) => n === name);
  if (!found) throw new Error(`missing directive ${name}`);
  return found.slice(1);
}

describe("cspReportOnly", () => {
  it("allows the Vercel Toolbar's recommended sources", () => {
    expect(directive("img-src")).toEqual(
      expect.arrayContaining(["https://vercel.live", "https://vercel.com", "data:", "blob:"]),
    );
    expect(directive("script-src")).toContain("https://vercel.live");
    expect(directive("style-src")).toContain("https://vercel.live");
    expect(directive("frame-src")).toContain("https://vercel.live");
    expect(directive("font-src")).toEqual(
      expect.arrayContaining(["https://vercel.live", "https://assets.vercel.com"]),
    );
    expect(directive("connect-src")).toEqual(
      expect.arrayContaining(["https://vercel.live", "wss://ws-us3.pusher.com"]),
    );
  });

  it("keeps clickjacking and plugin protections", () => {
    expect(directive("frame-ancestors")).toEqual(["'none'"]);
    expect(directive("object-src")).toEqual(["'none'"]);
  });
});
