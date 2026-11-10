import { describe, expect, it } from "vitest";
import { reachedFor } from "./ProcessLine";

describe("reachedFor", () => {
  it("lights nothing before the section and every step at the end", () => {
    expect(reachedFor(0)).toBe(0);
    expect(reachedFor(1)).toBe(5);
  });

  it("lights a step slightly before the fill reaches its node", () => {
    expect(reachedFor(0.15)).toBe(1);
    expect(reachedFor(0.5)).toBe(2);
  });

  it("clamps out-of-range progress", () => {
    expect(reachedFor(-0.2)).toBe(0);
    expect(reachedFor(1.4)).toBe(5);
  });
});
