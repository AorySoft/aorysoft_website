-- AorySoft — 0013: stop anon from reading reviews.submitter_email (PII).
--
-- Why: 0009 created public.reviews without explicit grants, so Supabase's
-- default privileges gave anon TABLE-level SELECT. The row policy
-- "reviews_published_read" filters rows, not columns, so anyone with the
-- public anon key could read submitter_email of published reviews through
-- PostgREST. A column-level REVOKE does nothing while a table-level grant
-- exists, so: revoke the table grant from anon, then grant SELECT on the
-- safe columns only.
--
-- Effects:
--   - anon: may read every reviews column EXCEPT submitter_email.
--     `select=*` as anon now fails (permission denied) — public queries must
--     list columns (src/lib/data.ts getPublishedReviews does).
--   - authenticated (admin panel): unchanged; editors/owners still see the
--     email through the existing reviews_select policy.
--   - Row policies are unchanged.
--
-- Idempotent: REVOKE/GRANT can be re-run safely.
-- Apply in the Supabase SQL editor (postgres role). Verify afterwards with
-- `npm run test:rls` against a NON-production project.

begin;

revoke select on table public.reviews from anon;

grant select (
  id,
  display_name,
  review_text,
  rating,
  source,
  source_url,
  project_or_service,
  attribution,
  profile_image_id,
  permission_confirmed,
  featured,
  status,
  sort_order,
  created_at,
  updated_at
) on table public.reviews to anon;

commit;
