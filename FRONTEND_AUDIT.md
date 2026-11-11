# AorySoft Frontend Audit — Status

**Last updated:** 2026-11-11 (after Batch 8, the Batch 8 follow-ups, and Batch 9)
**Scope:** Entire `web/` frontend (public marketing + `/admin`)
**Branch:** `batch-8-ai-native` (from `fix/disable-admin-analytics`; not merged or deployed). Restore point: tag `pre-claude-code-verify` (= commit `25ece99`, Batches 1–7 as implemented in Cursor, before verification fixes).
**Verification:** Independent review in `VERIFICATION_REPORT.md`; every status below is re-verified from code, build output, tests, and (where noted) Chromium.

| Gate (run in `web/`) | Result |
|---|---|
| `npm run lint` | 0 errors, 2 warnings (pre-existing, `scripts/apply-reviews-and-social.mjs`, `scripts/check-db.mjs`) |
| `npm run typecheck` | clean |
| `npm run test` | **42 files, 259 tests passed** |
| `npm run build` | OK, no warnings (plain `next build`) |
| `npm run check:seo` | OK — 19 sitemap URLs with the temporary test content live (run separately before deploy) |
| Lighthouse / PSI | **not run** (owner runs PageSpeed on production); token contrast computed (all ≥ 4.5:1); layout audit 224 route×size checks — see `web/plans/2026-11-11-batch-8-verification.md` |

---

## 1. Findings — verified status

Status: **Fixed** · **Partial** · **Pending** · **Skipped** (with reason)

