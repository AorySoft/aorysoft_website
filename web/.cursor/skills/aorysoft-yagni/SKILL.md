---
name: aorysoft-yagni
description: >-
  AorySoft YAGNI / Ponytail ladder: reuse first, smallest safe change, no
  over-engineering. Use when designing features, reviewing diffs, tempted to add
  libraries, CMS, state managers, or speculative abstractions.
---

# YAGNI (Ponytail ladder)

1. **Reuse** existing `resources.ts`, form pipeline, sanitize, supabase helpers.  
2. **Stdlib / already-deps** (fetch, Next cache, Vitest).  
3. **Minimum new code** in the correct layer.  
4. **New dependency / vendor** only with explicit owner approval.

## Never cut

Validation · tests · a11y basics · RLS / auth checks · honest error states.

## Red flags

| Smell | Prefer |
|---|---|
| New CMS / Payload / second auth | Keep custom `/admin` + Supabase Auth |
| Redux/Zustand for marketing pages | RSC props + light `useState` |
| Resend/Turnstile SDK wrappers | Existing `email.ts` / `turnstile.ts` |
| “Future i18n / bookings / member accounts” | Defer — plan §16 scope gate |
| Abstractions for one call site | Inline until third use |
| Growing `QuoteForm.tsx` further | Split file first |

## Diff taste

✅ Small validator + test + wire into action  
❌ New framework folder “for cleanliness” with no caller  

✅ Extend `FieldDef` kind  
❌ Parallel admin form system  

## Product content rule

Only real, approved contact data, stats, logos, testimonials. No fabricated trust content.
