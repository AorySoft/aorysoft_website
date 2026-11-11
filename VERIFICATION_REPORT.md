# Verification Report: Frontend Audit Batches 1–7

**Date:** 2026-11-11
**Scope:** Independent check of the Cursor-made Batches 1–7 in `web/`. Phase A only: no code, migration, or env changes.
**Method:** Code read, `git diff HEAD`, all gates run locally, production build served locally (`next start -p 3470`) and checked with curl, plus real Chromium checks through Playwright.

## 0. Baseline facts (read first)

- **The tag `pre-claude-code-verify` does not exist.** `git tag --list` is empty.
- **All Batch 1–7 work is uncommitted** in the working tree on branch `fix/disable-admin-analytics`: 70 modified or deleted tracked files plus about 45 untracked files and folders. The pre-audit baseline is therefore `HEAD` = `d68865d` ("Disable analytics on /admin…"). Every "before" comparison below is against `HEAD`.
- **Risk:** one bad `git checkout`/`stash`/`clean` would lose all seven batches. Recommendation: commit the current state to a branch (or at least create the tag) before Phase B starts.
- Local build data state at check time: 0 published posts, 0 published case studies, fewer than 3 published reviews, and 0 services meeting the detail threshold. So `/work`, `/reviews` and `/services/*` were all in their gated (404) state, and `/blog` was noindex. Populated-state rendering could not be exercised (see §5).

---

## 1. Summary

**Overall verdict: mostly sound, with some issues before shipping.** Most findings are implemented as claimed and the gates are green. However:

- **1 finding is Wrong** (F16: wildcard Supabase host remains).
- **5 are Partial** (F03, F14, F30, F31, F36).
- **4 regressions** were introduced by the batches (home title doubled, blog hover lift broken, ConfirmDialog focus handling, Footer turned into a client component).
- **1 structural gap** affects the new gating: nav gating and the sitemap are frozen at build time on static pages.
- A pre-existing **privacy issue** came to light: the review submitter email column is readable by the anon key. It was not introduced by the batches.

### Gate results (run in `web/`)

| Gate | Result | Detail |
|---|---|---|
| Install | ⚠️ **`npm ci` failed** (EPERM) | Your running `npm run dev` (PID 37280) holds `@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node`. `npm ci` deleted most of `node_modules` before failing. Restored with `npm install` (added 402, changed 104). **`package-lock.json` unchanged** (git status clean for it). Your dev server may need a restart. |
| Lint | ✅ 0 errors, 2 warnings | `scripts/apply-reviews-and-social.mjs:5` and `scripts/check-db.mjs:2` (unused `readFileSync`). Both pre-existing, outside `src/`. |
| Typecheck | ✅ clean | `tsc --noEmit` exit 0 |
| Tests | ✅ **22 files, 166 passed** | Matches the audit claim. One Vite notice (`VITE_CONFIG_NATIVE_IGNORE_WARNING`). |
| Build | ✅ exit 0 | Warning: Next inferred the workspace root because `C:\Users\DELL\package-lock.json` exists outside the repo. Set `turbopack.root` or delete that stray lockfile. |
| SEO check (`check-indexable-pages`) | ✅ OK, and **proven to fail** (§A2 Batch 6) | But the title, description and JSON-LD checks are vacuous for real pages (see risk N6). |

---

## 2. Findings F01–F38

Legend: ✅ Verified · 🟡 Partial · ❌ Wrong · ⏸ Pending (not in scope) · ❔ Cannot verify here