| ID | Area | Sev. | Status | Verified evidence / notes |
|----|------|------|--------|---------------------------|
| F01 | Security headers / CSP | Critical | **Partial** | nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, `Reporting-Endpoints: csp="/api/csp-report"`, CSP **Report-Only** with `object-src`/`base-uri`/`form-action`/`frame-ancestors`/`report-uri`/`report-to` (curl). Phase B: `connect-src` now allows `https://cloudflareinsights.com` (RUM beacon seen in Chromium); `upgrade-insecure-requests` removed (ignored in Report-Only). **Partial only because enforcement is deliberately deferred** until reports are reviewed. |
| F02 | Placeholder services | Critical | **Fixed** | `toCapabilities` returns `[]` when CMS empty; placeholders test-only. |
| F03 | Public chrome on admin | Major | **Fixed** | Marketing chrome only in `(marketing)/layout`. Phase B: `app/admin/not-found.tsx` + `app/admin/error.tsx` (no public chrome) and `(panel)/[...missing]` so admin 404s/errors no longer fall back to public Navbar/Footer. |
| F04 | Blog article tokens | Major | **Fixed** | No off-token classes in `blog/[slug]`. |
| F05 | Admin login styling | Major | **Fixed** | `bg-canvas` + `surface-panel`. |
| F06 | llms.txt | Major | **Fixed** | `/llms.txt`, `/llms-full.txt` → `text/plain; charset=utf-8`, live indexable pages only. |
| F07 | Organization/WebSite JSON-LD | Major | **Fixed** | Sitewide graph from `lib/site.ts`. Footer brand line now uses `SITE_DESCRIPTION` (was divergent copy). |
| F08 | OG image | Major | **Fixed (Batch 8)** | `/opengraph-image` 1200×630 renders the official mark (markGeometry gradient) and the Instrument Serif wordmark (OFL TTF in `src/app/fonts`); alt text includes the tagline. |
| F09 | Mobile menu a11y | Major | **Fixed** | Verified in Chromium: focus trap, Escape, focus restore, `inert` on main/footer. Phase B: close (X) button is now inside the trap; stray focus is pulled back. RTL test. |
| F10 | Form error wiring | Major | **Fixed** | `aria-invalid` + `aria-describedby` on contact, quote, newsletter, review forms. |
| F11 | Settings labels | Major | **Fixed** | `htmlFor` required in `SettingsFields`. |
| F12 | Submission filters | Major | **Fixed** | Type/status links preserve each other. |
| F13 | Mobile sign out | Major | **Fixed** | Sign out in desktop + mobile `AdminNav`. |
| F14 | Confirm dialog | Major | **Fixed** | No `window.confirm` left. Phase B: `ConfirmDialog` captures focus once (no re-render focus theft), keeps focus while pending, shows action errors **inside** the dialog, returns focus to the trigger (cancel) or `<main>` (successful delete). RTL test (fails 3/6 against the old version). |
| F15 | Hero brand | Major | **Fixed (Batch 8)** | Hero wordmark is a lockup under the mark; the official mark is carried into PageHero (every inner page), the OG image, newsletter pages and 404s. The hero is sized to the visible viewport (see DESIGN.md Viewport Fit Rule). |
| F16 | Image host allowlist | Major | **Fixed** | Was **wrong** in Batch 7 (wildcard `*.supabase.co` remained). Now only the exact `NEXT_PUBLIC_SUPABASE_URL` host + `/storage/v1/object/public/**`; `next build` fails with a clear message if the env var is missing. Tested. |
| F17 | Contact/Blog RSC shells | Major | **Fixed** | h1 + main copy in raw HTML; copy identical to before. |
| F18 | AI crawler robots groups | Major | **Fixed** | `*` + 9 AI UAs, each repeats the full Disallow list (curl). |
| F19 | Admin chips/tokens | Major | **Fixed** | No `rounded-full` / gray-blue-cyan classes in touched files. |
| F20 | Form options loading | Major | **Fixed** | Any `mediaRef`/`categoryRef` field loads options. |
| F21 | Role/status feedback | Major | **Fixed** | `role="status"` / `role="alert"`. |
| F22 | Manifest / theme | Minor | **Fixed** | `theme-color`, `color-scheme: dark`, manifest. |
| F23 | Spinner reduced motion | Minor | **Fixed** | Verified in Chromium (`animation-name: none`). |
| F24 | Blog filter group | Minor | **Fixed** | `role="group"` + label. |
| F25 | Cover alt text | Minor | **Fixed** | Media alt, title fallback. |
| F26 | Newsletter hover | Minor | **Fixed** | `hover:shadow-signal`. |
| F27 | Blockquote rule | Minor | **Fixed** | `border-l border-line`. |
| F28 | Footer "Case studies" | Minor | **Fixed** | → `/work`, gated. |
| F29 | Nav IA | Minor | **Fixed** | About/Services always; Blog/Work gated. Gates now refresh on publish (see N1 below). |
| F30 | Framer → CSS on blog | Minor | **Fixed** | Phase B: keyframes animate `translate` (not `transform`) so the card hover lift works again (verified against built CSS in Chromium); `useRevealOnView` restores animate-when-seen for below-the-fold items. Batch 8: Framer also removed from the capabilities tab indicator and ProcessLine (CSS only); kept only in the quote wizard. |
| F31 | File size / splits | Minor | **Partial** | `resources.ts` 17 (was 420) → `resource-catalog` 367, `resource-input` 129, `resource-types` 109; `SettingsForm` 265 + `SettingsFields` 106. **QuoteForm not split** (162 lines, under limits). `ResourceForm.tsx` is 330 lines (over the 300 warn, under 450 hard). **Final: Partial, accepted** — no file is over the hard limit; split only if it grows. |
| F32 | Admin skip link | Minor | **Fixed** | → `#admin-main`. |
| F33 | Turnstile fail-closed | Minor | **Fixed** | Fails closed when `NODE_ENV=production` and secret missing — note this includes Vercel **Preview** and local `next start`. |
| F34 | Cookie policy | Minor | **Fixed (Batch 9)** | Verified on production (headless Chrome: cookie jar, Set-Cookie headers, local/session storage, IndexedDB) and in the shipped scripts. Public pages set no first-party cookies or storage. Cloudflare Web Analytics (beacon + `/cdn-cgi/rum`) and Vercel Analytics (first-party proxied script) set none. Vercel script writes `__va_attribution` only when users are identified (not used). Turnstile runs in a Cloudflare frame. A `__cf_bm` bot cookie can come from the image CDN domain (blocked as third-party in the test). Staff sign-in uses the Supabase auth cookie (~400-day default). Privacy page now has an accurate "Cookies and browser storage" section with a table + test. **Not verified:** storage inside the Turnstile iframe (cross-origin frame), Safari/Firefox behavior. |
| F35 | Token pages | Minor | **Fixed** | Atelier tokens. |
| F36 | Home metadata | Minor | **Fixed** | Richer description/keywords/canonical. Phase B: title no longer repeats the brand (`title.absolute`, single `SITE_DEFAULT_TITLE`). |
| F37 | Admin table shell | Minor | **Fixed** | Shared `AdminTableShell`. |
| F38 | Honeypot | Minor | **Fixed** | Hidden + `aria-hidden` + `tabIndex=-1`; server rejects. Tests for contact, quote, newsletter, and (Phase B) feedback/review form. |

