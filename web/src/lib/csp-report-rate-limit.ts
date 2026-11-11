// Lightweight in-memory rate limit for CSP report ingestion.
// Reports are noisy; this only protects the logging endpoint from floods.
// Acceptable to reset on cold start — CSP reports are not durable storage.

const WINDOW_MS = 60_000;
const MAX_PER_IP = 40;
const MAX_TRACKED = 5_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune(now: number): void {
  if (buckets.size <= MAX_TRACKED) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
    if (buckets.size <= MAX_TRACKED) break;
  }
}

/** Returns true when the request is within the limit. */
export function allowCspReport(ipKey: string): boolean {
  const now = Date.now();
  const existing = buckets.get(ipKey);
  if (!existing || existing.resetAt <= now) {
    buckets.set(ipKey, { count: 1, resetAt: now + WINDOW_MS });
    prune(now);
    return true;
  }
  if (existing.count >= MAX_PER_IP) return false;
  existing.count += 1;
  return true;
}
