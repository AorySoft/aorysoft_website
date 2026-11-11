import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isTurnstileConfigured, timingSafeEqual, verifyTurnstile } from "./turnstile";

const SECRET = "turnstile-secret-test-value";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("verifyTurnstile", () => {
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = originalSecret;
    vi.unstubAllGlobals();
  });

  it("skips verification when no secret is configured (development)", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    expect(isTurnstileConfigured()).toBe(false);
    expect(process.env.NODE_ENV).not.toBe("production");

    // No fetch at all should happen when unconfigured.
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    // Even a missing token passes — by design, so local dev is unblocked.
    await expect(verifyTurnstile(undefined)).resolves.toEqual({ ok: true });
    await expect(verifyTurnstile("")).resolves.toEqual({ ok: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fails closed in production when no secret is configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    vi.stubEnv("NODE_ENV", "production");

    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(verifyTurnstile("any-token")).resolves.toEqual({
      ok: false,
      reason: "not_configured",
    });
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.unstubAllEnvs();
  });

  it("rejects a missing token when configured, without calling Cloudflare", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(verifyTurnstile("")).resolves.toEqual({
      ok: false,
      reason: "missing_token",
    });
    await expect(verifyTurnstile(undefined)).resolves.toEqual({
      ok: false,
      reason: "missing_token",
    });
    await expect(verifyTurnstile(12345)).resolves.toEqual({
      ok: false,
      reason: "missing_token",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("accepts an explicit success === true", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse({ success: true }));
    vi.stubGlobal("fetch", fetchSpy);

    await expect(verifyTurnstile("token-abc")).resolves.toEqual({ ok: true });

    // The secret must travel in the POST body, never the query string.
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).not.toContain(SECRET);
    expect(String(url)).toContain("siteverify");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({ secret: SECRET, response: "token-abc" });
  });

  it("rejects success === false", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ success: false, "error-codes": ["invalid-input-response"] })),
    );

    await expect(verifyTurnstile("bad")).resolves.toEqual({
      ok: false,
      reason: "invalid_token",
    });
  });

  it("fails closed when Cloudflare returns a non-JSON or non-2xx response", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("boom", { status: 500 })),
    );
    await expect(verifyTurnstile("t")).resolves.toEqual({
      ok: false,
      reason: "verify_error",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>nope</html>", { status: 200 })),
    );
    await expect(verifyTurnstile("t")).resolves.toEqual({
      ok: false,
      reason: "verify_error",
    });
  });

  it("fails closed when the siteverify request itself throws", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    await expect(verifyTurnstile("t")).resolves.toEqual({
      ok: false,
      reason: "verify_error",
    });
  });

  it("treats a malformed success value as failure, never as success", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    // A well-formed object whose `success` is anything but literal `true`
    // means Cloudflare explicitly rejected the token.
    for (const payload of [{}, { success: "true" }, { success: 1 }, { success: null }]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(payload)));
      await expect(verifyTurnstile("t")).resolves.toEqual({
        ok: false,
        reason: "invalid_token",
      });
    }
  });

  it("treats a non-object JSON body as a malformed response, not a success", async () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    // `null`, an array or a string is not a shape Cloudflare would ever send,
    // so it must fail closed rather than be trusted.
    for (const payload of [null, [1, 2, 3], "ok", 42]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(payload)));
      await expect(verifyTurnstile("t")).resolves.toEqual({
        ok: false,
        reason: "verify_error",
      });
    }
  });
});

describe("timingSafeEqual", () => {
  it("matches identical strings", () => {
    expect(timingSafeEqual("abc123", "abc123")).toBe(true);
  });

  it("rejects different strings of the same length", () => {
    expect(timingSafeEqual("abc123", "abc124")).toBe(false);
  });

  it("rejects different lengths without throwing", () => {
    expect(timingSafeEqual("short", "much-longer-value")).toBe(false);
    expect(timingSafeEqual("", "x")).toBe(false);
  });
});