---

## 2. Verification follow-ups (from `VERIFICATION_REPORT.md`)

| ID | Item | Status |
|----|------|--------|
| R1 | Home title doubled brand | **Fixed** |
| R2 | Blog hover lift broken by fade-up | **Fixed** |
| R3 | ConfirmDialog focus/error | **Fixed** |
| R4 | Footer became client component | **Fixed** (server component again) |
| R5 | UI slug lock on posts/categories | **Fixed** (services/cases only) |
| N1 | Nav gates + sitemap frozen at build | **Fixed** — publish/unpublish of posts, services, cases, reviews revalidates the public layout + `/sitemap.xml` (+ `/reviews`); sitemap is ISR (3600 s). Tested. |
| N2 | `reviews.submitter_email` readable by anon | **Fixed** — code + migration 0013 applied 2026-11-11 (anon: 15 safe columns, `submitter_email` denied, verified through the public API). Production runs older code until this branch deploys, so published reviews stay hidden there until then. |
| N3 | CSP collector races / prune / PII / size cap | **Fixed** — atomic RPC upsert (0014) with fallback, prune throttled to 10 min, query strings stripped, streamed byte cap |
| N4 | 0011/0012 not idempotent | **Fixed** |
| N5 | Fake sitemap `lastmod` | **Fixed** — only real `updated_at` |
| N6 | Weak SEO gate | **Fixed** — default title/description, canonical path, noindex checks |
| N7 | Gated 404 raw HTML = loading spinner | **Partly fixed (Batch 8)** — `app/loading.tsx` moved to `app/admin/(panel)/loading.tsx`; no public page ships the spinner and unknown URLs ship the full 404 HTML. A `notFound()` thrown inside a dynamic route (e.g. `/services/unknown`) still streams the 404 body only in the RSC payload (no `<h1>` until JS); status is 404, so it is not indexed. **Trade-off found later:** removing the root Suspense boundary is what slows home LCP on slow CPUs (+0.6–1.0 s at 4× CPU; network-only +4 ms, desktop +56 ms). **Resolved with option A:** an invisible `app/(marketing)/loading.tsx` (returns null). Slow-CPU home LCP is now 2708 ms vs 2672 ms before Batch 8 (+36 ms, same data). No spinner, and h1 plus main content stay in the raw HTML. Accepted trade-off: no-JS visitors see a blank page. |
| N8 | Admin errors show public chrome | **Fixed** (see F03) |
| N9 | Slug lock rule / DB enforcement / duplicate message | **Fixed** — locked once published (migration 0016 trigger + server check), friendly duplicate/lock messages |
| N10 | SEO gate inside Vercel build | **Fixed** — `npm run check:seo` separate; env errors exit 2, content failures exit 1 |
| N11 | `toLocaleDateString` in client BlogIndex | **Partly fixed (Batch 8)** — blog post and service pages use one fixed server format; the client BlogIndex list is unchanged. |
| N12 | Docs say validate-last, code validates first | **Pending** (not in any approved list; pre-existing, docs-only) |
| — | 0012 revoked authenticated writes on `case_studies` | **Found + fixed in Phase B** — migration 0015 (admin case-study CRUD would otherwise fail) |

