# Vercel environment variables (safe workflow)

## What you do **not** need to do

You do **not** paste env vars into Vercel on every deploy.  
Set them **once** on the project; every production/preview build reuses them.

## Why we do **not** commit `.env.production`

Next.js will load `.env.production` if that file is in the deployment bundle.  
If it contains `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, etc. and is committed to GitHub, those secrets are public forever (git history).

So:

| File | Commit? | Purpose |
|---|---|---|
| `.env.example` | ✅ | Dev template |
| `.env.production.example` | ✅ | Prod template (empty) |
| `.env.local` | ❌ | Local secrets |
| `.env.production` | ❌ | Local prod secrets / mirror of Vercel |

## One-time setup on Vercel

1. Create local `web/.env.production` (copy from `.env.production.example`, fill real values — or copy from `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the live domain).
2. In [Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**:
   - Use **Import .env** / paste each key for **Production** (and Preview if you want).
   - Or CLI (from `web/` after `npx vercel link`):

     ```bash
     npx vercel env pull .env.production --environment=production --yes
     ```

     That **downloads** from Vercel → local file (safe direction for day-to-day).

3. Redeploy once so Production picks up any new keys.

## Day-to-day

- Change a secret → update it in the **Vercel dashboard** (or `vercel env add` / edit).
- Refresh your laptop copy:

  ```bash
  npm run env:pull
  ```

- Git pushes to `main` / PRs do **not** require re-entering env vars.

## Root directory

Set the Vercel project **Root Directory** to `web` so builds use this app’s `package.json` and env.
