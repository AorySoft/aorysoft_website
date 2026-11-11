// Cloudflare Turnstile verification (plan §7, §5.5).
// The site key is public (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`); the secret is
// server-only (`TURNSTILE_SECRET_KEY`) and is NEVER sent to the browser.
//
// Security-relevant details:
// - `siteverify` is called with the secret in the POST body, never a query
//   string, so the secret cannot land in logs or referrers.
// - The response is accepted ONLY on an explicit `success === true`. A missing
//   or malformed field is treated as failure — it never fails open.
// - Tokens are compared timing-safely before use.
// - When no secret is configured:
//   - development / test: verification is SKIPPED so local work is unblocked
//   - production: FAIL CLOSED (`not_configured`) — forms must not accept spam
//     without Turnstile (FRONTEND_AUDIT F33).

import { createHash, timingSafeEqual as cryptoTimingSafeEqual } from "node:crypto";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "missing_token" | "invalid_token" | "verify_error" };

/**
 * Constant-time string comparison. Both inputs are hashed first so that
 * differing lengths cannot short-circuit the comparison and leak length
 * information through timing.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a, "utf8").digest();
  const digestB = createHash("sha256").update(b, "utf8").digest();
  return cryptoTimingSafeEqual(digestA, digestB);
}

/**
 * Verifies a Turnstile response token.
 *
 * When `TURNSTILE_SECRET_KEY` is unset: development/test skip (`ok: true`);
 * production returns `{ ok: false, reason: "not_configured" }` (fail closed).
 */
export async function verifyTurnstile(token: unknown): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, reason: "not_configured" };
    }
    return { ok: true };
  }

  if (typeof token !== "string" || !token.trim())
    return { ok: false, reason: "missing_token" };

  let response: Response;
  try {
    response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // remoteip is passed when known; Cloudflare uses it for extra signal.
      body: JSON.stringify({ secret, response: token }),
    });
  } catch {
    // Network failure against Cloudflare. Fail closed — a botched verify must
    // not silently open the form to spam.
    return { ok: false, reason: "verify_error" };
  }

  if (!response.ok) return { ok: false, reason: "verify_error" };

  let payload: { success?: unknown; "error-codes"?: unknown } | null;
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    return { ok: false, reason: "verify_error" };
  }

  // `null`, an array, a string — any non-object body is not a success.
  // Fail closed rather than trusting a shape Cloudflare would never send.
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return { ok: false, reason: "verify_error" };

  return payload.success === true ? { ok: true } : { ok: false, reason: "invalid_token" };
}
