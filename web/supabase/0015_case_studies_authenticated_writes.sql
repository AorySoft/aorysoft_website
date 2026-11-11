-- AorySoft — 0015: restore authenticated write grants on case_studies.
--
-- Bug in 0012: `revoke all … from anon, authenticated` followed by
-- `grant select … to anon, authenticated` left the authenticated role with
-- SELECT only. Admin CRUD runs under the signed-in user's JWT, so editors and
-- owners could not create, update, or delete case studies ("permission
-- denied for table case_studies") even though the RLS policies allow it.
--
-- Grants are only the outer gate; the existing policies still decide:
--   insert/update → is_editor_or_admin(), delete → is_admin() (owner).
-- anon keeps SELECT only (published rows via policy). Idempotent.

grant insert, update, delete on table public.case_studies to authenticated;
