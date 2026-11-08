---
name: pr-self-review
description: >-
  Reviewer-style check before every AorySoft PR: diff scan, claims ledger,
  blast radius (RLS, forms, consumers), a11y candidates. Use when preparing a
  PR, asked to self-review, or before merge. Fix only after the user says yes.
---

# PR self-review

## Mechanical pass

From `web/`:

```bash
node .claude/skills/pr-self-review/scripts/review.mjs origin/main...HEAD
```

If the base branch differs, pass it explicitly. On Windows use the same command in PowerShell / Git Bash.

The script flags: oversized files, possible service-role client imports, raw `dangerouslySetInnerHTML`, and format-only noise hints.

Also open `references/checklist.md` and walk it.

## Then reason through

1. **Claims ledger** — code comments saying “never” / “only” / “always”: mark TRUE / FALSE / STALE / UNPROVEN with grep evidence.
2. **Blast radius** — does a lib change break public pages or admin? Cache `revalidatePath`? Form error contract? RLS?
3. **Failure paths** — Turnstile down, Resend fail, Supabase unset, cron secret missing.
4. **A11y** — labels, focus, keyboard for new interactive UI; contrast for new colors.

## Report format

```
### Findings
🔴 Blockers
🟡 Risks
🟢 OK notes

### Verdict
APPROVE | REQUEST CHANGES

### Proposed fixes
(list only — do not apply until user says yes)
```

## Forbidden

- Auto-fixing before approval  
- Claiming Playwright/Lighthouse ran if they were not  
- Ignoring `test:rls` when SQL/policies changed  
