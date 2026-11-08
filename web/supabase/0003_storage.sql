-- AorySoft — Storage bucket + policies (plan §4.4 media area, §5.5)
-- Public reads, admin-only writes. Idempotent: safe to re-run.
-- Apply AFTER 0001_schema.sql and 0002_rls.sql.

-- Public "media" bucket (1 GB free-tier quota applies; 50 MB max file).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_storage_public_read" on storage.objects;
create policy "media_storage_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media_storage_admin_insert" on storage.objects;
create policy "media_storage_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_editor_or_admin());

drop policy if exists "media_storage_admin_update" on storage.objects;
create policy "media_storage_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_editor_or_admin())
  with check (bucket_id = 'media' and public.is_editor_or_admin());

drop policy if exists "media_storage_admin_delete" on storage.objects;
create policy "media_storage_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_editor_or_admin());