| ID | Claimed | Verdict | Evidence | Action needed |
|---|---|---|---|---|
| F01 | Partial | ✅ Verified (Report-Only as decided) | curl `/`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Reporting-Endpoints: csp="/api/csp-report"` (exact), `Content-Security-Policy-Report-Only` with `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `report-uri`, `report-to csp`. `next.config.ts:35-102`. | **2 allowlist bugs:** (a) the Cloudflare beacon POSTs to `https://cloudflareinsights.com/cdn-cgi/rum`, which is not in `connect-src` (only `static.` is listed). Seen in Chromium. Analytics will break when CSP is enforced. (b) `upgrade-insecure-requests` is ignored in Report-Only, and Chromium logs a console error on every page. Remove it from the RO header. |
| F02 | Fixed | ✅ | `components/capabilities/serviceModel.ts:52-61` returns `[]` and placeholders only via an option. `testPlaceholders.ts` is imported only by `serviceModel.test.ts:4`. Grep for sample/dummy/placeholder data in prod paths: none. | None |
| F03 | Fixed | 🟡 Partial | Every public HTML route is under `app/(marketing)/` with `MarketingShell` (Navbar, skip link, Footer, analytics). The admin `(panel)/layout.tsx` has no public chrome. Every marketing page curl shows nav=1, footer=1. No orphan HTML route (`*.md`, `llms*`, `newsletter/*` are route handlers by design). **But** no `error.tsx`/`not-found.tsx` exists under `app/admin/`, so admin `notFound()` calls (`[resource]/page.tsx:19`, `[resource]/[id]/page.tsx:54`, `submissions/[id]/page.tsx:22,34,42`) and admin render errors fall through to the root `app/not-found.tsx` (wraps `MarketingShell`) and `app/error.tsx` (wraps `MarketingChromeClient`). Admin 404s and errors therefore show **public** nav and footer. | Add `app/admin/not-found.tsx` + `app/admin/error.tsx` (admin-styled, no public chrome). |
| F04 | Fixed | ✅ | `(marketing)/blog/[slug]/page.tsx`: no `gray-*`, `cyan-*`, `rounded-full` or `border-l-4` (grep). Atelier tokens are used. | None |
| F05 | Fixed | ✅ | `admin/login/page.tsx:17-18` uses `bg-canvas` + `surface-panel`. | None |
| F06 | Fixed | ✅ | curl: `/llms.txt` and `/llms-full.txt` return 200 with `text/plain; charset=utf-8`, built from `getIndexablePages()` (`lib/seo/llms.ts`). Gated pages are absent. | See N1: llms is dynamic, but the sitemap is static, so they diverge after content changes. |
| F07 | Fixed | ✅ (minor drift) | `components/SiteJsonLd.tsx` Organization + WebSite with `@id`, `sameAs` from `lib/social.ts`. Rendered on every page. | Minor: per-page JSON-LD (`about/page.tsx:35-59`, `services/[slug]/page.tsx:61-110`) builds its own `siteUrl` and duplicates the Organization instead of referencing `#organization`. The Footer tagline (`Footer.tsx:35-37`) differs from `SITE_DESCRIPTION`. |
| F08 | Fixed | ✅ (brand note) | `/opengraph-image` returns 200 `image/png` at 1200×630. `og:image` and `twitter:image` meta are present and `twitter:card=summary_large_image`. | The image uses a cyan letter "A" in Georgia (`opengraph-image.tsx:24-39`), **not the official BrandMark**. Consider folding into Batch 8. |
| F09 | Fixed | ✅ Verified in Chromium (390 px) | Open: focus on the first link; `#main-content` and `footer` inert. Tab from the last item wraps to "Home". Escape closes, focus returns to "Open menu", inert is removed. `Navbar.tsx:51-93`. | Minor: the X/close button is outside the trapped panel, so keyboard users can close only with Escape. |
| F10 | Fixed | ✅ | `aria-invalid` + `aria-describedby` → `*-error` ids in `contact/ContactForm.tsx:75-187`, `quote/steps/ContactStep.tsx:50-124`, `blog/NewsletterSignup.tsx:49-84`, `ReviewSubmitForm.tsx:64-90`. | None |
| F11 | Fixed | ✅ | `settings/SettingsFields.tsx:12` makes `htmlFor: string` required and wires it at line 18. | None |
| F12 | Fixed | ✅ | `submissions/page.tsx:20-30, 110-128`: type links keep `status` and status links keep `type`. | None |
| F13 | Fixed | ✅ | `AdminNav.tsx:80,103`: Sign out in both desktop and mobile. | None |
| F14 | Fixed | 🟡 Partial | No `window.confirm` anywhere (grep). `ConfirmDialog` is used by ResourceTable, ConfirmDeleteButton and MediaManager. **Bugs** (regression R3): effect deps `[open, onCancel, pending]` (`ConfirmDialog.tsx:69`), with every consumer passing an inline `onCancel`, so the effect tears down and re-runs on every parent render (cleanup refocuses the trigger, setup re-captures `activeElement` and forces focus to Cancel). When `pending` flips, the trigger and Cancel are disabled, so focus return after the action is lost. On a failed delete the `role="alert"` error renders **behind the modal overlay** (`ConfirmDeleteButton.tsx:54-58`) while the dialog stays open. | Fix the effect (capture focus once on open; ref-stable `onCancel`). Render the error inside the dialog. |
| F15 | Pending | ⏸ | Batch 8 | Plan first (Phase B) |
| F16 | Fixed | ❌ **Wrong** | `next.config.ts:89-96` still includes `{ hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }` **unconditionally**. The exact host is only *added* in front (`:97-112`). Any Supabase project's public bucket can be proxied through our `/_next/image` optimizer. | Drop the wildcard. Use only the exact host from `NEXT_PUBLIC_SUPABASE_URL`, and fail the build or warn if it's missing. |
| F17 | Fixed | ✅ | Raw HTML (curl): `/contact` h1 "Contact" + lead copy + aside copy; `/blog` h1 "AorySoft Blog" + intro copy. A visible-copy diff against `HEAD`'s `ContactContent.tsx`/`BlogContent.tsx` shows the same strings (only the honeypot label moved into `HoneypotField`). | None |
| F18 | Fixed | ✅ | curl `/robots.txt`: `*` + 9 AI UAs, each repeating all 5 Disallow lines. `lib/seo/robots-policy.ts` + test. | None |
| F19 | Fixed | ✅ | No `rounded-full` under `app/admin`. No gray/blue/cyan/slate classes in any touched file (scripted grep across all modified and new `.tsx`). | Amber/red status colors remain (semantic, acceptable). |
| F20 | Fixed | ✅ | `[resource]/new/page.tsx:47-50`, `[resource]/[id]/page.tsx:57-60` load options for any `mediaRef`/`categoryRef`. | None |
| F21 | Fixed | ✅ | `UserRoleForm.tsx:57,62`, `SubmissionStatusForm.tsx:60,65` (`role="alert"` / `role="status"`). | None |
| F22 | Fixed | ✅ | `<meta name="theme-color" content="#000000">`, `<meta name="color-scheme" content="dark">`. `/manifest.webmanifest` returns 200 `application/manifest+json`. | None |
| F23 | Fixed | ✅ Verified in Chromium | With `reducedMotion: reduce`, computed `animation-name` is `none` for `.animate-spin` and `.atelier-fade-up` (`globals.css` additions). | None |
| F24 | Fixed | ✅ | `blog/BlogIndex.tsx:151-152` `role="group" aria-label="Filter by category"`. | None |
| F25 | Fixed | ✅ | `BlogIndex.tsx:35` alt falls back to the title; `[slug]/page.tsx:170`. | None |
| F26 | Fixed | ✅ | `NewsletterSignup.tsx:61` `hover:shadow-signal`. | None |
| F27 | Fixed | ✅ | `[slug]/page.tsx:182` `[&_blockquote]:border-l [&_blockquote]:border-line`. | None |
| F28 | Fixed | ✅ | `Footer.tsx:19` "Case studies" → `/work`, gated by `showWork`. | None |
| F29 | Fixed | ✅ | `Navbar.tsx:28-36`, `Footer.tsx:15-21`: About/Services always; Blog/Work gated. | See N1 (gate is frozen on static pages). |
| F30 | Fixed | 🟡 Partial | Blog Framer removed and replaced by `.atelier-fade-up`. **Regression R2 (confirmed in Chromium):** `animation-fill-mode: both` keeps `transform: translateY(0)`, which overrides `hover:-translate-y-1` on blog cards. Probe test: with fade-up, hovered transform = `matrix(1,0,0,1,0,0)`; control = `matrix(1,0,0,1,0,-4)`. Also `whileInView` became on-mount, so the below-fold newsletter block animates unseen. | Animate opacity only, use `fill-mode: backwards`, or use the `translate` property instead of `transform`. |
| F31 | Partial | 🟡 Partial (claim accurate) | Final line counts: `SettingsForm.tsx` **265** (was 331) + `SettingsFields.tsx` **106**; `resource-catalog.ts` **367**, `resource-input.ts` **129**, `resource-types.ts` **109**, `resources.ts` **17** (was 420); `QuoteForm.tsx` **162**, **not split** (moved only, was 170). Largest files: `public-forms/validate.ts` 380, `public-forms/actions.ts` 379, `ResourceForm.tsx` 314. None over 450. | Optional. `resources.ts` and `resource-input.ts` start with a UTF-8 BOM; strip it. |
| F32 | Fixed | ✅ | `admin/(panel)/layout.tsx:39,51` skip link → `#admin-main`. | None |
| F33 | Fixed | ✅ | `turnstile.ts:48-53` fails closed when `NODE_ENV=production`; test `turnstile.test.ts:41-43`. | Note: `NODE_ENV=production` also applies to **Vercel Preview** and local `next start`. Previews need `TURNSTILE_SECRET_KEY` or forms show "temporarily unavailable". |
| F34 | Pending | ⏸ | Batch 9 | Batch 9 |
| F35 | Fixed | ✅ | `lib/public-forms/token-page.ts`: no off-token classes (grep). | None |
| F36 | Fixed | 🟡 Partial | Richer description, keywords and canonical present (`(marketing)/page.tsx:14-28`). **Regression R1:** home `<title>` is now `AorySoft \| AI-first solutions, real-world impact \| AorySoft`. The page sets `title: "AorySoft \| …"`, which goes through the layout template `%s \| AorySoft` (`layout.tsx:37`). At `HEAD` the home page had no title and used the layout default. | `title: { absolute: "AorySoft \| AI-first solutions, real-world impact" }`. |
| F37 | Fixed | ✅ | `AdminTableShell` used by ResourceTable, submissions, newsletter, users, csp-reports. | None |
| F38 | Fixed | ✅ | `HoneypotField.tsx`: wrapper `hidden` + `aria-hidden`, input `hidden`, `tabIndex={-1}`, `autoComplete="off"`, `name="website"`. Hidden inputs are still submitted, and the server check is `actions.ts:78-81`. Tests at `actions.test.ts:199` (contact), `:277` (quote), `:365` (newsletter). | No honeypot or `submitReview` test for the feedback form. Add one. |

