---
name: aorysoft-architecture
description: >-
  AorySoft architecture: App Router → server actions/route handlers → Supabase,
  public vs admin paths, RLS boundaries. Use when adding routes, data access,
  admin features, forms, or deciding server vs client components.
---

# Architecture

## Data flow

```
Public page (RSC)
  → src/lib/data.ts (anon key)
  → Supabase RLS (published/active only)

Public form (client island)
  → server action in src/lib/public-forms/actions.ts
  → honeypot → Turnstile → rate limit → validate
  → service-role insert → Resend

Admin UI (/admin)
  → src/proxy.ts session gate
  → server actions (user JWT client from server.ts)
  → RLS + permissions.ts (UX)
```

## Layer table

| Layer | Does | Never does |
|---|---|---|
| `src/app/**` pages | Compose UI, `generateMetadata`, call lib | Embed service-role key; raw SQL |
| `src/components/**` | Presentational / motion islands | Direct DB writes; secrets |
| `src/lib/data.ts` | Public reads via anon | Writes; service role |
| `src/lib/public-forms/**` | Form pipeline + email + tokens | Trust client-only validation |
| `src/lib/admin/**` | CRUD actions, resources, permissions | Bypass permission checks for convenience |
| `src/lib/supabase/admin.ts` | Service-role client | Import from `'use client'` files |
| `src/proxy.ts` | Refresh session; redirect unauthenticated `/admin` | Authorize row-level access (RLS does) |
| `supabase/*.sql` | Schema + RLS source of truth | Drift from app validators silently |

## Directory tree (canonical)

```
src/app/(public pages)/
src/app/admin/login/ + admin/(panel)/
src/app/api/cron/keep-alive/
src/app/newsletter/{confirm,unsubscribe}/
src/lib/{data,sanitize,types}.ts
src/lib/supabase/{client,server,admin}.ts
src/lib/public-forms/
src/lib/admin/
supabase/0001_schema.sql … 0007_rate_limits.sql
```

## Hard constraints

- Server Components by default; `'use client'` only for forms, motion, media manager, nav.
- Next 16 auth gate is **`src/proxy.ts`**, not `middleware.ts`.
- Content edits must `revalidatePath` / `revalidateTag` for public routes (follow `lib/admin/actions.ts`).
- One auth system: Supabase Auth only.
