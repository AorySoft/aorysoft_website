# Deploy Checklist: Batches 1–9 (`batch-8-ai-native` → production)

For whoever deploys `batch-8-ai-native` to production. Run commands from `web/` unless noted.

## Current state (2026-11-11)

**Database:** migrations **0011–0016 are all applied** to the production Supabase project, including **0013**. They were verified with read-only queries.

| Migration | What it did |
|---|---|
| 0011 | `csp_reports` table |
| 0012 | Service detail columns + `case_studies` |
| 0013 | Anon can read the 15 safe `reviews` columns; `submitter_email` is denied (checked through the public API) |
| 0014 | CSP functions |
| 0015 | Admin write grants on `case_studies` |
| 0016 | Slug-lock triggers |

**Why production is broken right now:** production still runs the old `main` code, which requests `submitter_email`. After 0013 that request fails, so **published reviews are hidden on the live site until this deploy.**

**Test content:** temporary design-review rows are live on the site. All titles say "(test)", and the ids are listed in `web/scripts/test-content-manifest.json`.

## 1. Remove the test content

- [ ] **Dry run (read-only):** `node --env-file=.env.local scripts/seed-test-content.mjs --remove --dry-run`. It should list 3 posts, 3 reviews, 2 case studies, 2 jobs, 4 services, 3 subscribers, 2 categories, 6 media rows and 6 storage files.
- [ ] **Remove:** `node --env-file=.env.local scripts/seed-test-content.mjs --remove`. It deletes only the ids in the manifest; existing rows are never touched.
- [ ] **Confirm:** run the dry run again. It should say "already removed" and "would delete 0".
- [ ] **Commit** the updated manifest (it records `removedAt`).

Removing the content changes the gates:
- `/blog`, `/work` and `/reviews` go back to their empty or 404 states.
- The test service pages disappear.
- The nav loses Blog and Case studies.

## 2. Build checks (local)

- [ ] `npm run build`, then `npm run check:seo` (exit 0). Exit 2 means the check could not run, which is an environment problem, not a content failure.
- [ ] Optional: `npm run lint && npm run typecheck && npm run test`.

## 3. Vercel environment variables

Set these for both **Production** and **Preview**.

- [ ] **`NEXT_PUBLIC_SUPABASE_URL`:** the build fails without it (image allowlist).
- [ ] **`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`**
- [ ] **`NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`:** forms fail closed without the secret, Preview included.
- [ ] **`NEXT_PUBLIC_SITE_URL` = `https://www.aorysoft.com`:** canonicals, sitemap, JSON-LD and the OG image URL.
- [ ] **Unchanged, but confirm they're set:** `RESEND_API_KEY`, `TO_EMAIL`, `FROM_EMAIL`, `NEWSLETTER_TOKEN_SECRET`, `RATE_LIMIT_SALT`, `CRON_SECRET`, `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`, `GOOGLE_SITE_VERIFICATION`.

## 4. Merge and deploy

- [ ] Open a PR `batch-8-ai-native` → `main`, review, then merge. No new migrations are needed.
- [ ] Vercel production deploy from `main`. Wait for it to finish, then run the checks below.

## 5. Post-deploy checks (production)

- [ ] **Home reviews:** the real published review shows in "Client reviews" again (it is hidden until this deploy). With 0 reviews the section is hidden, which is expected.
- [ ] **Anon key cannot read emails:** `curl "$SUPABASE_URL/rest/v1/reviews?select=submitter_email&limit=1" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"` must return **401 / 42501 permission denied**. `select=id,display_name` must return 200.
- [ ] **Feedback form:**
  1. Create an invite in `/admin/reviews`, open the link and submit.
  2. The review appears as *pending* and the invite shows *used*.
  3. Delete the test row afterwards.