---

## 3. Changes beyond the original audit

| Area | What shipped |
|------|--------------|
| CSP reporting | `POST /api/csp-report` (rate limit, streamed 16 KB byte cap, query stripping), `csp_reports` table (0011), atomic `record_csp_report` + `prune_csp_reports` RPCs (0014), owner-only `/admin/csp-reports` |
| IA pages | `/about`, `/services`, `/services/[slug]`, gated `/work` and `/reviews` |
| CMS schema | 0012 service detail fields + `case_studies`; 0015 authenticated write grants; 0016 slug lock trigger |
| Publish gates | Service detail = active + slug + overview + ≥4 deliverables; `/work` ≥1 case; `/reviews` ≥3 reviews; `/blog` noindex until first post |
| Revalidation | `lib/admin/revalidation.ts` — layout + sitemap + affected pages on every admin mutation |
| Markdown twins | `/about.md` (generated from shared `lib/about-content.ts`), `/services.md` (404 until a detail page is published); both `X-Robots-Tag: noindex` + canonical `Link` |
| LLMO | `/llms.txt`, `/llms-full.txt` from live indexable pages |
| SEO gate | `scripts/check-indexable-pages.mjs` + `scripts/seo-check-lib.mjs` (unit-tested), `npm run check:seo` |
| Privacy | Public review queries exclude `submitter_email`; test asserts no PII columns in public queries; 0013 column grants |
| Admin UX | `ConfirmDialog`, admin 404/error pages, slug lock explanation, friendly slug errors |
| Image security | `lib/image-remote-patterns.ts` exact-host allowlist |

---

## 4. Decisions made

| Decision | Choice |
|----------|--------|
| AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot) | **All allowed**, same Allow/Disallow as `*` |
| Canonical service slugs | `ai-chatbots`, `ai-agents`, `automation`, `web-development` |
| Slug edits (services, case studies) | **Locked once the page has been published** (meets its publish threshold), and stay locked if later unpublished. Free to change before that. Posts and categories stay editable. |
| `/work` gate | ≥1 published case study, else 404 and omitted from nav/sitemap/llms |
| `/reviews` gate | ≥3 published reviews with permission, else 404 and omitted from sitemap/llms |
| `/blog` | `noindex` until ≥1 published post; nav/footer link gated the same way |
| CSP | **Stays Report-Only** until production reports are reviewed (7–14 days), then decide on enforcing |
| Live AI features | **None in this phase** (marketing site + CMS + forms only) |
| Placeholder content | Never on public UI; tests only |
| SEO gate | Not part of the Vercel build; owner runs `npm run check:seo` before deploy |
| OG image brand mark | Official mark (Batch 8) |
| Inner-page heroes | Left-aligned `PageHero` on every page (Batch 8, Q5) |
| Home reviews / careers band | Reviews hidden at 0; careers band removed (Q1, Q2) |
| Public `loading.tsx` | Moved to admin (Q7); see N7 for the LCP trade-off |
| Cookie consent banner | Not needed: the public site sets no cookies (Batch 9) |

---

## 5. Migrations (all applied 2026-11-11)

All are idempotent. 0011, 0012, 0014, 0015, 0016 and then 0013 were applied to the `.env.local` project via `scripts/apply-sql.mjs` with the owner’s permission and verified with read-only queries.