### Batch-level checks not tied to a single F-ID

**Batch 1 / CSP report endpoint (Batch 2)**
- Rate limit ✅. 40 per minute per IP: the 41st request returned 429 (curl). Memory-only per instance (`csp-report-rate-limit.ts`), so it's weak on serverless.
- 16 KB cap ✅. A 20 KB body returned 413. Caveat: `request.text()` buffers the whole body before the length check when `Content-Length` is absent, and `text.length` counts characters, not bytes.
- RLS on `csp_reports` ✅ (`0011:19`). No anon policy. `revoke all … from anon, authenticated` then `grant select to authenticated` with policy `is_admin()`. `is_admin()` is **owner-only** (`0002_rls.sql:7-18`).
- Service role only on the server ✅. `lib/csp-reports.ts` has `import "server-only"`. No service-role strings in `.next/static` or in any page HTML.
- Retention prune ✅ exists (30 days plus a 500-row cap), but runs on **every** request (N3).
- Owner-only admin view ✅. `csp-reports/page.tsx` checks `role !== "owner"` before `getServiceClient()`.

**Batch 5**
- `/services/[slug]` gate ✅. `services-publish.ts:4-19` requires active, slug, non-empty description and ≥4 non-empty deliverables. `/services/ai-chatbots` and an unknown slug both 404 in the current data.
- `/work` (≥1) and `/reviews` (≥3) ✅. Both return 404 now; `work/page.tsx:25`, `reviews/page.tsx:34`.
- `/blog` noindex until the first post ✅ (`<meta name="robots" content="noindex, nofollow">`).
- Nav/footer gating ✅ in code, but frozen on static pages (N1).
- Slug lock on the server ✅ (`lib/admin/actions.ts:103-112`) for `services` and `cases`. Validation ✅ (`validate.ts:44-62`, DB check constraint `0012:15-19`, partial unique index `0012:33-35`). Not enforced at DB level: an editor could still change it through the REST API with their own JWT (N9). **UI lock is broader than the server lock** (R5).
- `case_studies` RLS ✅. Public select only `status='published'` (`0012:57-59`). No anon insert, update or delete. Editors write, delete is owner-only.
- Service JSON-LD ✅. Only real fields (name, description, url, dateModified, provider, breadcrumb, FAQ only if FAQs exist). **No `AggregateRating` anywhere** (grep).
- Revalidation 🟡. `revalidateFor` (`actions.ts:56-65`) revalidates page paths only. It never revalidates the layout (nav gate) or `/sitemap.xml`, and reviews revalidate only `/` (`resource-catalog.ts:365`), not `/reviews`.
- Admin-authored long-form fields: service fields and the case study `body` are plain text rendered through React escaping (`work/page.tsx:52-54` `whitespace-pre-wrap`). Not HTML, so `SafeHtml` isn't required. Posts still use `SafeHtml` (`blog/[slug]/page.tsx:180`).

