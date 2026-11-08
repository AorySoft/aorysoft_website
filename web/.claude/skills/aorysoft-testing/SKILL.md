---
name: aorysoft-testing
description: >-
  AorySoft Vitest layout, RLS/rate-limit scripts, and which change needs which
  test. Use when adding features, fixing bugs, writing tests, or before claiming
  work is done. Run the matching command and keep the output green.
---

# Testing

## Tools

| Layer | Tool | Location |
|---|---|---|
| Unit | Vitest + Testing Library + jsdom | `src/**/*.test.ts(x)` |
| Setup | `src/test/setup.ts`, `server-only` stub in vitest config | — |
| RLS | Node scripts | `npm run test:rls` → `scripts/*rls*` |
| Rate limit | Node + `.env.local` | `npm run test:ratelimit` |

Playwright E2E is planned but **not installed** — do not claim E2E coverage exists. Prefer Vitest until Playwright is added on purpose.

## Which change → which test

| Change | Test |
|---|---|
| Validator / pure helper | Co-located `*.test.ts` |
| Turnstile / tokens / email builders | Existing suites in `public-forms/` |
| Sanitize / SafeHtml | `sanitize.test.ts`, `safe-html.render.test.tsx` |
| Permissions matrix | `permissions.test.ts` |
| Public form action branches | `actions.test.ts` (mock clients) |
| RLS / policy SQL | `npm run test:rls` |
| Rate-limit window | `npm run test:ratelimit` |
| UI-only copy/layout | Smoke via `lint` + `typecheck`; add RTL only if logic/a11y behavior |

## Commands

```bash
npm run test
npm run test:rls
npm run test:ratelimit
npm run typecheck
npm run lint
```

## Rules

- Mock Supabase / fetch — do not hit production DB in unit tests.
- `server-only` is stubbed in Vitest; real builds still enforce it.
- **Do not claim done** without running the relevant command(s) above.
