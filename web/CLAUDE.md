# AorySoft Website (`web/`)

Next.js 16 App Router + React 19 + TypeScript + Tailwind + Supabase (Auth/Postgres/Storage) + Resend + Turnstile. Custom `/admin` panel. Work only in `web/` — never invent a second auth or CMS.

## Detailed docs

| Doc | Path |
|---|---|
| Stack & commands | `.cursor/docs/stack.md` |
| Security / RLS / PII | `.cursor/docs/security.md` |
| Master plan (historical) | `../PROJECT_PLAN.md` |

## Quick file map

| Concern | Owns |
|---|---|
| Public content reads (anon + RLS) | `src/lib/data.ts` |
| Supabase clients | `src/lib/supabase/{client,server,admin}.ts` |
| Public forms (Turnstile → rate → validate → service-role insert → Resend) | `src/lib/public-forms/` |
| Admin CRUD metadata + permissions | `src/lib/admin/{resources,permissions,actions,validate}.ts` |
| Admin auth gate (Next 16) | `src/proxy.ts` |
| Rich-text XSS defense | `src/lib/sanitize.ts` + `SafeHtml` |
| Schema / RLS | `supabase/*.sql` |
| Keep-alive cron | `src/app/api/cron/keep-alive/route.ts` |

## Hard rules

- Every behavior change needs a test (Vitest co-located `*.test.ts`, or `npm run test:rls` / `test:ratelimit` when touching RLS/rate limits).
- Keep files under **450 lines** (warn 300). Do not grow known fat files — split instead.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only (`import "server-only"`). Never `NEXT_PUBLIC_` it. Never import `admin.ts` from client components.
- No public `INSERT`/`UPDATE`/`DELETE` RLS policies. Public writes only via server actions after honeypot → Turnstile → rate limit → validate.
- YAGNI / Ponytail: reuse first; no second auth, Payload, Redux, or new vendors without explicit approval.

## Workflow triggers

- Before writing a plan → run **plan-from-instructions** (save under `plans/`).
- Before a PR → run **pr-self-review**.

## Key commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:rls
npm run test:ratelimit
npm run build
```