**Batch 6**
- Sitemap ✅ excludes gated pages, but it's **static** (route table `○ /sitemap.xml`, no revalidate) and every `lastmod` = build time (N1, N5).
- `/about.md` and `/services.md`: `X-Robots-Tag: noindex` and `Link: <…>; rel="canonical"` ✅. Content type is **`text/markdown; charset=utf-8`**, not `text/plain`. That's valid; switch only if you specifically want `text/plain`. `/about.md` is `force-static` with hard-coded copy (`about.md/route.ts:8-37`) that duplicates `/about` and `ProcessLine`. It matches today but isn't generated from live data. `/services.md` returns 404 with no published details ✅. When it does render, it prints internal CMS jargon: "Detail page not published yet (needs overview + 4 deliverables)" (`services.md/route.ts:52-54`).
- robots ✅ (F18).
- Brand data: `lib/site.ts` feeds metadata, JSON-LD, llms and manifest ✅. Footer tagline and OG image drift (F07/F08).
- **SEO check proven to fail:** a scratch copy of `check-indexable-pages.mjs` (only the spawn target swapped for a mock server; diff is 2 lines) against pages with one element removed each produced `missing <title>`, `missing meta description`, `missing canonical`, `missing <h1>`, `missing JSON-LD`, plus `/work is not in sitemap but is linked in llms output`, with **exit 1**. Scratch files are in the session scratchpad, not the repo.

