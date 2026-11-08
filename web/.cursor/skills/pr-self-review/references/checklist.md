# AorySoft PR checklist (grows from real reviews)

## Security

- [ ] No `SUPABASE_SERVICE_ROLE_KEY` / `admin.ts` in client bundles
- [ ] Public writes still go through honeypot → Turnstile → rate limit → validate
- [ ] No new public INSERT/UPDATE/DELETE RLS policies
- [ ] `profiles` still not client-writable; no role self-promotion
- [ ] Admin HTML sanitized on render
- [ ] Cron / export routes still auth-gated

## Correctness

- [ ] Validators match SQL CHECKs for new fields
- [ ] `revalidatePath` / tags updated for public content edits
- [ ] Honest errors (no fake email success; setup null states preserved)
- [ ] Editor vs owner matrix respected in UI **and** actions

## Quality

- [ ] Files ≤450 lines (or split in this PR); known fat files did not grow
- [ ] Tests added/updated per `aorysoft-testing`
- [ ] `npm run typecheck` + `npm run lint` + relevant tests green
- [ ] No drive-by refactors unrelated to the PR goal

## Product

- [ ] No fabricated stats/testimonials/contact data
- [ ] Team section / Exa / second auth not reintroduced
