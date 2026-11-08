-- AorySoft — 0007: persistent rate limiting for the public forms (plan §7).
--
-- WHY: the previous limiter kept buckets in process memory. On Vercel serverless
-- that state is PER INSTANCE and lost on every cold start, so a flood can reset
-- simply by waiting for a new isolate or by hitting a different instance. That
-- is fine as best-effort defense but not reliable for production. This migration
-- moves the counters into Postgres (already the project's datastore — no new
-- vendor, no new credentials) behind a single atomic RPC.
--
-- RACE SAFETY (the reason this function is written as ONE upsert):
--   The earlier draft did `SELECT ... FOR UPDATE` then a separate INSERT/UPDATE.
--   That is NOT safe for a key with no existing row: `FOR UPDATE` locks nothing
--   when the SELECT matches zero rows, so two concurrent first-hits both see
--   "no row" and both try to start the window — the limit is bypassed. This
--   version does a single `INSERT ... ON CONFLICT (key) DO UPDATE ... RETURNING
--   count`, which Postgres executes atomically: a concurrent insert on the same
--   key blocks on the unique index, re-reads the committed row, and increments
--   it. Every caller therefore observes a distinct, correctly-serialized count,
--   whether or not the row existed beforehand.
--
--   The attempt is ALLOWED iff the post-increment count <= p_max, so exactly
--   p_max attempts pass per window. Denied attempts still increment; that is
--   harmless for a fixed window (reset_at does not move on a deny) and keeps
--   the whole operation a single atomic statement.
--
-- OTHER NOTES:
--   * Keys are the SAME salted hashes the app already computes (never raw IPs
--     or emails), so a dump of this table cannot be mined for visitor addresses.
--   * `hit_rate_limit` is SECURITY DEFINER with a FIXED hardened search_path
--     (public), and EXECUTE is revoked from public/anon/authenticated — only
--     the service-role path (the server actions) can call it.
--   * RLS is ENABLED with NO policies, so the table is unreachable by anon and
--     authenticated even at the grant layer (belt and braces).
--   * Window is FIXED (reset_at is only set when a window starts, never on a
--     deny), so a flood cannot extend its own lockout.
--   * Expired buckets are pruned opportunistically (bounded, separate statement)
--     so the table stays tiny without a cron.
--
-- ORDERING: the GRANT/REVOKE on the function MUST come after CREATE FUNCTION —
-- Postgres resolves the target signature at parse time, so referencing the
-- function before it exists raises "42883: function ... does not exist".
--
-- APPLY in the Supabase SQL editor (runs as the elevated `postgres` role).
-- Until it is applied, the app's rate limiter silently falls back to the
-- in-memory store — behaviour is identical to before, not broken.

begin;

-- ── 1. Table ─────────────────────────────────────────────────────────
create table if not exists public.rate_limits (
  key       text primary key,
  count     int not null default 0,
  reset_at  timestamptz not null
);

-- RLS on with no policies: anon/authenticated can neither read nor write the
-- table directly. The SECURITY DEFINER function below runs as its owner and is
-- therefore unaffected; the service role bypasses RLS by design.
alter table public.rate_limits enable row level security;

revoke all on public.rate_limits from anon, authenticated;

-- Index for the opportunistic prune (and for any ops inspection).
create index if not exists rate_limits_reset_at_idx on public.rate_limits (reset_at);

-- ── 2. Function (defined BEFORE any GRANT/REVOKE on it) ───────────────
-- Atomic check-and-increment. Returns TRUE when the attempt is ALLOWED.
--   p_key        salted hash bucket key (e.g. "ip:<sha256>" / "email:<sha256>")
--   p_window_ms  length of the fixed window in milliseconds
--   p_max        maximum attempts allowed within one window
create or replace function public.hit_rate_limit(
  p_key text,
  p_window_ms int,
  p_max int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  -- Opportunistic, bounded cleanup of EXPIRED buckets. Kept as its own
  -- statement (not folded into the upsert) so it can never trip Postgres'
  -- "command cannot affect row a second time" rule on the same table. It runs
  -- before the upsert and never touches p_key's row, because that row's
  -- reset_at is in the future by the time we upsert below.
  delete from public.rate_limits
  where reset_at <= now()
    and ctid in (select ctid from public.rate_limits where reset_at <= now() limit 100);

  -- Single atomic upsert: start a window if none exists or the old one expired,
  -- otherwise increment. RETURNING gives the post-increment count so the allow/
  -- deny decision needs no second (racy) read. Concurrent calls on the same key
  -- serialize on the unique index, so counts are never lost or double-counted.
  insert into public.rate_limits (key, count, reset_at)
  values (p_key, 1, now() + (p_window_ms * interval '1 millisecond'))
  on conflict (key) do update
    set count     = case when public.rate_limits.reset_at <= now()
                         then 1
                         else public.rate_limits.count + 1
                    end,
        reset_at  = case when public.rate_limits.reset_at <= now()
                         then now() + (p_window_ms * interval '1 millisecond')
                         else public.rate_limits.reset_at
                    end
  returning count into v_count;

  -- Allowed while the (post-increment) count is within the limit.
  return v_count <= p_max;
end;
$$;

-- ── 3. Lock the function down (now that it exists) ────────────────────
-- Public schemas grant EXECUTE to PUBLIC by default; take that away and grant
-- explicitly to service_role only, which is the sole caller (via the RPC).
revoke execute on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant  execute on function public.hit_rate_limit(text, int, int) to service_role;

commit;

-- NOTE: the app calls this via supabase.rpc('hit_rate_limit', {...}) with the
-- service-role client. If the function is missing (migration not yet applied),
-- the Node limiter catches the error and uses the in-memory fallback, so there
-- is no outage window during rollout.