**Batch 7**: F16 ❌, F17 ✅, F30 🟡, F31 🟡 (see table).

---

## 3. Regressions found

| # | Severity | What broke | Evidence | Was good at `HEAD`? |
|---|---|---|---|---|
| R1 | **Major** | Home `<title>` has the brand twice | curl `/`: `<title>AorySoft \| AI-first solutions, real-world impact \| AorySoft</title>`; `(marketing)/page.tsx:15` + `layout.tsx:37` | Yes (layout default title) |
| R2 | Minor | Blog card hover lift no longer works | Chromium probe (F30 row); `globals.css` `.atelier-fade-up … both`; `BlogIndex.tsx:183` | Yes (Framer, no transform lock) |
| R3 | **Major** (admin a11y) | ConfirmDialog: focus jumps on re-render, focus return lost after confirm, error hidden behind the overlay | `ConfirmDialog.tsx:33-69`; `ConfirmDeleteButton.tsx:54-68`; same inline `onCancel` in `ResourceTable.tsx:240`, `MediaManager.tsx:275` | `window.confirm` was crude but kept focus |
| R4 | Minor | `Footer` became a client component. `new Date().getFullYear()` renders at build on static pages and again at hydration (year-boundary mismatch), plus extra client JS on every page | `Footer.tsx:1,94`; `HEAD` Footer had no `"use client"` | Yes (server component) |
| R5 | Minor (decision) | UI slug lock now applies to **posts and categories** too (shared `slug` field kind), while the server lock covers only services and cases. Post and category slugs can no longer be edited in the UI. | `ResourceForm.tsx:161-173` vs `actions.ts:103` | Yes (editable) |

