import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CapabilityVignette from "./CapabilityVignettes";
import type { VignetteKind } from "./serviceModel";

afterEach(cleanup);

const KINDS: VignetteKind[] = ["chat", "agent", "workflow", "insight", "deploy", "build", "schema"];

// Honesty rule: illustrative scenes never show metrics, money, periods, or results.
const FIGURES = /\d+\s?%|[$€£]\s?\d|\b\d+(\.\d+)?\s?(k|m|x)\b|last \d+ (days?|weeks?|months?)|saved|increase|uplift/i;

describe("CapabilityVignette honesty", () => {
  it.each(KINDS)("the %s scene contains no figures or results", (kind) => {
    const { container } = render(<CapabilityVignette kind={kind} />);
    expect(container.textContent ?? "").not.toMatch(FIGURES);
  });
});