| # | File | Purpose |
|---|------|---------|
| 1 | `0011_csp_reports.sql` | `csp_reports` table, RLS, owner-only select (skip if already applied — safe either way) |
| 2 | `0012_services_detail_and_case_studies.sql` | Service detail columns + `case_studies` table/RLS (skip if already applied — safe either way) |
| 3 | `0013_reviews_hide_submitter_email.sql` | Anon can read every `reviews` column except `submitter_email` |
| 4 | `0014_csp_reports_functions.sql` | Atomic `record_csp_report` + `prune_csp_reports` (service role only) |
| 5 | `0015_case_studies_authenticated_writes.sql` | Restores insert/update/delete grants on `case_studies` for signed-in admins (RLS still decides) |
| 6 | `0016_slug_lock_on_publish.sql` | `slug_locked_at` columns, lock triggers, backfill for already-public rows |

---

## 6. Remaining work

- **Batch 8:** done on branch `batch-8-ai-native` — see `web/plans/2026-11-11-batch-8-ai-native-site.md`, `web/plans/2026-11-11-batch-8-baseline.md`, and DESIGN.md (patterns, Viewport Fit Rule, Example Label Rule). Also fixed: capability tab panels all rendering at once (Tailwind `grid` overrode `[hidden]`); an example scene that implied real channel data.
- **Test content:** temporary rows from `web/scripts/seed-test-content.mjs` are live until `--remove` is run.
- **Batch 9 (F34):** done (see F34).
- **Home LCP on slow CPUs:** decide on N7 option A (see N7).
- **Deploy:** merge `batch-8-ai-native` and deploy, then re-check home reviews (0013 is live) and run PageSpeed.
- **N7 (remainder):** dynamic-route `notFound()` 404 body is RSC-only.
- **CSP:** review `/admin/csp-reports` for 7–14 days after deploy; then decide on enforcing (re-add `upgrade-insecure-requests` when enforcing).
- **N11 (remainder) / N12:** BlogIndex client dates; align docs with the actual form pipeline order.
- **F31:** optional split of `ResourceForm.tsx` (330 lines) if it grows.
- **Content:** fill the four service detail pages; publish first case study, ≥3 permitted reviews, first post when ready.
- **Playwright E2E:** still not installed.

---

## 7. Manual verification still needed

| Check | How |
|-------|-----|
| RLS matrix incl. new anon review checks | `npm run test:rls` — **only against a non-production project** (it creates and deletes users/rows) |
| Admin flows: confirm dialog (Tab/Esc/error/focus), slug lock message, case-study CRUD after 0015, admin 404 page | Sign in to `/admin` on a preview deploy |
| Populated states: `/work`, `/reviews`, `/services/<slug>`, `/blog`, nav links appearing on `/about` after publish, sitemap update | Staging data, then `npm run build && npm run check:seo` and curl |
| CSP reports arrive | Preview deploy → DevTools Reporting → `/admin/csp-reports` |
| Production headers/robots/llms | `curl -sI https://www.aorysoft.com/`, `curl -s …/robots.txt`, `…/llms.txt` after deploy |
| Lighthouse / axe; OG preview; Rich Results | Not run (owner runs PageSpeed after deploy) |
| iOS Safari menu (`inert`, iOS ≥15.5) | Real device |
| Turnstile secret on Vercel Preview | Vercel env settings (F33 note) |
| Turnstile iframe storage; Safari/Firefox cookie behavior | Real browsers (DevTools → Application) |

---

## Positive findings (keep)

Official BrandMark in nav/footer; design tokens unchanged in meaning (globals.css changes are additive); skip links + `:focus-visible` rings (public + admin); honest empty states and gated routes; honeypot → Turnstile → rate limit around every public write; `SafeHtml` for admin-authored HTML (service/case long-form fields are plain text, React-escaped); per-page metadata + canonicals, feedback/admin noindex; `prefers-reduced-motion` respected (hero, sculpture, capabilities, ProcessLine, quote, spinners, fade-ups); analytics skipped on `/admin`; external links `rel="noopener noreferrer"`; every admin server action re-checks the role; no service-role or PII strings in client bundles.
