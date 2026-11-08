import { beforeEach, describe, expect, it, vi } from "vitest";
import { RATE_LIMITS, checkRateLimit, resetRateLimits } from "./rate-limit";
import { getServiceClient } from "@/lib/supabase/admin";

const IP = "203.0.113.10";

// The limiter is persistent-by-default (Supabase RPC) but must keep working
// with no database at all. We mock the admin client so tests are offline and
// deterministic: by default getServiceClient() returns null, which routes every
// call through the in-memory fallback — the same path local dev and unit tests
// take. A second block flips the mock to a fake RPC to exercise persistence.
vi.mock("@/lib/supabase/admin", () => ({ getServiceClient: vi.fn(() => null) }));

const rpcCalls: { key: string; limit: number }[] = [];
let rpcResult: boolean | null = null; // what the fake DB "decides"
let rpcError = false; // simulate the function being missing / failing

function installFakeRpc() {
  vi.mocked(getServiceClient).mockReturnValue({
    rpc: async (fn: string, args: { p_key: string; p_max: number }) => {
      rpcCalls.push({ key: args.p_key, limit: args.p_max });
      if (rpcError) return { data: null, error: { message: "function hit_rate_limit does not exist" } };
      return { data: rpcResult, error: null };
    },
  } as never);
}

describe("checkRateLimit (in-memory fallback)", () => {
  beforeEach(() => {
    resetRateLimits();
    rpcError = false;
    rpcCalls.length = 0;
    vi.mocked(getServiceClient).mockReturnValue(null);
  });

  it("allows the first attempts from a fresh IP + email", async () => {
    await expect(checkRateLimit(IP, "one@example.com")).resolves.toEqual({ ok: true });
  });

  it("blocks an email once it exceeds the per-email limit, even from a new IP", async () => {
    const email = "repeat@example.com";
    for (let i = 0; i < RATE_LIMITS.perEmail; i += 1) {
      expect((await checkRateLimit(`10.0.0.${i}`, email)).ok).toBe(true);
    }
    // Different source IP must not be a bypass.
    await expect(checkRateLimit("198.51.100.7", email)).resolves.toEqual({
      ok: false,
      scope: "email",
    });
  });

  it("blocks an IP once it exceeds the per-IP limit, even with new emails", async () => {
    for (let i = 0; i < RATE_LIMITS.perIp; i += 1) {
      expect((await checkRateLimit(IP, `unique-${i}@example.com`)).ok).toBe(true);
    }
    await expect(checkRateLimit(IP, "fresh@example.com")).resolves.toEqual({
      ok: false,
      scope: "ip",
    });
  });

  it("applies the email bucket when no IP is available (no bypass behind a proxy)", async () => {
    const email = "noip@example.com";
    for (let i = 0; i < RATE_LIMITS.perEmail; i += 1) {
      expect((await checkRateLimit("", email)).ok).toBe(true);
    }
    await expect(checkRateLimit("", email)).resolves.toEqual({ ok: false, scope: "email" });
  });

  it("is case-insensitive on email so Case-Change is not a bypass", async () => {
    const email = "Casey@example.com";
    for (let i = 0; i < RATE_LIMITS.perEmail; i += 1) {
      expect((await checkRateLimit(`10.1.0.${i}`, email)).ok).toBe(true);
    }
    expect((await checkRateLimit("10.9.9.9", email.toLowerCase())).ok).toBe(false);
  });

  it("does not let one visitor's flood block another's first attempt", async () => {
    for (let i = 0; i < RATE_LIMITS.perIp + 3; i += 1) {
      await checkRateLimit(IP, `flood-${i}@example.com`);
    }
    await expect(checkRateLimit("198.51.100.99", "other@example.com")).resolves.toEqual({
      ok: true,
    });
  });

  it("expires the window so a later attempt is allowed again", async () => {
    vi.useFakeTimers();
    try {
      const email = "later@example.com";
      for (let i = 0; i < RATE_LIMITS.perEmail; i += 1) {
        expect((await checkRateLimit(IP, email)).ok).toBe(true);
      }
      expect((await checkRateLimit(IP, email)).ok).toBe(false);

      vi.advanceTimersByTime(RATE_LIMITS.windowMs + 1);
      await expect(checkRateLimit(IP, email)).resolves.toEqual({ ok: true });
    } finally {
      vi.useRealTimers();
    }
  });

  it("stores only salted hashes — a bucket key never contains the raw IP", async () => {
    const first = await checkRateLimit("10.20.30.40", "hash@example.com");
    expect(first).toEqual({ ok: true });
    expect(JSON.stringify(first)).not.toContain("10.20.30.40");
    expect(JSON.stringify(first)).not.toContain("hash@example.com");
  });
});

describe("checkRateLimit (persistent RPC)", () => {
  beforeEach(() => {
    resetRateLimits();
    rpcError = false;
    rpcCalls.length = 0;
  });

  it("delegates to the hit_rate_limit RPC with salted keys and the real limits", async () => {
    installFakeRpc();
    rpcResult = true;
    await checkRateLimit(IP, "delegate@example.com");

    // One call for the IP bucket, one for the email bucket.
    expect(rpcCalls).toHaveLength(2);
    expect(rpcCalls[0]!.limit).toBe(RATE_LIMITS.perIp);
    expect(rpcCalls[1]!.limit).toBe(RATE_LIMITS.perEmail);
    // Keys are hashed, never raw.
    expect(rpcCalls[0]!.key.startsWith("ip:")).toBe(true);
    expect(rpcCalls[0]!.key).not.toContain(IP);
    expect(rpcCalls[1]!.key.startsWith("email:")).toBe(true);
    expect(rpcCalls[1]!.key).not.toContain("delegate@example.com");
  });

  it("returns the IP scope when the RPC denies the IP bucket", async () => {
    installFakeRpc();
    // First bucket checked is the IP one; deny it.
    rpcResult = false;
    await expect(checkRateLimit(IP, "deny@example.com")).resolves.toEqual({
      ok: false,
      scope: "ip",
    });
  });

  it("falls back to memory when the RPC function is missing (0007 not applied)", async () => {
    rpcError = true;
    installFakeRpc();
    // The DB "errors", so the limiter must still count in memory and enforce.
    const email = "fallback@example.com";
    for (let i = 0; i < RATE_LIMITS.perEmail; i += 1) {
      expect((await checkRateLimit(`10.3.0.${i}`, email)).ok).toBe(true);
    }
    await expect(checkRateLimit("10.9.9.9", email)).resolves.toEqual({
      ok: false,
      scope: "email",
    });
  });

  it("stops calling the RPC after the first failure (no hammering a broken DB)", async () => {
    rpcError = true;
    installFakeRpc();
    await checkRateLimit(IP, "one@example.com");
    const callsAfterFirst = rpcCalls.length;
    await checkRateLimit(IP, "two@example.com");
    // Second call must not have attempted the RPC again.
    expect(rpcCalls.length).toBe(callsAfterFirst);
  });
});
