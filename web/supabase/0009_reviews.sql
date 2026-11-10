-- AorySoft — Reviews (PRODUCT.md): admin CRUD + public published display.
-- Public writes only via service-role after Turnstile (pending status).
-- Fiverr/manual entries require permission_confirmed before publish is visible.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 120),
  review_text text not null check (char_length(review_text) between 1 and 4000),
  rating int not null check (rating between 1 and 5),
  source text not null check (
    source in ('fiverr', 'google', 'linkedin', 'website', 'email', 'other')
  ),
  source_url text check (source_url is null or char_length(source_url) <= 500),
  project_or_service text check (
    project_or_service is null or char_length(project_or_service) <= 200
  ),
  attribution text check (attribution is null or char_length(attribution) <= 200),
  profile_image_id uuid references public.media (id) on delete set null,
  permission_confirmed boolean not null default false,
  featured boolean not null default false,
  status text not null default 'draft' check (
    status in ('draft', 'pending', 'published', 'archived')
  ),
  submitter_email text check (
    submitter_email is null
    or submitter_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_status_featured_idx
  on public.reviews (status, featured desc, sort_order, created_at desc);

alter table public.reviews enable row level security;

-- Public: only published reviews with display permission.
create policy "reviews_published_read" on public.reviews
  for select to anon, authenticated
  using (status = 'published' and permission_confirmed = true);

-- Admin: editors manage; owners delete (matches 0006 pattern).
create policy "reviews_select" on public.reviews
  for select to authenticated
  using (public.is_editor_or_admin());

create policy "reviews_insert" on public.reviews
  for insert to authenticated
  with check (public.is_editor_or_admin());

create policy "reviews_update" on public.reviews
  for update to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "reviews_delete_owner" on public.reviews
  for delete to authenticated
  using (public.is_admin());
