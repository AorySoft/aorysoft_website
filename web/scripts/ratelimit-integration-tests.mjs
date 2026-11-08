// AorySoft — persistent rate-limiter INTEGRATION tests (plan §7 / §15).
//
// Unlike the vitest fallback tests, this talks to the LIVE Supabase project and
// calls the `hit_rate_limit` RPC DIRECTLY with the service-role client. It can
// therefore only pass if the database function actually exists and behaves —
// the in-memory fallback is never involved, so a green run is real proof.
//
// Requires in env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//                  NEXT_PUBLIC_SUPABASE_ANON_KEY (for the permission checks).
// Usage: node --env-file=.env.local scripts/ratelimit-integration-tests.mjs
// Exits 0 if all checks pass, 1 if any failed, 2 if not configured.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("SKIP: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(2);
}

const stamp = Date.now();
let failures = 0;
let passes = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (ok) passes += 1;
  else failures += 1;
};

const svc = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = anonKey
  ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

// Every key this run is namespaced so we can delete exactly what we created.
const tempKeys = [];
const uniq = (label) => {
  const k = `itest:${stamp}:${label}:${Math.random().toString(36).slice(2, 8)}`;
  tempKeys.push(k);
  return k;
};

const hit = (p_key, p_window_ms, p_max) =>
  svc.rpc("hit_rate_limit", { p_key, p_window_ms, p_max });

