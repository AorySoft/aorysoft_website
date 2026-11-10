-- AorySoft — CMS cleanup: RLS-test residue + placeholder careers
-- Safe to re-run. Prefer scripts/cms-cleanup.mjs against a live project;
-- this file documents the same intent for the SQL editor / ops notes.

-- Delete leftover rows from scripts/admin-rls-matrix-tests.mjs when cleanup
-- failed to track editor-inserted IDs (title defaults active=true → public).
delete from public.services
where title in ('editor service', 'x')
   or title like 'Matrix service %';

delete from public.jobs
where title in ('editor job', 'x')
   or title like 'Matrix job %';

delete from public.posts
where title in ('editor post', 'owner post', 'x')
   or title like 'editor post%'
   or title like 'Matrix post %'
   or slug like 'ed-post-%'
   or slug like 'ow-post-%'
   or slug like 'matrix-post-%'
   or slug like 'anon-x-%';

delete from public.categories
where name = 'editor cat'
   or name like 'Matrix %'
   or slug like 'matrix-%'
   or slug like 'ed-cat-%'
   or slug like 'anon-x-%';

-- Seed careers from 0004 are demo listings, not real openings.
update public.jobs set active = false where active = true;

-- Unverified contact fields must stay empty until the owner confirms them.
update public.site_settings
set data = data
  || jsonb_build_object('footerPhone', '', 'footerAddress', '')
where id = true
  and (
    coalesce(data->>'footerPhone', '') <> ''
    or coalesce(data->>'footerAddress', '') <> ''
  );
