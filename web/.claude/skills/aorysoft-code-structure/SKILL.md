---
name: aorysoft-code-structure
description: >-
  AorySoft file/function size limits and known fat files. Use when adding code,
  refactoring, or before claiming a change is clean. Prevents silent growth of
  oversized modules.
---

# Code structure

## Limits

| Unit | Warn | Hard max |
|---|---|---|
| File | 300 lines | **500** (target stay ≤450 per CLAUDE.md) |
| Function | 40 lines | 75 |
| Nesting | — | 3 levels |

If a change would push a file over the hard max, **split first** (extract component, lib helper, or field renderer).

## Known violations (must not grow)

| File | ~Lines | Notes |
|---|---|---|
| `src/app/quote/QuoteForm.tsx` | ~687 | Split steps/fields before adding features |
| `src/app/blog/BlogContent.tsx` | ~383 | Prefer extract filters/cards |
| `src/app/contact/ContactContent.tsx` | ~376 | Prefer extract form vs layout |
| `src/app/admin/(panel)/settings/SettingsForm.tsx` | ~309 | At warn threshold |

New code in these files is allowed only if it **reduces** net size or moves logic out in the same PR.

## Prefer

- Co-locate tests next to the module.
- Generic admin CRUD via `resources.ts` over new bespoke pages.
- Small pure validators in `validate.ts` modules.
