import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const from = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  getServiceClient: () => ({ rpc, from }),
}));

import {
  CSP_PRUNE_INTERVAL_MS,
  pruneCspReports,
  recordCspReports,
  resetPruneThrottleForTests,
} from "./csp-reports";

const row = { directive: "img-src", blockedUri: "https://x.example/a.png", documentPath: "/" };

/** Minimal chainable builder for the legacy fallback path. */
function legacyBuilder() {
  const calls: string[] = [];
  const builder: Record<string, unknown> = {};
  for (const m of ["select", "eq", "update", "delete", "lt", "order", "limit", "in"]) {
    builder[m] = (...args: unknown[]) => {
      calls.push(m);
      void args;
      return builder;
    };
  }
  builder.maybeSingle = () => Promise.resolve({ data: null, error: null });
  builder.insert = () => {
    calls.push("insert");
    return Promise.resolve({ error: null });
  };
  builder.then = (resolve: (v: unknown) => void) =>
    resolve({ data: [], error: null, count: 0 });
  return { builder, calls };
}

beforeEach(() => {
  rpc.mockReset();
  from.mockReset();
  resetPruneThrottleForTests();
});

describe("recordCspReports", () => {
  it("uses the atomic record_csp_report RPC", async () => {
    rpc.mockResolvedValue({ error: null });
    await recordCspReports([row]);
    expect(rpc).toHaveBeenCalledWith("record_csp_report", {
      p_directive: "img-src",
      p_blocked_uri: "https://x.example/a.png",
      p_document_path: "/",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("falls back to the legacy path when the function is not deployed", async () => {
    rpc.mockResolvedValue({ error: { code: "PGRST202", message: "not found" } });
    const { builder, calls } = legacyBuilder();
    from.mockReturnValue(builder);
    await recordCspReports([row]);
    expect(from).toHaveBeenCalledWith("csp_reports");
    expect(calls).toContain("insert");
  });

  it("does not fall back on other errors", async () => {
    rpc.mockResolvedValue({ error: { code: "XX000", message: "boom" } });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await recordCspReports([row]);
    expect(from).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("pruneCspReports throttle", () => {
  it("prunes at most once per interval", async () => {
    rpc.mockResolvedValue({ error: null });
    const t0 = 1_000_000;
    await pruneCspReports(t0);
    await pruneCspReports(t0 + 1_000);
    await pruneCspReports(t0 + CSP_PRUNE_INTERVAL_MS - 1);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("prune_csp_reports", {
      p_retention_days: 30,
      p_max_rows: 500,
    });

    await pruneCspReports(t0 + CSP_PRUNE_INTERVAL_MS);
    expect(rpc).toHaveBeenCalledTimes(2);
  });
});
