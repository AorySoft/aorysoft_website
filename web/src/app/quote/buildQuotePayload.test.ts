import { describe, expect, it } from "vitest";
import { buildQuotePayload } from "./buildQuotePayload";
import { initialData } from "./quoteOptions";

describe("buildQuotePayload", () => {
  it("keeps honeypot from the form and adds wizard fields", () => {
    const form = document.createElement("form");
    const honeypot = document.createElement("input");
    honeypot.name = "website";
    honeypot.value = "";
    form.appendChild(honeypot);
    const turnstile = document.createElement("input");
    turnstile.name = "turnstileToken";
    turnstile.value = "tok";
    form.appendChild(turnstile);

    const data = {
      ...initialData,
      name: "Ada",
      email: "ada@example.com",
      projectType: "Web Application",
      budget: "Let's discuss",
      timeline: "Flexible",
      description: "Build a site",
      technologies: ["React", "Node.js"],
      integrations: ["CRM Systems"],
    };

    const payload = buildQuotePayload(form, data);
    expect(payload.get("website")).toBe("");
    expect(payload.get("turnstileToken")).toBe("tok");
    expect(payload.get("name")).toBe("Ada");
    expect(payload.getAll("technologies")).toEqual(["React", "Node.js"]);
    expect(payload.getAll("integrations")).toEqual(["CRM Systems"]);
  });
});
