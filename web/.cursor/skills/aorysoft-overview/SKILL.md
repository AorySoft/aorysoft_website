---
name: aorysoft-overview
description: >-
  AorySoft web stack index, commands, and skill map. Use when starting work in
  web/, onboarding, choosing which skill to load, or when unsure where code
  lives. Prefer this before inventing new folders or vendors.
---

# AorySoft overview

**Stack:** Next.js 16 App Router · React 19 · TS · Tailwind 3 · Supabase · Resend (fetch) · Turnstile · Vercel.

**Scope:** only `web/`. Frozen/old Vite apps are out of scope.

## Commands

| Task | Command |
|---|---|
| Dev | `npm run dev` |
| Lint | `npm run lint` |
| Types | `npm run typecheck` |
| Unit tests | `npm run test` |
| RLS matrix | `npm run test:rls` |
| Rate-limit IT | `npm run test:ratelimit` |
| Prod build | `npm run build` |

## Skill index

| Skill | When |
|---|---|
| `aorysoft-architecture` | data flow, layers, where to put code |
| `aorysoft-conventions` | naming, imports, patterns |
| `aorysoft-code-structure` | size limits, fat files |
| `aorysoft-api-integration` | forms, admin actions, cron, Supabase writes |
| `aorysoft-security-pii` | RLS, service role, PII, sanitize |
| `aorysoft-testing` | which test where |
| `aorysoft-yagni` | least code; reject scope creep |
| `plan-from-instructions` | before writing a plan |
| `pr-self-review` | before opening a PR |

## Longer docs

`.cursor/docs/stack.md` · `.cursor/docs/security.md` · `../PROJECT_PLAN.md`
