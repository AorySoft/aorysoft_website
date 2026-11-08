---
name: aorysoft-security-pii
description: >-
  AorySoft RLS, service-role rules, PII handling, XSS sanitization, and admin
  role escalation defenses. Use when touching supabase SQL, auth, forms,
  submissions, newsletter, profiles, sanitize, or anything with emails/IPs.
---

# Security & PII

Not COPPA/FERPA/PCI — this is a marketing site with **form PII** and an **admin CMS**.

## Defaults

- RLS **default-deny**; anon reads published/active content only.
- `profiles`: no client INSERT/UPDATE; roles via service-role / dashboard only.
- Permission matrix: `src/lib/admin/permissions.ts` (owner vs editor). RLS still wins.

## PII tables

| Table | Treat as |
|---|---|
| `submissions` | Admin-only; export/delete; never public list |
| `newsletter_subscribers` | Owner-only management; double opt-in; signed tokens |
| Rate-limit hashes | Salted IPs — not raw IPs in logs/UI |

## XSS

- Persist admin HTML as stored; **sanitize on render** via `sanitizeContent` / `SafeHtml`.
- Never `dangerouslySetInnerHTML` with unsanitized `body_html`.

## Service role

✅ `getServiceClient()` inside server actions after checks  
❌ Import `admin.ts` in client components  
❌ `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

## When changing RLS / roles

1. Update `supabase/*.sql`.
2. Update `permissions.ts` if UX matrix changes.
3. Run `npm run test:rls`.
4. Document in PR: what anon/editor/owner can no longer do.

## Audit-ish checklist (lightweight)

- [ ] Anon cannot read submissions / pending subscribers / drafts  
- [ ] Editor cannot promote self or edit site settings / users / newsletter  
- [ ] Owner delete paths remain owner-only  
- [ ] Form errors do not enumerate subscribers  
