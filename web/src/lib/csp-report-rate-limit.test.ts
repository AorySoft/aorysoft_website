import { describe, expect, it } from "vitest";
import { allowCspReport } from "./csp-report-rate-limit";

describe("allowCspReport", () => {
  it("allows a burst under the per-IP cap then rejects", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    let allowed = 0;
    let denied = 0;
    for (let i = 0; i < 45; i += 1) {
      if (allowCspReport(key)) allowed += 1;
      else denied += 1;
    }
    expect(allowed).toBe(40);
    expect(denied).toBe(5);
  });
});
