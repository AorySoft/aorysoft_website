-- Invite-only client feedback links (no public website form).
-- Admin mints a row; client opens /feedback?token=<hmac(id)>; redeem once.

create table if not exists public.review_invites (
  id uuid primary key default gen_random_uuid(),
  label text check (label is null or char_length(label) <= 200),
  client_name text check (client_name is null or char_length(client_name) <= 120),
  client_email text check (
    client_email is null
    or client_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  project_or_service text check (
    project_or_service is null or char_length(project_or_service) <= 200
  ),
  status text not null default 'open' check (
    status in ('open', 'used', 'revoked')
  ),
  expires_at timestamptz not null,
  used_at timestamptz,
  review_id uuid references public.reviews (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists review_invites_status_expires_idx
  on public.review_invites (status, expires_at);

alter table public.review_invites enable row level security;

-- No anon access. Invites are minted/read in admin; redeem uses service role.
create policy "review_invites_select" on public.review_invites
  for select to authenticated
  using (public.is_editor_or_admin());

create policy "review_invites_insert" on public.review_invites
  for insert to authenticated
  with check (public.is_editor_or_admin());

create policy "review_invites_update" on public.review_invites
  for update to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "review_invites_delete_owner" on public.review_invites
  for delete to authenticated
  using (public.is_admin());
