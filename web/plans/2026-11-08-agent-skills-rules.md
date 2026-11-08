# Agent skills & Cursor rules pack

**Status:** implemented  
**Date:** 2026-11-08

## Goal

Install a 3-layer agent pack (CLAUDE.md + skills + Cursor rules) adapted to AorySoft `web/` (Next.js + Supabase).

## Non-goals

- COPPA/FERPA/PCI compliance skill
- Frontend Redux/Context state-management skill
- Playwright install
- Changing application product code

## What shipped

- `CLAUDE.md` (+ repo-root pointer)
- `.claude/skills/` (10 skills) mirrored to `.cursor/skills/`
- `.cursor/rules/` (always-on + scoped api-integration)
- `.cursor/docs/{stack,security}.md`
- `plans/` + `pr-self-review` checklist + `scripts/review.mjs`

## Verification

- Skill directories present under both `.claude/skills` and `.cursor/skills`
- `node .claude/skills/pr-self-review/scripts/review.mjs` runs from `web/`
