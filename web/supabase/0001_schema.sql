-- AorySoft — Supabase schema (plan v3.1 §4.4)
-- Apply in the Supabase SQL editor or via the pooler (DATABASE_URL, port 6543).
-- Idempotence: safe to re-run; uses IF NOT EXISTS throughout.

-- ── profiles (admin roles; role changes happen only via service role) ──
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

-- ── categories (blog) ──
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── media (files live in the Supabase Storage "media" bucket) ──
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  url text not null,
  alt text not null default '' check (char_length(alt) <= 300),
  width int,
  height int,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- ── posts (blog articles) ──
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text check (excerpt is null or char_length(excerpt) <= 500),
  body_html text not null default '',
  cover_image_id uuid references public.media (id) on delete set null,
  author text check (author is null or char_length(author) <= 120),
  publish_date date,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 160),
  seo_og_image_url text,
  category_id uuid references public.categories (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_status_publish_date_idx on public.posts (status, publish_date desc);
create index if not exists posts_category_idx on public.posts (category_id);

-- ── services ──
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  subtitle text check (subtitle is null or char_length(subtitle) <= 200),
  description text check (description is null or char_length(description) <= 4000),
  features jsonb not null default '[]'::jsonb,
  icon text,
  color text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── jobs (careers) ──
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  department text check (department is null or char_length(department) <= 80),
  location text check (location is null or char_length(location) <= 120),
  type text check (type is null or type in ('full-time', 'part-time', 'contract', 'internship')),
  experience text check (experience is null or char_length(experience) <= 80),
  description text check (description is null or char_length(description) <= 4000),
  requirements jsonb not null default '[]'::jsonb,
  responsibilities jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── site_settings (single row) ──
create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

-- ── submissions (contact + quote; written ONLY via the server route handler) ──
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact', 'quote')),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text check (phone is null or char_length(phone) <= 40),
  company text check (company is null or char_length(company) <= 120),
  service text check (service is null or char_length(service) <= 120),
  message text check (message is null or char_length(message) <= 10000),
  details jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists submissions_status_created_idx on public.submissions (status, created_at desc);
create index if not exists submissions_ip_hash_created_idx on public.submissions (ip_hash, created_at desc);

-- ── newsletter_subscribers ──
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  consent_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now()
);
