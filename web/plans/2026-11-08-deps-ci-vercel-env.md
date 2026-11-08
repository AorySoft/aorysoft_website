# Safe dependency bumps, CI, Vercel env workflow

**Date:** 2026-11-08  
**Status:** implemented

## Goal

Patch deps safely, clear npm audit without breaking Next 16, add PR CI, document Vercel env so secrets are not re-entered each deploy and never committed.

## Done

- Bumped `next` / `eslint-config-next` to 16.4.5, supabase-js, vitest, vite React plugin
- `overrides.minimatch` → `^11.0.5` (clears moderate DoS advisory without `--force`)
- GitHub Actions: `.github/workflows/ci.yml` (typecheck, lint, test in `web/`)
- `.env.production.example` + gitignored local `.env.production` + `docs/vercel-env.md`
- Scripts: `env:pull`, `env:pull:preview`
