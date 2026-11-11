import { describe, expect, it } from "vitest";
import { MARK_PATHS, MARK_STOPS } from "@/components/brand/markGeometry";
import { markDataUri, markSvg } from "./mark-svg";

describe("markSvg", () => {
  it("draws the official geometry and gradient", () => {
    const svg = markSvg({ width: 40 });
    for (const d of MARK_PATHS) expect(svg).toContain(`d="${d}"`);
    for (const stop of MARK_STOPS) expect(svg).toContain(`stop-color="${stop.color}"`);
    expect(svg).toContain('width="40" height="37"');
  });

  it("is decorative by default and named only when a title is given", () => {
    expect(markSvg({ width: 32 })).toContain('aria-hidden="true"');
    const named = markSvg({ width: 32, title: "AorySoft" });
    expect(named).toContain('role="img"><title>AorySoft</title>');
    expect(named).not.toContain("aria-hidden");
  });

  it("encodes a base64 data URI for ImageResponse", () => {
    const uri = markDataUri(100);
    expect(uri.startsWith("data:image/svg+xml;base64,")).toBe(true);
    const decoded = Buffer.from(uri.split(",")[1], "base64").toString("utf8");
    expect(decoded).toContain(MARK_PATHS[0]);
  });
});
