// Per-IP / per-email rate window for the public forms (plan §7).
//
// PERSISTENT BY DEFAULT (migration 0007). The counters live in Postgres behind
// an atomic `hit_rate_limit` RPC, so the limit survives cold starts and is
// shared across every serverless instance. An in-process Map is NOT reliable on
// Vercel — state is per instance and lost on every cold start, which lets a
// flood reset itself simply by cycling the isolate. The in-memory window below
// is retained only as a GRACEFUL FALLBACK: when Supabase is not configured
// (local dev, unit tests) or the 0007 function is not yet applied, the limiter
// behaves exactly as before instead of failing open or throwing.
//
// Keys are built from SALTED hashes, never raw IPs or emails, so neither this
// module's memory nor the rate_limits table can be mined for visitor addresses
// (plan §4.4: hashed IP storage for compliance). The salt is stable per
// deployment; set RATE_LIMIT_SALT to rotate it.
//
// The RPC is called with the SERVICE-ROLE client (EXECUTE is granted to
// service_role only). If it errors for any reason — network, missing function,
// permissions — we fall back to the in-memory window and log once, so a
// database problem degrades protection rather than taking the form down.

import { createHash } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/admin";

const WINDOW_MS = 10 * 60 * 1000; // 10-minute window
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;
const MAX_TRACKED = 10_000; // in-memory fallback only: cap so a flood cannot exhaust memory

// Salt is stable per process/deployment. Not a secret — it only prevents a raw-
// value rainbow table against a dumped snapshot.
const SALT = process.env.RATE_LIMIT_SALT ?? "aorysoft-rls-v1";

type Bucket = { count: number; resetAt: number };

// In-memory fallback buckets (used only when the persistent path is off).
const ipBuckets = new Map<string, Bucket>();
const emailBuckets = new Map<string, Bucket>();

// Whether the persistent RPC has failed at least once this process. Lets us
// stop hammering a broken function on every request and fall back quietly.
let persistentBroken = false;

function hash(value: string): string {
  return createHash("sha256").update(`${SALT}:${value.toLowerCase()}`).digest("hex");
}

function prune(map: Map<string, Bucket>, now: number): void {
  if (map.size <= MAX_TRACKED) return;
  for (const [key, bucket] of map) {
    if (bucket.resetAt <= now) map.delete(key);
    if (map.size <= MAX_TRACKED) break;
  }
}

function hitMemory(map: Map<string, Bucket>, key: string, limit: number, now: number): boolean {
  const existing = map.get(key);
  if (!existing || existing.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    prune(map, now);
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

export type RateCheck = { ok: true } | { ok: false; scope: "ip" | "email" };

/**
 * Calls the atomic Postgres RPC for one bucket. Returns true when the attempt
 * is allowed, false when it exceeds the limit, or null when the persistent
 * path is unavailable (so the caller can fall back to memory).
 */
async function hitPersistent(key: string, limit: number): Promise<boolean | null> {
  if (persistentBroken) return null;
  const supabase = getServiceClient();
  // No client, or a client without the data API (e.g. a test double): use memory.
  if (!supabase || typeof supabase.rpc !== "function") return null;

  try {
    const { data, error } = await supabase.rpc("hit_rate_limit", {
      p_key: key,
      p_window_ms: WINDOW_MS,
      p_max: limit,
    });
    if (error) {
      persistentBroken = true;
      console.warn(
        "[rate-limit] persistent RPC unavailable, using in-memory fallback:",
        error.message,
      );
      return null;
    }
    return data === true;
  } catch (error) {
    persistentBroken = true;
    console.warn(
      "[rate-limit] persistent RPC threw, using in-memory fallback:",
      (error as Error).message,
    );
    return null;
  }
}

/**
 * Records an attempt against both the IP and the email and reports whether it
 * is allowed. Returns the FIRST violation so the caller can log a precise
 * reason without revealing the limits to the visitor.
 *
 * `ip` may be empty (e.g. behind a proxy that stripped the header); the email
 * check still applies, so a missing IP cannot become a bypass.
 */
export async function checkRateLimit(ip: string, email: string): Promise<RateCheck> {
  const now = Date.now();

  // 1. Per-IP.
  if (ip) {
    const ipKey = `ip:${hash(ip)}`;
    const allowed = await hitPersistent(ipKey, MAX_PER_IP);
    if (allowed === false) return { ok: false, scope: "ip" };
    if (allowed === null && !hitMemory(ipBuckets, ipKey, MAX_PER_IP, now))
      return { ok: false, scope: "ip" };
  }

  // 2. Per-email.
  if (email) {
    const emailKey = `email:${hash(email)}`;
    const allowed = await hitPersistent(emailKey, MAX_PER_EMAIL);
    if (allowed === false) return { ok: false, scope: "email" };
    if (allowed === null && !hitMemory(emailBuckets, emailKey, MAX_PER_EMAIL, now))
      return { ok: false, scope: "email" };
  }

  return { ok: true };
}

/** Test-only: clears the in-memory fallback buckets. */
export function resetRateLimits(): void {
  ipBuckets.clear();
  emailBuckets.clear();
  persistentBroken = false;
}

/** Test-only: the current limits, so tests assert against real values. */
export const RATE_LIMITS = { windowMs: WINDOW_MS, perIp: MAX_PER_IP, perEmail: MAX_PER_EMAIL };
