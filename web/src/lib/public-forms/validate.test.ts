import { describe, expect, it } from "vitest";
import {
  validateContactForm,
  validateQuoteForm,
  validEmail,
} from "./validate";

const validContact = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  subject: "project",
  message: "We'd like to discuss an automation project.",
};

describe("validateContactForm", () => {
  it("accepts a complete submission and normalises it", () => {
    const result = validateContactForm({ ...validContact, email: "  Ada@Example.COM " });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Email is lowercased + trimmed so the DB unique/compare behaves sanely.
    expect(result.value.email).toBe("ada@example.com");
    expect(result.value.type).toBe("contact");
    expect(result.value.company).toBe("Analytical Engines");
  });

  it("treats a blank optional company as null rather than an empty string", () => {
    const result = validateContactForm({ ...validContact, company: "   " });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.company).toBeNull();
  });

  it("rejects a missing required name", () => {
    const result = validateContactForm({ ...validContact, name: "  " });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.field === "name")).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = validateContactForm({ ...validContact, email: "not-an-email" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.field === "email")).toBe(true);
  });

  it("rejects a subject outside the allowed set (mirrors the enum CHECK)", () => {
    const result = validateContactForm({ ...validContact, subject: "spam" });
    expect(result.ok).toBe(false);
  });

  it("enforces the message length cap", () => {
    const result = validateContactForm({
      ...validContact,
      message: "x".repeat(5001),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.field === "message")).toBe(true);
  });

  it("enforces the name length cap", () => {
    const result = validateContactForm({
      ...validContact,
      name: "x".repeat(121),
    });
    expect(result.ok).toBe(false);
  });

  it("collects every error at once instead of failing on the first field", () => {
    const result = validateContactForm({
      name: "",
      email: "nope",
      subject: "nope",
      message: "",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it("rejects a null/undefined payload without throwing", () => {
    expect(validateContactForm(null).ok).toBe(false);
    expect(validateContactForm(undefined).ok).toBe(false);
    expect(validateContactForm({}).ok).toBe(false);
  });
});

describe("validateQuoteForm", () => {
  const validQuote = {
    name: "Grace Hopper",
    email: "grace@example.com",
    company: "Navy",
    phone: "+1 (555) 000-1111",
    projectType: "Custom Software",
    budget: "$25,000 - $50,000",
    timeline: "3-6 months",
    description: "A compiler-driven automation platform.",
    technologies: ["Python", " React ", ""],
    integrations: ["CRM Systems"],
    scalability: "high",
    additionalNotes: "Must run on-prem.",
  };

  it("accepts a complete quote and packs the details JSONB", () => {
    const result = validateQuoteForm(validQuote);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe("quote");
    expect(result.value.service).toBe("Custom Software");
    // Trims and drops blanks from the multi-selects.
    expect(result.value.details.technologies).toEqual(["Python", "React"]);
    expect(result.value.details.scalability).toBe("high");
    expect(result.value.details.additionalNotes).toBe("Must run on-prem.");
  });

  it("accepts an empty multi-select and missing optional fields", () => {
    const result = validateQuoteForm({
      name: "A",
      email: "a@b.co",
      projectType: "Web Application",
      budget: "Under $10,000",
      timeline: "1-3 months",
      description: "Something small.",
      technologies: [],
      integrations: [],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.details.technologies).toEqual([]);
    expect(result.value.details.scalability).toBeNull();
    expect(result.value.details.additionalNotes).toBeNull();
    expect(result.value.company).toBeNull();
  });

  it("rejects a project type / budget / timeline that is missing", () => {
    const result = validateQuoteForm({
      ...validQuote,
      projectType: "",
      budget: "",
      timeline: "",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toEqual(
      expect.arrayContaining(["projectType", "budget", "timeline"]),
    );
  });

  it("rejects an over-long description", () => {
    const result = validateQuoteForm({
      ...validQuote,
      description: "x".repeat(5001),
    });
    expect(result.ok).toBe(false);
  });

  it("rejects too many selected options", () => {
    const result = validateQuoteForm({
      ...validQuote,
      technologies: new Array(21).fill("Python"),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.field === "technologies")).toBe(true);
  });

  it("rejects a non-array selection payload", () => {
    const result = validateQuoteForm({ ...validQuote, technologies: "Python" });
    expect(result.ok).toBe(false);
  });

  it("rejects an unknown scalability value", () => {
    const result = validateQuoteForm({ ...validQuote, scalability: "enormous" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.field === "scalability")).toBe(true);
  });

  it("rejects a non-string entry inside a selection", () => {
    const result = validateQuoteForm({
      ...validQuote,
      integrations: [{ evil: true }],
    });
    expect(result.ok).toBe(false);
  });
});

describe("validEmail", () => {
  it("normalises case and whitespace", () => {
    const result = validEmail("  Person@Example.ORG ");
    expect(result).toEqual({ ok: true, value: "person@example.org" });
  });

  it("rejects empty, malformed and over-long addresses", () => {
    expect(validEmail("").ok).toBe(false);
    expect(validEmail("a@b").ok).toBe(false);
    expect(validEmail(`a@${"b".repeat(250)}.com`).ok).toBe(false);
    expect(validEmail(42).ok).toBe(false);
    expect(validEmail(null).ok).toBe(false);
  });
});
