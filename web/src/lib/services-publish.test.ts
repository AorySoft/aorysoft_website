import { describe, expect, it } from "vitest";
import {
  isServiceDetailPublished,
  parseFaqLines,
  parseProcessStepLines,
} from "./services-publish";

describe("isServiceDetailPublished", () => {
  const base = {
    active: true,
    slug: "ai-chatbots",
    description: "We build chatbots.",
    deliverables: ["a", "b", "c", "d"],
  };

  it("requires active, slug, overview, and four deliverables", () => {
    expect(isServiceDetailPublished(base)).toBe(true);
    expect(isServiceDetailPublished({ ...base, active: false })).toBe(false);
    expect(isServiceDetailPublished({ ...base, slug: null })).toBe(false);
    expect(isServiceDetailPublished({ ...base, description: "  " })).toBe(false);
    expect(
      isServiceDetailPublished({ ...base, deliverables: ["a", "b", "c"] }),
    ).toBe(false);
  });
});

describe("pair line parsers", () => {
  it("parses process and FAQ lines", () => {
    expect(parseProcessStepLines(["Discover | Goals first", "bad"])).toEqual([
      { title: "Discover", text: "Goals first" },
    ]);
    expect(parseFaqLines(["What | Answer here"])).toEqual([
      { question: "What", answer: "Answer here" },
    ]);
  });
});
