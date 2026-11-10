import { describe, expect, it } from "vitest";
import type { ServiceRow } from "@/lib/types";
import {
  PLACEHOLDER_CAPABILITIES,
  findCapabilityIndex,
  toCapabilities,
  vignetteFor,
} from "./serviceModel";

const row = (overrides: Partial<ServiceRow>): ServiceRow => ({
  id: "id-1",
  title: "Service",
  subtitle: null,
  description: null,
  features: [],
  icon: null,
  color: null,
  sort_order: 0,
  active: true,
  created_at: "",
  updated_at: "",
  ...overrides,
});

describe("toCapabilities", () => {
  it("falls back to placeholders when the CMS returns nothing", () => {
    expect(toCapabilities(null)).toBe(PLACEHOLDER_CAPABILITIES);
    expect(toCapabilities([])).toBe(PLACEHOLDER_CAPABILITIES);
  });

  it("keys capabilities by row id so duplicate titles stay distinct", () => {
    const list = toCapabilities([
      row({ id: "a", title: "Same" }),
      row({ id: "b", title: "Same" }),
    ]);
    expect(list.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("normalises missing optional fields", () => {
    const [item] = toCapabilities([row({ icon: null, subtitle: null, description: null })]);
    expect(item).toMatchObject({ iconKey: "bot", subtitle: "", description: "", features: [] });
  });
});

describe("findCapabilityIndex", () => {
  const list = toCapabilities([
    row({ id: "1", icon: "bot" }),
    row({ id: "2", icon: "zap" }),
    row({ id: "3", icon: "code" }),
  ]);

  it("honours key priority order, not list order", () => {
    expect(findCapabilityIndex(list, ["zap", "bot"])).toBe(1);
  });

  it("returns -1 when no capability matches", () => {
    expect(findCapabilityIndex(list, ["brain"])).toBe(-1);
  });
});

describe("vignetteFor", () => {
  it("maps known icons and falls back to the build scene", () => {
    expect(vignetteFor("bot")).toBe("chat");
    expect(vignetteFor("zap")).toBe("workflow");
    expect(vignetteFor("unknown")).toBe("build");
  });
});
