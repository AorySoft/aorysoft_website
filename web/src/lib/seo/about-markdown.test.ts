import { describe, expect, it } from "vitest";
import {
  ABOUT_HEADING,
  ABOUT_HONESTY,
  ABOUT_LEAD,
  ABOUT_PILLARS,
  PROCESS_STEPS,
} from "@/lib/about-content";
import { buildAboutMarkdown } from "./about-markdown";

describe("buildAboutMarkdown", () => {
  const md = buildAboutMarkdown();

  it("contains every piece of shared About copy", () => {
    for (const text of [ABOUT_HEADING, ABOUT_LEAD, ABOUT_HONESTY]) {
      expect(md).toContain(text);
    }
    for (const pillar of ABOUT_PILLARS) {
      expect(md).toContain(`- ${pillar.title} — ${pillar.description}`);
    }
    PROCESS_STEPS.forEach((step, index) => {
      expect(md).toContain(`${index + 1}. ${step.title} — ${step.text}`);
    });
  });

  it("links back to the HTML page", () => {
    expect(md).toMatch(/- HTML: .*\/about$/m);
  });
});
