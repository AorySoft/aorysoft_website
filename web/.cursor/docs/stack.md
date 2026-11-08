# AorySoft `web/` — stack reference

## Runtime

| Piece | Choice |
|---|---|
| Framework | Next.js 16 App Router (`next@16.4.x`) |
| UI | React 19, Tailwind 3, Framer Motion, lucide-react |
| Data | Supabase Postgres + Auth + Storage |
| Clients | `@supabase/ssr` (cookie sessions), `@supabase/supabase-js` |
| Email | Resend via `fetch` (no Resend SDK) — `src/lib/public-forms/email.ts` |
| Spam | Cloudflare Turnstile + honeypot + DB rate window |
| Analytics | Cloudflare Web Analytics + optional `@vercel/analytics` |
| Hosting | Vercel (`vercel.json` daily keep-alive cron) |

## Layout

```
web/
├── src/app/           # routes (public + admin + api)
├── src/components/    # public UI sections
├── src/lib/           # data, admin, public-forms, supabase, sanitize
├── src/proxy.ts       # Next 16 auth gate for /admin/* (replaces middleware.ts)
├── supabase/          # SQL migrations (schema, RLS, storage, seed, rate limits)
├── scripts/           # RLS / rate-limit integration checks
└── plans/             # saved implementation plans
```

## Env (see `.env.example`)

Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, Turnstile site key, Cloudflare analytics token.

Secret (server only): `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TO_EMAIL`, `FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, `CRON_SECRET`, optional `DATABASE_URL` (migrations only).

## Admin areas

Generic CRUD resources: `posts`, `categories`, `services`, `jobs` via `src/lib/admin/resources.ts`.

Dedicated: submissions, newsletter, media, site settings, users — under `src/app/admin/(panel)/`.

Roles: `owner` | `editor` — UX in `permissions.ts`; **RLS is real enforcement**.
