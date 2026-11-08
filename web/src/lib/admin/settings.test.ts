import { describe, expect, it } from "vitest";
import { validateSettings } from "./settings";

describe("validateSettings", () => {
  it("accepts a well-formed payload", () => {
    const result = validateSettings({
      heroBadge: "AI-Powered Innovation",
      aboutText: "About copy",
      industries: [{ title: "Healthcare", description: "AI tools" }],
      technologies: [{ name: "Python", category: "Backend" }],
      socialLinks: [{ label: "LinkedIn", url: "https://linkedin.com/company/x" }],
    });
    expect(result.ok).toBe(true);
  });

  it("rejects non-object payloads", () => {
    expect(validateSettings("nope").ok).toBe(false);
    expect(validateSettings(null).ok).toBe(false);
  });

  it("rejects over-long scalars", () => {
    expect(validateSettings({ heroBadge: "x".repeat(121) }).ok).toBe(false);
  });

  it("rejects malformed industries entries", () => {
    expect(validateSettings({ industries: [{ title: "Only title" }] }).ok).toBe(
      false,
    );
    expect(validateSettings({ industries: "not-an-array" }).ok).toBe(false);
    expect(
      validateSettings({ industries: new Array(31).fill({ title: "a", description: "b" }) }).ok,
    ).toBe(false);
  });

  it("rejects social links without http(s) URLs", () => {
    expect(
      validateSettings({ socialLinks: [{ label: "X", url: "javascript:alert(1)" }] }).ok,
    ).toBe(false);
    expect(
      validateSettings({ socialLinks: [{ label: "X", url: "https://x.com" }] }).ok,
    ).toBe(true);
  });
});
