-- AorySoft — 0006: tighten content DELETE to owner-only (plan §5.5 matrix).
--
-- WHY (found by the live admin/RLS matrix suite, scripts/admin-rls-matrix-tests.mjs):
--   0002_rls.sql defines the content "manage" policies as
--     create policy "posts_manage" on public.posts for all to authenticated
--       using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());
--   (same shape for categories, media, services, jobs). `FOR ALL` includes DELETE,
--   so at the DATABASE layer an editor can delete content rows directly via the
--   API. The application layer already restricts deletion to owner-only
--   (lib/admin/permissions.ts canDelete()), so this is a defense-in-depth gap:
--   the app says "no" but the database would say "yes" to a direct API call with
--   an editor JWT. Plan §5.5 says editors have NO deletions anywhere.
--
-- This migration closes the gap at the enforcement layer by splitting each
-- `FOR ALL` manage policy into:
--   * a permissive SELECT/INSERT/UPDATE policy (editor or admin), and
--   * a DELETE policy restricted to owner (is_admin()).
-- It is idempotent and additive: it drops only the five content manage policies
-- it replaces, re-creating them with the narrower verbs. It does NOT touch
-- profiles, site_settings, submissions, or newsletter_subscribers.
--
-- Apply in the Supabase SQL editor (runs as the elevated `postgres` role).

begin;

-- ── categories ───────────────────────────────────────────────────────
drop policy if exists "categories_manage" on public.categories;
create policy "categories_select" on public.categories
  for select to authenticated
  using (public.is_editor_or_admin());
create policy "categories_insert" on public.categories
  for insert to authenticated
  with check (public.is_editor_or_admin());
create policy "categories_update" on public.categories
  for update to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());
create policy "categories_delete_owner" on public.categories
  for delete to authenticated
  using (public.is_admin());

-- ── media ────────────────────────────────────────────────────────────
drop policy if exists "media_manage" on public.media;
create policy "media_select" on public.media
  for select to authenticated
  using (public.is_editor_or_admin());
create policy "media_insert" on public.media
  for insert to authenticated
  with check (public.is_editor_or_admin());
create policy "media_update" on public.media
  for update to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());
create policy "media_delete_owner" on public.media
  for delete to authenticated
  using (public.is_admin());

-- ── posts ────────────────────────────────────────────────────────────
drop policy if exists "posts_manage" on public.posts;
create policy "posts_select_content" on public.posts
  for select to authenticated
  using (public.is_editor_or_admin());
create policy "posts_insert" on public.posts
  for insert to authenticated
  with check (public.is_editor_or_admin());
create policy "posts_update" on public.posts
  for update to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());
create policy "posts_delete_owner" on public.posts
  for delete to authenticated
  using (public.is_admin());

-- ── services ─────────────────────────────────────────────────────────
drop policy if exists "services_manage" on public.services;
create policy "services_select" on public.services
  for select to authenticated
  using (public.is_editor_or_admin());
create policy "services_insert" on public.services
  for insert to authenticated
  with check (public.is_editor_or_admin());
create policy "services_update" on public.services
  for update to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());
create policy "services_delete_owner" on public.services
  for delete to authenticated
  using (public.is_admin());

-- ── jobs ─────────────────────────────────────────────────────────────
drop policy if exists "jobs_manage" on public.jobs;
create policy "jobs_select" on public.jobs
  for select to authenticated
  using (public.is_editor_or_admin());
create policy "jobs_insert" on public.jobs
  for insert to authenticated
  with check (public.is_editor_or_admin());
create policy "jobs_update" on public.jobs
  for update to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());
create policy "jobs_delete_owner" on public.jobs
  for delete to authenticated
  using (public.is_admin());

commit;

-- NOTE: an editor can still SELECT drafts/inactive rows (needed for the admin
-- list/edit screens); only DELETE is now owner-only. Public anon reads are
-- unchanged and continue to be governed by the published/active policies in
-- 0002_rls.sql.
