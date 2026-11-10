# Reviews feature + social links + QuoteForm split + admin Operate restyle

**Date:** 2026-11-10 · **Status:** implementing (owner: "do these first")

## Goal

1. Ship confirmed social URLs in the footer (and site_settings seed).
2. Reviews: SQL/RLS + admin CRUD + public display + public submit→pending approval; Fiverr via manual admin entry with `permission_confirmed`.
3. Split QuoteForm per `2026-11-09-quoteform-refactor.md`.
4. Restyle `/admin` Operate UI onto Signal Atelier tokens.

## Non-goals

- No fabricated review seed rows.
- No Playwright E2E install.
- Reviews are invite-only: admin mints `/feedback?token=…`; no public homepage form.

## Verification

`npm run typecheck` · `npx vitest run --pool=threads` · apply `0009_reviews.sql` to live project · browser: footer links, `/admin/reviews`, home Reviews empty state, quote wizard steps.
