-- AorySoft — Row Level Security (plan v3.1 §5.5)
-- Default-deny: the anon role gets ONE capability — SELECT on published
-- content. There are NO public write policies anywhere. All writes go
-- through the Next.js route handlers using the service-role key.

-- ── role helpers (SECURITY DEFINER, hardened search_path) ──────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.is_editor_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'editor')
  );
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_editor_or_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_editor_or_admin() to authenticated, service_role;

-- ── enable RLS everywhere (default = no access) ────────────────────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.media enable row level security;
alter table public.posts enable row level security;
alter table public.services enable row level security;
alter table public.jobs enable row level security;
alter table public.site_settings enable row level security;
alter table public.submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ── profiles: users read ONLY their own row; never client-writable
-- (no INSERT/UPDATE policy exists → role escalation is impossible
--  through the API; role changes use the service-role key only) ─────────
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- ── public content reads (anon + authenticated) ───────────────────────
create policy "categories_public_read" on public.categories
  for select to anon, authenticated
  using (true);

create policy "media_public_read" on public.media
  for select to anon, authenticated
  using (true);

create policy "posts_published_read" on public.posts
  for select to anon, authenticated
  using (status = 'published');

create policy "services_active_read" on public.services
  for select to anon, authenticated
  using (active = true);

create policy "jobs_active_read" on public.jobs
  for select to anon, authenticated
  using (active = true);

create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated
  using (true);

-- ── content management (editor or admin) ──────────────────────────────
create policy "categories_manage" on public.categories
  for all to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "media_manage" on public.media
  for all to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "posts_manage" on public.posts
  for all to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "services_manage" on public.services
  for all to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "jobs_manage" on public.jobs
  for all to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

-- Submissions: editors read and update status; owner deletes.
-- (Inserts happen only via the service-role key in the route handler.)
create policy "submissions_read" on public.submissions
  for select to authenticated
  using (public.is_editor_or_admin());

create policy "submissions_update" on public.submissions
  for update to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "submissions_delete_owner" on public.submissions
  for delete to authenticated
  using (public.is_admin());

-- ── owner-only areas ──────────────────────────────────────────────────
-- Site settings: owner full control (editors have no access).
create policy "site_settings_owner_all" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Newsletter subscribers: owner-only list/export/delete (plan §5.5 matrix).
create policy "newsletter_owner_read" on public.newsletter_subscribers
  for select to authenticated
  using (public.is_admin());

create policy "newsletter_owner_delete" on public.newsletter_subscribers
  for delete to authenticated
  using (public.is_admin());

-- ── bootstrap (run once, as service role or in SQL editor) ────────────
-- After creating the first admin in the Supabase dashboard (Users →
-- "Create new user" with Auto Confirm), promote them:
--   update public.profiles set role = 'owner' where id = '<user-uuid>';
-- The dashboard SQL editor runs with elevated privileges, so this works.
