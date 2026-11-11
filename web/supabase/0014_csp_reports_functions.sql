-- AorySoft — 0014: atomic CSP report dedupe + single-statement retention.
--
-- Replaces the app's select-then-insert/update (race: concurrent identical
-- reports hit the unique constraint and lost hit_count increments) with one
-- INSERT … ON CONFLICT, and folds the 30-day + row-cap prune into one call.
--
-- Both functions are SECURITY INVOKER and executable by service_role only,
-- matching 0011 (no anon/authenticated write path). The app falls back to the
-- previous logic if these functions are missing, so deploy order is safe.
-- Idempotent: CREATE OR REPLACE + re-runnable grants.

create or replace function public.record_csp_report(
  p_directive text,
  p_blocked_uri text,
  p_document_path text
)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.csp_reports as r (directive, blocked_uri, document_path)
  values (p_directive, coalesce(p_blocked_uri, ''), coalesce(p_document_path, ''))
  on conflict on constraint csp_reports_dedupe
  do update set
    hit_count = r.hit_count + 1,
    last_seen_at = now();
$$;

create or replace function public.prune_csp_reports(
  p_retention_days integer default 30,
  p_max_rows integer default 500
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  removed integer := 0;
  n integer;
begin
  delete from public.csp_reports
  where last_seen_at < now() - make_interval(days => p_retention_days);
  get diagnostics n = row_count;
  removed := removed + n;

  delete from public.csp_reports
  where id in (
    select id from public.csp_reports
    order by last_seen_at desc
    offset p_max_rows
  );
  get diagnostics n = row_count;
  removed := removed + n;

  return removed;
end;
$$;

revoke execute on function public.record_csp_report(text, text, text) from public, anon, authenticated;
revoke execute on function public.prune_csp_reports(integer, integer) from public, anon, authenticated;
grant execute on function public.record_csp_report(text, text, text) to service_role;
grant execute on function public.prune_csp_reports(integer, integer) to service_role;
