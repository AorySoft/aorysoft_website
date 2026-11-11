-- AorySoft — 0016: lock service / case-study slugs once the page is published.
--
-- Decision: a slug may change freely until the page first goes public; from
-- then on it is locked (even if later unpublished) so URLs crawlers have seen
-- never change. `slug_locked_at` records when that happened.
--   services:     active + slug + non-empty description + ≥4 non-empty
--                 deliverables (same threshold as src/lib/services-publish.ts)
--   case_studies: status = 'published'
-- The app enforces the same rule (src/lib/admin/slug-lock.ts); this trigger is
-- the database-level guarantee (covers direct REST/API updates too).
-- Error message starts with "slug_locked" so the app shows a friendly message.
-- Idempotent: IF NOT EXISTS / CREATE OR REPLACE / DROP TRIGGER IF EXISTS.

alter table public.services
  add column if not exists slug_locked_at timestamptz;
alter table public.case_studies
  add column if not exists slug_locked_at timestamptz;

create or replace function public.service_meets_publish_threshold(s public.services)
returns boolean
language sql
immutable
set search_path = public
as $$
  select coalesce(s.active, false)
    and s.slug is not null
    and length(trim(s.slug)) > 0
    and s.description is not null
    and length(trim(s.description)) > 0
    and jsonb_typeof(s.deliverables) = 'array'
    and (
      select count(*)
      from jsonb_array_elements_text(s.deliverables) as d(item)
      where length(trim(d.item)) > 0
    ) >= 4;
$$;

create or replace function public.enforce_service_slug_lock()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    -- Once locked, always locked; the slug cannot change.
    new.slug_locked_at := coalesce(old.slug_locked_at, new.slug_locked_at);
    if old.slug_locked_at is not null and new.slug is distinct from old.slug then
      raise exception 'slug_locked: services slug cannot change after the page has been published'
        using errcode = 'P0001';
    end if;
  end if;

  if new.slug_locked_at is null and public.service_meets_publish_threshold(new) then
    new.slug_locked_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.enforce_case_study_slug_lock()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    new.slug_locked_at := coalesce(old.slug_locked_at, new.slug_locked_at);
    if old.slug_locked_at is not null and new.slug is distinct from old.slug then
      raise exception 'slug_locked: case study slug cannot change after the page has been published'
        using errcode = 'P0001';
    end if;
  end if;

  if new.slug_locked_at is null and new.status = 'published' then
    new.slug_locked_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists services_slug_lock on public.services;
create trigger services_slug_lock
  before insert or update on public.services
  for each row execute function public.enforce_service_slug_lock();

drop trigger if exists case_studies_slug_lock on public.case_studies;
create trigger case_studies_slug_lock
  before insert or update on public.case_studies
  for each row execute function public.enforce_case_study_slug_lock();

-- Backfill rows that are already public (the update fires the trigger, which
-- stamps slug_locked_at; the explicit value keeps this readable).
update public.services s
set slug_locked_at = now()
where s.slug_locked_at is null
  and public.service_meets_publish_threshold(s);

update public.case_studies
set slug_locked_at = now()
where slug_locked_at is null
  and status = 'published';