Positive regression checks that passed:
- Official BrandMark in nav and footer (SVG mark in raw HTML).
- Design tokens: `globals.css` diff is additive only, and `tailwind.config.ts` is unchanged.
- Skip links: public (`MarketingShell.tsx:24`) and admin (`(panel)/layout.tsx:39`).
- Honest empty states (services: "No active services are listed yet…"; blog: "No posts yet…"; gated `/work` and `/reviews` 404).
- `prefers-reduced-motion` handled in the hero, sculpture, capabilities CSS, ProcessLine, Quote and IndustriesSection, and now spinners.
- Analytics skipped on `/admin` (`SiteAnalytics.tsx:10,20`).
- External links keep `rel="noopener noreferrer"` (`Footer.tsx:45`, `ReviewsSection.tsx:76`).
- Admin auth: proxy matcher `/admin/:path*` unchanged (`proxy.ts`); the `(panel)/layout.tsx:15-22` guard redirects; **every** server action and export route re-derives the role (resource CRUD, submissions, users, settings, newsletter, review invites, both CSV exports). `/admin` → 307 unauthenticated.
- Public 404 (`/nope`) renders with chrome and noindex.
- `/feedback` and `/admin/login` are noindex.
- No service-role or PII strings in client bundles or page HTML.
- `X-Frame-Options: DENY` / `frame-ancestors 'none'`: no iframes or embeds of our own pages exist (grep). Turnstile frames Cloudflare, not us. Nothing breaks.

---

## 4. New risks found (not covered by the audit)

| # | Severity | Risk | Evidence / reasoning |
|---|---|---|---|
| N1 | **Major** | **Nav gating and sitemap are frozen at build time.** `/about`, `/contact`, `/quote`, `/privacy`, `/terms`, `/_not-found` and `/sitemap.xml` are fully static (build route table, no revalidate). `MarketingShell` decides `showBlog`/`showWork` inside them. Admin actions never call `revalidatePath("/", "layout")` or revalidate the sitemap. After the first post or case study, Blog/Work links appear on `/` (ISR) but not on those pages, and the sitemap won't list new posts or services **until the next deploy**, while `llms.txt` (dynamic) will. | `npm run build` output; `actions.ts:56-65` |
| N2 | **Major (pre-existing, privacy)** | `reviews.submitter_email` is readable by the anon key for published rows. RLS is row-level only and there's no column restriction (`0009_reviews.sql:39`), and `getPublishedReviews` selects it (`lib/data.ts:194`). It is not rendered or serialized (0 hits in page HTML), but anyone with the public anon key can query it through PostgREST. Not introduced by the batches. | `0009_reviews.sql`, `data.ts:194` |
| N3 | Minor | CSP collector: (a) `recordCspReports` is select-then-insert/update, so concurrent identical reports hit a unique-constraint error (logged, hit lost) and `hit_count` increments are lost updates. Use an `upsert` or an RPC doing `on conflict … do update set hit_count = hit_count + 1`. (b) `pruneCspReports` runs on **every** request: 2–4 extra DB round trips per report, and concurrent prunes can over-delete slightly. Throttle it (e.g. 1 in N, or a cron). (c) `blocked_uri` is stored with its query string (seen in the server log), which could capture tokens. Strip queries. (d) The rate limit is per instance and in memory. | `lib/csp-reports.ts:206-304`, `route.ts:64-69` |
| N4 | Minor | Migrations **0011 and 0012 are not idempotent**: bare `create policy` with no `drop policy if exists`, so a re-run fails. 0003 and 0006 use the drop-then-create pattern. Tables, columns, indexes and constraints are idempotent. | `0011:26`, `0012:57-76` |
| N5 | Minor | Sitemap `lastmod` = build time for every non-post/service URL, and changes on every deploy. Search engines learn to ignore it. Use fixed dates or omit it. | curl `/sitemap.xml` |
| N6 | Minor | SEO gate is weaker than it looks. The root layout always injects a default `<title>`, a default description and `SiteJsonLd`, so the title, description and JSON-LD checks pass even for a page that sets none of its own. Only canonical and h1 actually discriminate. Also no check that the canonical matches the URL or that the page isn't noindex. | `check-indexable-pages.mjs:113-141`; e.g. `/feedback` shows the site-default description |
| N7 | Minor | Gated 404s (`/work`, `/services/<x>`) ship **only the root `loading.tsx` spinner** in raw HTML (`<!--$!-->` client-render bailout: no nav, footer, main or h1). In Chromium with JS it recovers and renders the 404 with chrome. Crawlers and no-JS users see a spinner (status is correctly 404). | curl vs Playwright on `/work` |
| N8 | Minor | Admin route errors and 404s show public chrome (F03 row). | — |
| N9 | Minor | Slug lock is app-layer only. A BEFORE UPDATE trigger would make it real. Canonical slugs (`ai-chatbots`, `ai-agents`, `automation`, `web-development`) are a decision only: they aren't seeded or validated, so a typo at first save becomes permanent. Slug collisions are caught by the unique index, but the raw DB message is surfaced (`Save failed: duplicate key…`). | `actions.ts:80-81,118-122` |
| N10 | Minor | `npm run build` now spawns `next start` on port 3457 and crawls every sitemap URL **inside the Vercel build**. That adds build time, and a Supabase hiccup or any page regression fails the deploy. That's intended, but it hasn't been exercised on Vercel yet. `SEO_CHECK_PORT` isn't in `.env.example`. | `package.json` build script |
| N11 | Minor | Hydration: `BlogIndex.tsx:111,212` `toLocaleDateString()` in a client component (server vs browser locale). Pre-existing pattern, carried over. | — |
| N12 | Minor | Documented pipeline order is "honeypot → Turnstile → rate limit → validate", but every action validates **first** and then calls `guard()` (`actions.ts:155-159` etc.). Unchanged from `HEAD`, so not a regression. Validation is pure (no DB), but bots get field feedback before Turnstile. | — |
| N13 | Info | iOS Safari `inert` is supported from 15.5. On older iOS the menu still traps Tab but background content stays reachable by VoiceOver swipe. | — |
| N14 | Info | `services/[slug]` featured images: no service images today. The blog featured cover uses `fill` with a min-height (claimed); not visually verified (no posts). | — |

