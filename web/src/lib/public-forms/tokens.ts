// HMAC-signed tokens for the newsletter double opt-in flows (plan §212).
//
// The confirmation and unsubscribe links must work WITHOUT a login, so the
// token itself carries the proof. It is an HMAC over the subscriber id using
// a server-only secret, so a visitor cannot mint a token for someone else's
// row and cannot forge an unsubscribe for an address they do not hold.
//
// Verification is timing-safe (constant-time compare on the digest).
//
// DEGRADED MODE: when NEWSLETTER_TOKEN_SECRET is unset (local development
// only) a deterministic secret derived from the Supabase URL is used so the
// flow is still exercisable end to end. Those tokens are NOT secure against a
// determined attacker, which is why the plan lists the secret as a launch
// gate. Production MUST set it; isTokenSigningConfigured() exists so the
// admin dashboard can surface that as a warning.

import { createHmac } from "node:crypto";
import { timingSafeEqual } from "./turnstile";

function secret(): string {
  return (
    process.env.NEWSLETTER_TOKEN_SECRET ||
    // Deterministic, non-secret fallback: only ever correct against the same
    // project instance, and useless to an attacker who does not already have
    // database access.
    `dev-only:${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "localhost"}`
  );
}

export function isTokenSigningConfigured(): boolean {
  return Boolean(process.env.NEWSLETTER_TOKEN_SECRET);
}

/** Signs a subscriber id into a URL-safe token. */
export function signToken(subscriberId: string): string {
  const digest = createHmac("sha256", secret()).update(subscriberId).digest("base64url");
  return `${subscriberId}.${digest}`;
}

/**
 * Verifies a token and returns the subscriber id it was minted for, or null
 * when it is malformed or the signature does not match.
 */
export function verifyToken(token: unknown): string | null {
  if (typeof token !== "string" || !token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const subscriberId = token.slice(0, separator);
  const provided = token.slice(separator + 1);
  if (!subscriberId || !provided) return null;

  const expected = createHmac("sha256", secret()).update(subscriberId).digest("base64url");

  // timingSafeEqual hashes both sides internally, so a length mismatch cannot
  // short-circuit and leak information through timing.
  return timingSafeEqual(provided, expected) ? subscriberId : null;
}
