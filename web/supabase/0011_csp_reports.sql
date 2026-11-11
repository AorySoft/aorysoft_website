-- CSP Report-Only storage for 7–14 day review windows (FRONTEND_AUDIT).
-- Deduped by (directive, blocked_uri, document_path). Service role writes;
-- owners may SELECT for the admin review page. No anon access.

create table if not exists public.csp_reports (
  id uuid primary key default gen_random_uuid(),
  directive text not null,
  blocked_uri text not null default '',
  document_path text not null default '',
  hit_count integer not null default 1 check (hit_count > 0),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint csp_reports_dedupe unique (directive, blocked_uri, document_path)
);

create index if not exists csp_reports_last_seen_idx
  on public.csp_reports (last_seen_at desc);

alter table public.csp_reports enable row level security;

-- No public policies. Owners can read for the admin UI.
create policy "csp_reports_owner_select" on public.csp_reports
  for select to authenticated
  using (public.is_admin());

revoke all on table public.csp_reports from anon, authenticated;
grant select on table public.csp_reports to authenticated;
grant all on table public.csp_reports to service_role;

comment on table public.csp_reports is
  'Deduped CSP Report-Only violations for enforcement readiness review. Writes are service-role only via /api/csp-report; retention is opportunistic (30-day last_seen prune + 500-row hard cap).';