---

## 5. Needs manual verification

| Check | How |
|---|---|
| Populated states for `/work`, `/reviews`, `/services/<slug>`, `/blog` + nav/footer links + sitemap/llms inclusion | Publish 1 case study, 3 permitted reviews, 1 service with ≥4 deliverables and 1 post in a **staging** Supabase, then `npm run build && npm run start`, then `curl -s localhost:3000/sitemap.xml`, `curl -s localhost:3000/llms.txt`, and check nav on `/about` (expect N1 to reproduce). |
| ConfirmDialog behavior (R3) | Sign in to `/admin` → Posts → Delete → Tab / Shift+Tab / Esc, then confirm with a forced failure (e.g. editor role) and confirm the error is hidden behind the overlay. Needs an admin login; not possible here. |
| CSP reports actually arrive | Deploy a preview, open DevTools → Application → Reporting API, wait 1–2 minutes, then `/admin/csp-reports`. Expect `connect-src https://cloudflareinsights.com` entries. |
| Vercel build with the SEO gate | Push a branch and watch the Vercel build log for `check-indexable-pages OK`. |
| Production headers and content | `curl -sI https://www.aorysoft.com/`, `curl -s https://www.aorysoft.com/robots.txt`, `curl -s https://www.aorysoft.com/llms.txt` after deploy. Local URLs read `localhost:3000` because `.env.local` overrides `.env.production` in local builds. |
| Lighthouse / axe / contrast | `npx lighthouse https://<preview>/ --preset=desktop` (and mobile); axe DevTools on `/`, `/contact`, `/quote`, `/admin/login`. |
| OG image and rich results | opengraph.xyz, LinkedIn Post Inspector, Google Rich Results Test on `/`, `/about`. |
| iOS Safari menu (`inert`) | Real device or BrowserStack, iOS 15.4 and 17+. |
| Turnstile on Preview | Confirm `TURNSTILE_SECRET_KEY` is set for the Vercel **Preview** environment (F33 note). |
| Analytics cookies (F34) | Batch 9: DevTools → Application → Cookies on production. |

---

