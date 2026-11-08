-- AorySoft — 0005: enforce anon SELECT lockdown on sensitive tables.
--
-- ROOT CAUSE (from a live anon-key probe, NOT a guess): anon could SELECT
-- every public table. On submissions/newsletter_subscribers/profiles the
-- query returned an empty set with no error, while on posts it also returned
-- no rows (correctly filtered by the published policy) and on jobs/categories/
-- services/site_settings it returned rows. The distinguishing behaviour is
-- the signature of "table reachable, RLS returning no qualifying rows":
--   - 0002_rls.sql already ENABLEs RLS on all nine tables and defines correct
--     SELECT policies, so the source is NOT the cause and there is no omission.
--   - The policies for the three sensitive tables are all `to authenticated`
--     with NO `to anon` policy, so once RLS is enforced the correct result is
--     a 42501 permission error for anon. We saw an empty set instead.
--   - Therefore RLS enforcement was not in effect for those tables at probe
--     time, leaving the default `GRANT SELECT ... TO anon` in force (grants are
--     a separate mechanism from policies). This migration closes both layers.
--
-- This migration is idempotent and additive. It does NOT disable RLS, does NOT
-- use FORCE RLS, and does NOT weaken any existing policy. It:
--   1. Re-asserts ENABLE RLS on all nine tables (no-op if already on).
--   2. Revokes anon table-level SELECT on the three sensitive tables so they
--      fail closed even if enforcement is ever missing again.
--   3. Re-asserts anon SELECT on public content so currently-passing anon
--      reads (published posts, active jobs, etc.) keep working.
-- Apply in the Supabase SQL editor (runs as the elevated `postgres` role).

begin;

-- ── 1. RLS on everywhere (default = deny all when no policy matches) ──
alter table public.profiles              enable row level security;
alter table public.categories            enable row level security;
alter table public.media                 enable row level security;
alter table public.posts                 enable row level security;
alter table public.services              enable row level security;
alter table public.jobs                  enable row level security;
alter table public.site_settings         enable row level security;
alter table public.submissions           enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Deliberately NOT using FORCE ROW LEVEL SECURITY: that would also apply the
-- policies to the `postgres` role used by the SQL editor/dashboard, which
-- could lock the owner out of editing their own rows. Plain ENABLE is enough
-- for anon/authenticated, and the service role remains exempt by design.

-- ── 2. Deny anon table-level SELECT on the sensitive tables ──────────
-- Belt and braces: even if a permissive policy ever reappears, anon has no
-- table grant, so the query fails closed. These are the three the tests flag.
revoke select on public.submissions           from anon;
revoke select on public.newsletter_subscribers from anon;
revoke select on public.profiles              from anon;

-- Editors/owners read submissions and profiles via their authenticated role
-- (policies in 0002_rls.sql). Re-assert the grant that RLS then gates.
grant select on public.submissions to authenticated;
grant select on public.profiles    to authenticated;

-- ── 3. Re-assert anon SELECT on public content (do not break what works) ──
-- These are the only tables anon is allowed to read, and only via the
-- row-filtering policies in 0002_rls.sql (published/active rows).
grant select on public.posts         to anon, authenticated;
grant select on public.jobs          to anon, authenticated;
grant select on public.categories    to anon, authenticated;
grant select on public.services      to anon, authenticated;
grant select on public.media         to anon, authenticated;
grant select on public.site_settings to anon, authenticated;

commit;

-- NOTE: anon is intentionally NOT granted SELECT on newsletter_subscribers.
-- That table is owner-only (policy "newsletter_owner_read") and is read with
-- the authenticated role, never by the public.
