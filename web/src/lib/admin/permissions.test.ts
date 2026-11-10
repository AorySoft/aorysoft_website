import { describe, expect, it } from "vitest";
import { canDelete, canEdit, canView, type Area } from "./permissions";

const CONTENT_AREAS: Area[] = [
  "posts",
  "categories",
  "services",
  "jobs",
  "reviews",
  "media",
];

describe("permission matrix (plan §5.5)", () => {
  it("denies everything for null role", () => {
    const areas: Area[] = [
      "posts",
      "categories",
      "services",
      "jobs",
      "reviews",
      "media",
      "submissions",
      "newsletter",
      "settings",
      "users",
    ];
    for (const area of areas) {
      expect(canView(null, area)).toBe(false);
      expect(canEdit(null, area)).toBe(false);
      expect(canDelete(null, area)).toBe(false);
    }
  });

  it("owner can view/edit/delete everywhere", () => {
    const areas: Area[] = [
      "posts",
      "categories",
      "services",
      "jobs",
      "reviews",
      "media",
      "submissions",
      "newsletter",
      "settings",
      "users",
    ];
    for (const area of areas) {
      expect(canView("owner", area)).toBe(true);
      expect(canEdit("owner", area)).toBe(true);
      expect(canDelete("owner", area)).toBe(true);
    }
  });

  it("editor can view/edit content areas and submissions", () => {
    for (const area of [...CONTENT_AREAS, "submissions"] as Area[]) {
      expect(canView("editor", area)).toBe(true);
      expect(canEdit("editor", area)).toBe(true);
    }
  });

  it("editor cannot access owner-only areas", () => {
    for (const area of ["newsletter", "settings", "users"] as Area[]) {
      expect(canView("editor", area)).toBe(false);
      expect(canEdit("editor", area)).toBe(false);
    }
  });

  it("no deletions for editor, anywhere", () => {
    for (const area of [
      "posts",
      "categories",
      "services",
      "jobs",
      "media",
      "submissions",
    ] as Area[]) {
      expect(canDelete("editor", area)).toBe(false);
    }
  });
});
