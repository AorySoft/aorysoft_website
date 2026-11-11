-- Batch 5: service detail fields + case_studies CMS.
-- Service detail pages are gated in the app (slug + active + overview + ≥4 deliverables).
-- Slugs are locked in application code once set (no redirect table).

-- ── services: long-form detail fields ─────────────────────────────────
alter table public.services
  add column if not exists slug text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists deliverables jsonb not null default '[]'::jsonb,
  add column if not exists process_steps jsonb not null default '[]'::jsonb,
  add column if not exists technologies jsonb not null default '[]'::jsonb,
  add column if not exists faqs jsonb not null default '[]'::jsonb;

alter table public.services
  drop constraint if exists services_slug_format;
alter table public.services
  add constraint services_slug_format
  check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

alter table public.services
  drop constraint if exists services_seo_title_len;
alter table public.services
  add constraint services_seo_title_len
  check (seo_title is null or char_length(seo_title) <= 120);

alter table public.services
  drop constraint if exists services_seo_description_len;
alter table public.services
  add constraint services_seo_description_len
  check (seo_description is null or char_length(seo_description) <= 300);

create unique index if not exists services_slug_unique
  on public.services (slug)
  where slug is not null;

-- ── case_studies ──────────────────────────────────────────────────────
create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text check (summary is null or char_length(summary) <= 500),
  body text not null check (char_length(body) between 1 and 20000),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_studies_slug_unique unique (slug)
);

create index if not exists case_studies_published_idx
  on public.case_studies (published_at desc)
  where status = 'published';

alter table public.case_studies enable row level security;

drop policy if exists "case_studies_published_read" on public.case_studies;
create policy "case_studies_published_read" on public.case_studies
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "case_studies_select" on public.case_studies;
create policy "case_studies_select" on public.case_studies
  for select to authenticated
  using (public.is_editor_or_admin());

drop policy if exists "case_studies_insert" on public.case_studies;
create policy "case_studies_insert" on public.case_studies
  for insert to authenticated
  with check (public.is_editor_or_admin());

drop policy if exists "case_studies_update" on public.case_studies;
create policy "case_studies_update" on public.case_studies
  for update to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

drop policy if exists "case_studies_delete_owner" on public.case_studies;
create policy "case_studies_delete_owner" on public.case_studies
  for delete to authenticated
  using (public.is_admin());

revoke all on table public.case_studies from anon, authenticated;
grant select on table public.case_studies to anon, authenticated;
grant all on table public.case_studies to service_role;

comment on table public.case_studies is
  'Public case studies for /work. Indexable only when status=published.';