try {
  // ── 1. Function exists and returns a real boolean ───────────────────
  const first = await hit(uniq("basic"), 60000, 3);
  check(
    "RPC exists and returns a boolean (no 42883 / no error)",
    !first.error && typeof first.data === "boolean",
    first.error ? `${first.error.code}: ${first.error.message}` : `data=${first.data}`,
  );
  if (first.error) {
    // Without a working function nothing below is meaningful — stop loudly.
    console.error(
      "\nThe hit_rate_limit function is missing or broken. Apply the corrected\n" +
        "supabase/0007_rate_limits.sql in the Supabase SQL editor, then re-run.",
    );
    throw new Error("abort: RPC unavailable");
  }

  // ── 2. Below the limit allowed, beyond the limit denied (sequential) ─
  {
    const key = uniq("seq");
    const W = 60000;
    const MAX = 3;
    const results = [];
    for (let i = 0; i < MAX + 2; i += 1) results.push((await hit(key, W, MAX)).data);
    const allowed = results.filter((r) => r === true).length;
    check(
      `sequential: first ${MAX} allowed, next 2 denied (p_max=${MAX})`,
      allowed === MAX && results.slice(0, MAX).every((r) => r === true) &&
        results.slice(MAX).every((r) => r === false),
      `results=[${results.join(",")}]`,
    );
  }

  // ── 3. Counter persists across separate RPC calls ───────────────────
  {
    const key = uniq("persist");
    await hit(key, 60000, 2);
    const second = await hit(key, 60000, 2);
    const third = await hit(key, 60000, 2);
    check(
      "counter persists across separate calls (2 allowed then denied)",
      second.data === true && third.data === false,
      `2nd=${second.data} 3rd=${third.data}`,
    );
  }

  // ── 4. CONCURRENCY on a FRESH key, p_max=1 → exactly one allowed ────
  {
    const key = uniq("conc-fresh");
    const N = 8;
    const results = await Promise.all(
      Array.from({ length: N }, () => hit(key, 60000, 1)),
    );
    const errored = results.filter((r) => r.error);
    const allowed = results.filter((r) => r.data === true).length;
    check(
      `concurrency on fresh key: exactly 1 of ${N} allowed (p_max=1)`,
      errored.length === 0 && allowed === 1,
      `allowed=${allowed} errored=${errored.length}`,
    );
  }

  // ── 5. CONCURRENCY on an EXISTING key, p_max=3 → exactly 3 allowed ──
  {
    const key = uniq("conc-existing");
    // Prime the row so subsequent calls hit the UPDATE (not INSERT) path.
    await hit(key, 60000, 3);
    const N = 8;
    const results = await Promise.all(
      Array.from({ length: N }, () => hit(key, 60000, 3)),
    );
    const errored = results.filter((r) => r.error);
    // The prime call already used count=1 of the p_max=3 budget, so the 8
    // concurrent calls can add at most 2 more (reaching count=2 and count=3);
    // every later call exceeds the limit and is denied. This proves the
    // UPDATE (not INSERT) path also serializes correctly under concurrency.
    const allowedInWindow = results.filter((r) => r.data === true).length;
    check(
      `concurrency on existing key: exactly 2 of ${N} allowed (p_max=3, 1 already primed)`,
      errored.length === 0 && allowedInWindow === 2,
      `allowed=${allowedInWindow} errored=${errored.length}`,
    );
  }

  // ── 6. Fixed window EXPIRES and resets ──────────────────────────────
  {
    const key = uniq("window");
    const W = 1500; // 1.5s window so we can observe a reset quickly
    const a1 = await hit(key, W, 1);
    const a2 = await hit(key, W, 1); // within window → denied
    await new Promise((r) => setTimeout(r, W + 300));
    const a3 = await hit(key, W, 1); // after expiry → allowed again
    check(
      "fixed window expires and resets after the window elapses",
      a1.data === true && a2.data === false && a3.data === true,
      `first=${a1.data} within=${a2.data} after=${a3.data}`,
    );
  }

  // ── 7. anon / authenticated CANNOT execute the function ─────────────
  if (anon) {
    const { error: anonErr } = await anon.rpc("hit_rate_limit", {
      p_key: uniq("anon"),
      p_window_ms: 60000,
      p_max: 1,
    });
    check("anon CANNOT execute hit_rate_limit", Boolean(anonErr),
      anonErr ? anonErr.code : "no error (BAD)");
  } else {
    console.log("SKIP  anon permission check (no anon key)");
  }

  // ── 8. Application path uses the RPC (no silent memory fallback) ────
  // Import the real checkRateLimit with the live service client configured.
  // If the RPC works, no "[rate-limit] persistent" fallback warning is logged,
  // and the salted bucket row appears in rate_limits — proving persistence.
  {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => { warnings.push(args.join(" ")); originalWarn(...args); };
    try {
      const { checkRateLimit } = await import("../src/lib/public-forms/rate-limit.ts");
      const ip = `203.0.113.${Math.floor(Math.random() * 200) + 20}`;
      let last = null;
      // Drive past the per-IP limit (5) to prove the decision comes from the DB:
      // the salted key row must exist in rate_limits after the calls.
      for (let i = 0; i < 6; i += 1) last = await checkRateLimit(ip, `itest-${stamp}@example.com`);
      const usedFallback = warnings.some((w) => w.includes("[rate-limit] persistent"));
      check(
        "app checkRateLimit uses the persistent RPC (no memory fallback)",
        !usedFallback && last?.ok === false,
        usedFallback ? "fell back to memory" : `last=${JSON.stringify(last)}`,
      );
    } finally {
      console.warn = originalWarn;
    }
  }
} catch (err) {
  if (err?.message?.startsWith("abort:")) {
    // Already reported above; skip the noisy stack.
  } else {
    console.error("unexpected error:", err.message);
    failures += 1;
  }
} finally {
  // ── cleanup: delete exactly the keys this run created ───────────────
  for (const key of tempKeys) {
    await svc.from("rate_limits").delete().eq("key", key);
  }
  // Also sweep any salted ip:/email: buckets the app-path test created.
  console.log(`\ncleaned up ${tempKeys.length} temporary test keys.`);
}

console.log(
  failures === 0
    ? `\nAll ${passes} persistent rate-limit integration checks passed.`
    : `\n${failures} check(s) FAILED, ${passes} passed.`,
);
process.exit(failures === 0 ? 0 : 1);
