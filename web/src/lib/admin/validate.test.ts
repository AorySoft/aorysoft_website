import { describe, expect, it } from "vitest";
import {
  validateBoolean,
  validateEmail,
  validateEnum,
  validateInteger,
  validateOptionalDate,
  validateOptionalUuid,
  validateRequiredText,
  validateOptionalSlug,
  validateSlug,
  validateStringList,
} from "./validate";

describe("validateRequiredText", () => {
  it("accepts trimmed text within the cap", () => {
    const result = validateRequiredText("  Hello  ", 10, "Title");
    expect(result).toEqual({ ok: true, value: "Hello" });
  });

  it("rejects empty values", () => {
    expect(validateRequiredText("   ", 10, "Title").ok).toBe(false);
    expect(validateRequiredText(undefined, 10, "Title").ok).toBe(false);
  });

  it("rejects values over the cap (mirrors DB CHECK)", () => {
    const result = validateRequiredText("x".repeat(11), 10, "Title");
    expect(result.ok).toBe(false);
  });
});

describe("validateSlug", () => {
  it("accepts valid slugs", () => {
    expect(validateSlug("my-first-post")).toMatchObject({
      ok: true,
      value: "my-first-post",
    });
  });

  it("lowercases input", () => {
    expect(validateSlug("My-Post")).toMatchObject({ ok: true, value: "my-post" });
  });

  it("rejects invalid slugs (same regex as the DB CHECK)", () => {
    for (const bad of ["-lead", "trail-", "has space", "under_score", "", "double--hyphen"]) {
      expect(validateSlug(bad).ok, bad).toBe(false);
    }
  });
});

describe("validateOptionalSlug", () => {
  it("allows empty as null", () => {
    expect(validateOptionalSlug("")).toMatchObject({ ok: true, value: null });
    expect(validateOptionalSlug(undefined)).toMatchObject({
      ok: true,
      value: null,
    });
  });

  it("still rejects invalid non-empty values", () => {
    expect(validateOptionalSlug("Bad Slug").ok).toBe(false);
  });
});

describe("validateEmail", () => {
  it("accepts a normal email", () => {
    expect(validateEmail("user@example.com").ok).toBe(true);
  });

  it("rejects malformed emails", () => {
    for (const bad of ["plain", "a@b", "a b@c.com", "@example.com", ""]) {
      expect(validateEmail(bad).ok, bad).toBe(false);
    }
  });
});

describe("validateEnum", () => {
  it("accepts listed values and rejects others", () => {
    expect(validateEnum("draft", ["draft", "published"]).ok).toBe(true);
    expect(validateEnum("live", ["draft", "published"]).ok).toBe(false);
  });
});

describe("validateBoolean", () => {
  it("treats HTML checkbox 'on' as true", () => {
    expect(validateBoolean("on")).toEqual({ ok: true, value: true });
  });
  it("treats missing as false", () => {
    expect(validateBoolean(undefined)).toEqual({ ok: true, value: false });
  });
});

describe("validateInteger", () => {
  it("accepts whole numbers and empty", () => {
    expect(validateInteger("42")).toEqual({ ok: true, value: 42 });
    expect(validateInteger("")).toEqual({ ok: true, value: 0 });
  });
  it("rejects decimals", () => {
    expect(validateInteger("1.5").ok).toBe(false);
  });
});

describe("validateStringList", () => {
  it("splits newline text into cleaned items", () => {
    const result = validateStringList("  one \n\ntwo\n", 10, 50);
    expect(result).toEqual({ ok: true, value: ["one", "two"] });
  });

  it("accepts arrays and enforces caps", () => {
    expect(validateStringList(["a", "b"], 10, 50)).toEqual({
      ok: true,
      value: ["a", "b"],
    });
    expect(validateStringList(["x".repeat(51)], 10, 50).ok).toBe(false);
    expect(validateStringList(new Array(31).fill("x"), 30, 50).ok).toBe(false);
  });
});

describe("validateOptionalUuid", () => {
  it("accepts uuids and empty", () => {
    expect(validateOptionalUuid("c9a3f5c2-3f6a-4e2b-9f5e-1d2c3b4a5e6f").ok).toBe(
      true,
    );
    expect(validateOptionalUuid("").ok).toBe(true);
  });
  it("rejects non-uuids", () => {
    expect(validateOptionalUuid("123").ok).toBe(false);
  });
});

describe("validateOptionalDate", () => {
  it("accepts YYYY-MM-DD and empty", () => {
    expect(validateOptionalDate("2024-01-15").ok).toBe(true);
    expect(validateOptionalDate("").ok).toBe(true);
  });
  it("rejects other formats", () => {
    expect(validateOptionalDate("15/01/2024").ok).toBe(false);
    expect(validateOptionalDate("2024-13-99").ok).toBe(false);
  });
});
