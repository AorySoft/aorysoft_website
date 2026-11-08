# AorySoft security model (short)

## Trust boundaries

| Actor | Can |
|---|---|
| Anon key (browser / public RSC) | `SELECT` published/active public content only (RLS) |
| Authenticated admin JWT | CRUD allowed by RLS + `profiles.role` |
| Service role (server actions / ops) | Bypasses RLS — **only** form inserts, role changes, seeding |

## Public form write path (mandatory order)

1. Honeypot reject  
2. Turnstile verify (`TURNSTILE_SECRET_KEY`)  
3. Per-IP + per-email rate limit (salted hashes in DB)  
4. Server validation mirroring client  
5. Insert with **service role**  
6. Resend notification / confirmation (failure must not fake form failure after row saved — follow existing `actions.ts` behavior)

## Forbidden

- Public INSERT/UPDATE/DELETE policies on any table  
- Client-writable `profiles` (no self-promotion)  
- Shipping `SUPABASE_SERVICE_ROLE_KEY` to the client  
- Rendering admin HTML without `sanitizeContent` / `SafeHtml`  
- Claiming email sent when Resend/`FROM_EMAIL` is misconfigured without honest UI  

## Tests that prove the model

- `npm run test` — unit (validate, turnstile, tokens, sanitize, permissions, …)  
- `npm run test:rls` — anon/editor denial matrix  
- `npm run test:ratelimit` — rate-window integration (needs `.env.local`)  
