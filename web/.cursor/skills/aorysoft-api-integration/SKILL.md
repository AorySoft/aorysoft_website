---
name: aorysoft-api-integration
description: >-
  AorySoft server actions, public forms, admin mutations, cron routes, and
  Supabase write paths. Use when editing src/lib/public-forms, src/lib/admin,
  src/app/api, newsletter token routes, or adding any endpoint/mutation.
---

# API & mutations

This app is mostly **server actions** + a few **route handlers**, not a separate REST API.

## Add a public form field / flow

1. Extend validators in `src/lib/public-forms/validate.ts` (+ test).
2. Update `actions.ts` pipeline — order is fixed:

   `honeypot → Turnstile → rate limit → validate → service-role insert → email`

3. Update UI form + `TurnstileField` if needed.
4. Mirror DB `CHECK` / columns in `supabase/*.sql` if schema changes.
5. Run `npm run test` (and `test:ratelimit` if touching rate limits).

## Add an admin resource field

1. SQL migration in `supabase/`.
2. Types in `src/lib/types.ts` if needed.
3. Field on `ResourceDef` in `src/lib/admin/resources.ts`.
4. Validator in `src/lib/admin/validate.ts` (+ test).
5. Ensure `revalidatePath` covers public routes that read it.

## Route handlers

| Route | Role |
|---|---|
| `app/api/cron/keep-alive/route.ts` | Bearer `CRON_SECRET`; anon SELECTs only |
| `app/newsletter/confirm/route.ts` | Signed token → confirm subscriber |
| `app/newsletter/unsubscribe/route.ts` | Signed token → unsubscribe |
| `admin/.../export/route.ts` | Auth'd CSV export |

## Error contract (public forms)

| Situation | Browser sees | Server logs |
|---|---|---|
| Validation | Field errors via `FormState` | optional |
| Spam / rate / Turnstile | Generic failure string | real reason |
| DB / email infra | Generic failure (email fail after insert = success + log) | real reason |

**Forbidden**

- Returning SQL / constraint text to the browser  
- Public INSERT policies “to simplify forms”  
- New npm email/spam SDK without approval (use existing fetch Resend + Turnstile)  
- Skipping Turnstile when `TURNSTILE_SECRET_KEY` is set  
- Cron route without `CRON_SECRET` check  
