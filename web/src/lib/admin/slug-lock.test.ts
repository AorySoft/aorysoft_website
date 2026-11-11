import { describe, expect, it } from "vitest";
import {
  SLUG_LOCKED_MESSAGE,
  friendlySlugError,
  isSlugLocked,
  meetsPublishThreshold,
} from "./slug-lock";

const publishedService = {
  slug: "ai-agents",
  active: true,
  description: "Overview",
  deliverables: ["a", "b", "c", "d"],
};

describe("isSlugLocked", () => {
  it("never locks posts or categories", () => {
    expect(isSlugLocked("posts", { slug: "x", status: "published" })).toBe(false);
    expect(isSlugLocked("categories", { slug: "x" })).toBe(false);
  });

  it("locks a service only once its detail page meets the publish threshold", () => {
    expect(isSlugLocked("services", { ...publishedService, deliverables: ["a"] })).toBe(
      false,
    );
    expect(isSlugLocked("services", { ...publishedService, active: false })).toBe(false);
    expect(isSlugLocked("services", publishedService)).toBe(true);
  });

  it("locks a case study once published", () => {
    expect(isSlugLocked("cases", { slug: "acme", status: "draft" })).toBe(false);
    expect(isSlugLocked("cases", { slug: "acme", status: "published" })).toBe(true);
  });

  it("stays locked after unpublishing when slug_locked_at is set", () => {
    expect(
      isSlugLocked("cases", {
        slug: "acme",
        status: "draft",
        slug_locked_at: "2026-11-01T00:00:00Z",
      }),
    ).toBe(true);
    expect(
      isSlugLocked("services", {
        ...publishedService,
        active: false,
        slug_locked_at: "2026-11-01T00:00:00Z",
      }),
    ).toBe(true);
  });

  it("does not lock without a slug", () => {
    expect(meetsPublishThreshold("cases", { slug: "", status: "published" })).toBe(false);
    expect(isSlugLocked("cases", null)).toBe(false);
  });
});

describe("friendlySlugError", () => {
  it("maps a duplicate slug to a friendly field error", () => {
    expect(
      friendlySlugError(
        {
          code: "23505",
          message: 'duplicate key value violates unique constraint "services_slug_unique"',
        },
        "Service",
      ),
    ).toEqual({
      slug: "That slug is already used by another service. Choose a different one.",
    });
  });

  it("maps the 0016 trigger error to the lock message", () => {
    expect(
      friendlySlugError({ code: "P0001", message: "slug_locked: services" }, "Service"),
    ).toEqual({ slug: SLUG_LOCKED_MESSAGE });
  });

  it("ignores unrelated errors", () => {
    expect(friendlySlugError({ code: "23505", message: "email exists" }, "Service")).toBeNull();
    expect(friendlySlugError(null, "Service")).toBeNull();
  });
});