- [ ] **Admin case studies:**
  1. As an editor: create a draft and edit it, then publish.
  2. Try to change the slug and expect the "locked because the page has been published" message.
  3. Unpublish: the slug stays locked.
  4. Delete works for the **owner** only; editors get the owner-only message.
- [ ] **CSP endpoint:**
  1. `curl -i -X POST https://www.aorysoft.com/api/csp-report -H "content-type: application/csp-report" -d '{"csp-report":{"effective-directive":"img-src","blocked-uri":"https://example.invalid/x?q=1","document-uri":"https://www.aorysoft.com/deploy-check"}}'` must return `204`.
  2. `/admin/csp-reports` shows it with the query string stripped.
  3. A body over 16 KB returns `413`.
  4. Clean up: `delete from public.csp_reports where document_path = '/deploy-check';`
- [ ] **Headers:** `curl -sI https://www.aorysoft.com/` shows the security headers and `Content-Security-Policy-Report-Only` (including `cloudflareinsights.com`).
- [ ] **robots / sitemap / llms:**
  - `curl -s https://www.aorysoft.com/robots.txt`: `*` plus the AI crawler groups.
  - `/sitemap.xml` and `/llms.txt`: only live pages; no `test-` URLs once the test content is removed.
- [ ] **Raw HTML of key pages:** for `/`, `/services`, `/about`, `/contact` and `/privacy`, `curl -s <url> | grep -o '<h1[^>]*>[^<]*'` shows the page h1, and the main copy is in the HTML. No `aria-label="Loading"` spinner should appear.
- [ ] **OG image:** `https://www.aorysoft.com/opengraph-image` shows the official A mark and the wordmark.
- [ ] **Privacy page:** the "Cookies and browser storage" table renders.
- [ ] **Speed:** run PageSpeed Insights (mobile and desktop) on `/` and `/services`.
- [ ] **Clean up the Phase A test row** if it's still there: `delete from public.csp_reports where document_path = '/verify' and blocked_uri like 'https://verify.test/%';`

## 6. After real content is in the admin (not before)

- [ ] **Fill the CMS:** the services (slug, overview, at least 4 deliverables, icon; process, tech and FAQs optional), the first case study, at least 3 permitted reviews and the first post.
- [ ] **Re-check:** `npm run check:seo`, `/sitemap.xml` and `/llms.txt`.
- [ ] **Search engines:** **only then** submit `https://www.aorysoft.com/sitemap.xml` to **Google Search Console** and **Bing Webmaster Tools**, so the first crawl sees real pages, not empty gates.
- [ ] **CSP:** after 7–14 days of reports in `/admin/csp-reports`, decide whether to enforce it (re-add `upgrade-insecure-requests` when enforcing).

## Rollback

| What | Rollback | Caveat |
|---|---|---|
| **Code deploy** | Vercel → Deployments → promote the previous production deploy | The old code needs `reviews.submitter_email`, so reviews disappear again while it runs (see 0013). |
| 0013 | `grant select on table public.reviews to anon;` | Re-exposes `submitter_email` to the anon key. Use only to restore reviews for old code. |
| 0016 | `drop trigger if exists services_slug_lock on public.services; drop trigger if exists case_studies_slug_lock on public.case_studies;` | The app still locks slugs via the publish threshold. |
| 0015 | `revoke insert, update, delete on table public.case_studies from authenticated;` | Admin case-study CRUD fails again. |
| 0014 | `drop function if exists public.record_csp_report(text,text,text); drop function if exists public.prune_csp_reports(integer,integer);` | The app falls back automatically. |
| 0012 | Destructive (drops `case_studies` and the service detail columns) | Roll back the code first, or restore from a backup. |
| 0011 | `drop table if exists public.csp_reports cascade;` (drop 0014's functions first) | Loses collected CSP reports. |
| Test content (if removed by mistake) | `node --env-file=.env.local scripts/seed-test-content.mjs` re-seeds after a completed `--remove` | Creates new ids; the manifest is rewritten. |