## 6. Proposed fix list (ordered by severity)

Effort: XS < 30 min · S < 2 h · M ≈ half day

| # | Severity | Fix | Effort |
|---|---|---|---|
| 1 | Major | **F16:** remove the wildcard `*.supabase.co` from `remotePatterns`; exact host only | XS |
| 2 | Major | **R1/F36:** home `title: { absolute: … }` | XS |
| 3 | Major | **N1:** `revalidatePath("/", "layout")` in `revalidateFor` (and in reviews/cases/posts publish paths); make the sitemap ISR (`export const revalidate = 3600`) or revalidate `/sitemap.xml` on publish. Add tests. | S |
| 4 | Major | **R3/F14:** ConfirmDialog: capture the previously focused element once on open, keep `onCancel` stable via a ref, and show the action error inside the dialog. Add an RTL test (Esc, Tab wrap, focus return, error visible). | S |
| 5 | Major (pre-existing) | **N2:** stop selecting `submitter_email` in `getPublishedReviews`, and add column-level `revoke select (submitter_email) on reviews from anon` (or a public view). Needs an RLS test (`npm run test:rls`). | S |
| 6 | Minor | **F03/N8:** add `app/admin/not-found.tsx` and `app/admin/error.tsx` without public chrome | XS |
| 7 | Minor | **F01:** add `https://cloudflareinsights.com` to `connect-src`; remove `upgrade-insecure-requests` from the RO header | XS |
| 8 | Minor | **N4:** add `drop policy if exists` before each `create policy` in 0011/0012 | XS |
| 9 | Minor | **N3:** upsert-based dedupe (RPC), throttled prune, strip query from `blocked_uri`, stream-limit the body | S |
| 10 | Minor | **R2/F30:** fix the fade-up/hover conflict (opacity-only keyframes or `translate` property) | XS |
| 11 | Minor | **R5:** decide whether post and category slugs lock too. If yes, add the server lock; if no, restrict the UI lock to services and cases. | XS |
| 12 | Minor | **N6:** strengthen the SEO gate: per-page title ≠ site default, canonical path = URL path, no `noindex` on sitemap URLs | S |
| 13 | Minor | **R4:** keep `Footer` server-rendered for marketing; give the client error boundary a lightweight client footer, or pass the year as a prop | XS |
| 14 | Minor | **N5:** drop or fix `lastmod` for static pages | XS |
| 15 | Minor | **F38:** add a honeypot/`submitReview` test | XS |
| 16 | Minor | `services.md` jargon line; generate `/about.md` from shared constants with `/about`; brand drift (Footer tagline, OG image mark) | S |
| 17 | Minor | **N9:** DB trigger for slug lock (optional) + friendlier duplicate-slug error | S |
| 18 | Minor | **N7:** investigate the spinner-only raw HTML on gated 404s (likely root `loading.tsx` + `notFound()` under ISR) | S |
| 19 | Trivial | Strip BOMs (`resources.ts`, `resource-input.ts`); document `SEO_CHECK_PORT`; set `turbopack.root`; X button inside the menu trap | XS |
| 0 | Process | **Before any fix:** commit the current working tree (or tag it) so Batches 1–7 can't be lost | XS |

---

## 7. Side effects of this verification run

- `node_modules` was partially wiped by the failed `npm ci` and then restored with `npm install`. The lockfile is unchanged. A restart of your `npm run dev` may be needed.
- A local `next start` on port 3470 was used and then stopped.
- **One test POST to `/api/csp-report` likely wrote one row** to `csp_reports` in the Supabase project configured in `.env.local` (no persist error was logged). Values: `directive=script-src`, `blocked_uri=https://verify.test/x?y=1`, `document_path=/verify`. Cleanup when convenient: `delete from public.csp_reports where document_path = '/verify' and blocked_uri like 'https://verify.test/%';`
- **The gitignored `.playwright-mcp/` folder at the repo root was deleted**, including pre-existing artifacts from Nov 8 sessions (QA screenshots such as `final-*.jpg`, `v1`–`v8` captures, `logo-preview.html`, `logo-trace-preview.png`, logs and snapshots). They can't be restored from git. The official brand assets in `brand/` were not affected.
