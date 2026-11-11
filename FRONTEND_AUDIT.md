# AorySoft Frontend Audit — Status

**Last updated:** 2026-11-11  
**Scope:** Entire `web/` frontend (public marketing + `/admin`)  
**Phase:** Phase 3 Batches 1–7 implemented locally (uncommitted on `fix/disable-admin-analytics`); Batches 8–9 not started  
**Tests:** `npm run test` — **22** files, **166** passed (2026-11-11)  
**Build:** `npm run build` (incl. `check-indexable-pages`) — **OK** (2026-11-11)  
**Lighthouse / axe / contrast / PSI:** **not run** this phase (see Manual verification)

Original Phase 1 analysis dated 2026-11-11. This document is the living status of that audit after Batches 1–7.

---

## 1. Project summary

| Item | Detail |
|------|--------|
| **Stack** | Next.js 16 App Router, React 19, TypeScript, Tailwind 3, Framer Motion, lucide-react, Supabase (Auth/Postgres/Storage), Resend, Cloudflare Turnstile, Vercel + Cloudflare Analytics |
| **Rendering** | Server Components by default; client islands for nav, hero sculpture, capabilities tabs, forms, blog filter/newsletter, analytics. Marketing chrome via `MarketingShell` (not under `/admin`) |
| **Styling** | Tailwind + CSS modules + `globals.css` Signal Atelier tokens (`DESIGN.md`) |
| **App root** | All work under `web/` |

### Public routes (current)

| Route | Notes |
|-------|--------|
| `/` | Marketing home |
| `/about`, `/about.md` | About HTML + markdown twin (`noindex` + canonical Link) |
| `/services`, `/services/[slug]`, `/services.md` | Catalog + detail (publish gate); md twin 404 if none published |
| `/work` | Case studies — **404** until ≥1 published case study |
| `/reviews` | Reviews index — **404** until ≥3 published reviews |
| `/blog`, `/blog/[slug]` | Blog; index `noindex` until ≥1 post; nav/footer gated |
| `/careers`, `/contact`, `/quote` | Careers, contact, quote wizard |
| `/privacy`, `/terms` | Legal |
| `/feedback` | Invite-only review form (`noindex`) |
| `/newsletter/confirm`, `/newsletter/unsubscribe` | Token HTML |
| `/llms.txt`, `/llms-full.txt` | `text/plain; charset=utf-8` |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image` | SEO / PWA / OG |
| `not-found`, `error`, `loading` | Global UI states |

### Admin

`/admin/login`, `/admin` dashboard, resource CRUD (`posts`, `categories`, `services`, `jobs`, `reviews`, `cases`), media, submissions, newsletter, settings, users, **CSP reports**.

---

## 2. Scorecard (current)

Scores reflect **code/repo state**, not a new Lighthouse/axe pass. Runtime scores: **not run**.

| # | Category | Score | What changed | What remains |
|---|----------|-------|--------------|--------------|
| 1 | Visual Design Quality | **Needs Work** | Blog article + admin login restyled to atelier; admin pills/tokens cleaned; token pages branded | Hero brand signal still weak after removing nav (**F15** pending) |
| 2 | UX and Usability | **Needs Work** | Submissions dual filters, mobile Sign out, confirm dialog, role/status feedback, reviews media options | Conversion still thin until real reviews/cases/posts; device UX matrix **not run** |
| 3 | Layout and Responsiveness | **Needs Work** | Fluid shells retained; marketing/admin layout split | Full breakpoint / safe-area matrix **not run** |
| 4 | Components | **Pass** | Shared `ConfirmDialog`, `AdminTableShell`, `HoneypotField`; contact/blog islands | No Playwright component E2E |
| 5 | UI States | **Pass** | Loading / 404 / error / honest empties retained; gated routes 404 when empty | — |
| 6 | Interaction and Animation | **Pass** | Mobile menu focus trap + inert + restore; spinner reduced-motion in CSS; blog Framer → CSS | Framer kept for capabilities indicator, ProcessLine scroll, quote steps (intentional) |
| 7 | Accessibility (WCAG 2.2 AA) | **Needs Work** | Menu trap, form `aria-invalid`/`describedby`, Settings `htmlFor`, admin skip link, category filter group | axe / WAVE / keyboard audit on production **not run** |
| 8 | Dark Mode / Theming | **Pass** | Admin login on `bg-canvas` / `surface-panel`; dark-only brand intentional | — |
| 9 | Performance (UI) | **Needs Work** | `next/image` + Supabase `remotePatterns`; Contact/Blog RSC shells; blog motion trimmed | Lighthouse / CrUX **not run**; Quote/Services still ship Framer |
| 10 | Content and Copy | **Pass** | Silent placeholder capabilities removed; honest empty catalog | Real CMS service/case/review content still to fill |
| 11 | Navigation and Flow | **Pass** | About/Services in chrome; Work/Blog gated; footer “Case studies” → `/work` | Reviews page gated but not in primary nav (home `#reviews` + direct URL) |
| 12 | Traditional SEO | **Pass** | Sitewide JSON-LD, OG image route, manifest, `theme-color`/`color-scheme`, richer home meta, indexable-pages build check | OG preview / Rich Results Test / Search Console submit **not run** |
| 13 | LLMO / AIO / GEO | **Pass** | `llms.txt` + `llms-full.txt`; Organization/WebSite JSON-LD; per-agent robots groups (allow + shared Disallow) | Live curl against production after deploy still needed |
| 14 | Security and Privacy (FE) | **Needs Work** | Security headers + CSP **Report-Only** + report endpoint/admin; Turnstile fail-closed in production | Enforce CSP only after 7–14 days of report review; Cookie Policy (**F34**) pending |
| 15 | Design System and Reusability | **Needs Work** | Admin gray/pill leftovers largely cleared; tokens consistent on blog/login | **F15** hero brand; Impeccable detector not re-run |
| 16 | Code-Level Quality | **Needs Work** | `resources` + SettingsForm split; Vitest 166 green | QuoteForm not split (162 lines); no Playwright E2E |
| 17 | Cross-Browser / Tooling | **Needs Work** | — | Manual browser/device matrix **not run** |

### Impeccable audit health (Phase 1 baseline — not re-scored)

| Dimension | Phase 1 score (0–4) | Notes after Batches 1–7 |
|-----------|---------------------|-------------------------|
| Accessibility | 2 | Code fixes for F09–F11, F23–F25, F32, F38; axe **not run** |
| Performance | 2 | F16/F17/F30 addressed in code; Lighthouse **not run** |
| Theming | 3 | Blog slug + login aligned; F15 open |
| Responsive | 3 | Unchanged — matrix **not run** |
| Implementation Integrity | 2 | Placeholders removed; admin chrome split; IA pages added |
| **Total** | **12/20** | Historical Phase 1 total; do not treat as current measured score |

---

## 3. Findings table

Severity: **Critical** / **Major** / **Minor**  
Status: **Fixed** | **Partial** | **Pending** | **Skipped**

| ID | Category | Severity | Status | Batch | Notes |
|----|----------|----------|--------|-------|-------|
| F01 | Security | Critical | **Partial** | 1 | Headers in `next.config.ts` (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, Reporting-Endpoints). CSP is **Report-Only** (`Content-Security-Policy-Report-Only`) — enforcement deferred until reports reviewed. |
| F02 | Content / Trust | Critical | **Fixed** | 1 | `toCapabilities` returns `[]` when CMS empty; placeholders only via explicit test option (`testPlaceholders.ts`). Honest empty in `ServicesSection`. |
| F03 | Security / Admin UX | Major | **Fixed** | 2 | Root layout no longer mounts public nav/footer. Public chrome in `MarketingShell`; admin `(panel)/layout` standalone. |
| F04 | Design | Major | **Fixed** | 4 | `blog/[slug]` uses atelier tokens (`display-title`, `shell`, `border-line`, `signal`); no leftover `gray-*` / `rounded-full` / cyan kit. |
| F05 | Design | Major | **Fixed** | 2 | `admin/login` uses `bg-canvas` + `surface-panel`. |
| F06 | SEO / LLMO | Major | **Fixed** | 6 | Dynamic `app/llms.txt` + `llms-full.txt` (`text/plain; charset=utf-8`) via `lib/seo/llms.ts`. |
| F07 | SEO / LLMO | Major | **Fixed** | 6 | `SiteJsonLd` Organization + WebSite (+ `sameAs`) in root layout. |
| F08 | SEO | Major | **Fixed** | 6 | `app/opengraph-image.tsx` 1200×630; Twitter `summary_large_image`. |
| F09 | A11y | Major | **Fixed** | 3 | Navbar mobile: focus trap, Escape, focus restore to button, `inert` on main/footer. |
| F10 | A11y | Major | **Fixed** | 3 | Contact + quote ContactStep + newsletter wire `aria-invalid` / `aria-describedby`. |
| F11 | A11y | Major | **Fixed** | 3 | Settings `Labeled` requires `htmlFor`; controls have matching `id`s (`SettingsFields.tsx`). |
| F12 | UX | Major | **Fixed** | 2 | Submissions `filterLink` preserves sibling `type`/`status` query params. |
| F13 | UX | Major | **Fixed** | 2 | Mobile `AdminNav` includes Sign out. |
| F14 | UX / A11y | Major | **Fixed** | 3 | Shared `ConfirmDialog`; no `window.confirm` in `src/`. Used by ResourceTable, ConfirmDeleteButton, MediaManager. |
| F15 | Design / Brand | Major | **Pending** | 8 | Hero brand still primarily nav; sculpture wordmark not elevated. **Plan before coding.** |
| F16 | Performance | Major | **Fixed** | 7 | `images.remotePatterns` for Supabase storage; blog index + slug use `next/image` with `sizes`/`priority`. Featured cover has min-height for `fill`. |
| F17 | Performance | Major | **Fixed** | 7 | Contact RSC shell + `ContactForm` island; Blog RSC hero + `BlogIndex` + `NewsletterSignup` islands. |
| F18 | LLMO | Major | **Fixed** | 6 | Explicit AI UA groups in `robots-policy.ts` (allowed) with full Disallow parity; parse test. |
| F19 | Design system | Major | **Fixed** | 4 | Admin submissions/newsletter/etc. use `rounded-atelier` chips; no `rounded-full` under admin panel. |
| F20 | UX | Major | **Fixed** | 2 | Form options load when any field is `mediaRef`/`categoryRef` (not posts-only). |
| F21 | UX | Major | **Fixed** | 2 | `UserRoleForm` + `SubmissionStatusForm` surface `role="status"` / `role="alert"`. |
| F22 | SEO | Minor | **Fixed** | 6 | `manifest.ts`, viewport `themeColor` + `colorScheme: "dark"`. |
| F23 | A11y | Minor | **Fixed** | 3 | `globals.css` disables `.animate-spin` under `prefers-reduced-motion`. |
| F24 | A11y | Minor | **Fixed** | 3 | Blog category filters: `role="group"` + `aria-label="Filter by category"`. |
| F25 | A11y / SEO | Minor | **Fixed** | 3 | Cover queries include media `alt`; UI falls back to title. |
| F26 | Design | Minor | **Fixed** | 4 | Newsletter hover uses `hover:shadow-signal`. |
| F27 | Design | Minor | **Fixed** | 4 | Blockquote rule is `border-l` + `border-line` (not thick cyan side-tab). |
| F28 | UX / IA | Minor | **Fixed** | 5 | Footer label “Case studies” → `/work` (gated); no misleading `/#work` portfolio link. |
| F29 | UX | Minor | **Fixed** | 5 | Nav/footer: About, Services, gated Blog/Work. Technologies/Industries remain home sections by design. `/reviews` exists (3+ gate) but is not in primary chrome. |
| F30 | Performance | Minor | **Fixed** | 7 | Blog Framer removed; CSS `atelier-fade-up`. FM kept for capability tab indicator, ProcessLine, quote wizard. |
| F31 | Code quality | Minor | **Partial** | 7 | Split: `resource-types` (109), `resource-catalog` (367), `resource-input` (129), barrel `resources` (17); SettingsForm (265) + SettingsFields (106). **QuoteForm not split** (162 lines — under 450 hard / 300 warn). |
| F32 | A11y | Minor | **Fixed** | 2 | Admin panel skip link → `#admin-main`. |
| F33 | Security | Minor | **Fixed** | 1 | Turnstile fail-closed in production when secret unset (`turnstile.ts` + tests). |
| F34 | Privacy | Minor | **Pending** | 9 | No separate Cookie Policy; counsel/browser cookie verification still open. |
| F35 | Design | Minor | **Fixed** | 4 | `token-page.ts` uses atelier canvas/signal + DM Sans. |
| F36 | SEO | Minor | **Fixed** | 5 | Home metadata: richer description + service-oriented keywords + canonical. |
| F37 | Components | Minor | **Fixed** | 2 | `AdminTableShell` shared by submissions, newsletter, users, resources, csp-reports. |
| F38 | Interaction | Minor | **Fixed** | 3 | `HoneypotField`: `hidden` + `aria-hidden` + `tabIndex={-1}` + `autocomplete="off"`. |

### Original issue / suggested fix (reference)

Unchanged intent from Phase 1; see git history / code for implementations. File paths in the original audit often pointed at pre-`(marketing)` locations — current files live under `web/src/app/(marketing)/…` where applicable.

---

## 4. Changes beyond the original audit

Work added during Batches 1–7 that was not a one-line “fix the finding” item:

| Area | What shipped |
|------|----------------|
| **CSP reporting** | `POST /api/csp-report`, rate limit helpers/tests, `supabase/0011_csp_reports.sql`, admin `/admin/csp-reports` + retention/cleanup hooks |
| **IA pages** | `/about`, `/services`, `/services/[slug]`, gated `/work`, gated `/reviews` |
| **CMS schema** | `supabase/0012_services_detail_and_case_studies.sql` — service detail fields + `case_studies` table; admin resource `cases` |
| **Service publish gate** | Detail pages require active + slug + overview + ≥4 deliverables (`services-publish.ts` + tests) |
| **Slug lock** | After first non-empty slug save, UI `readOnly` + server forces existing slug (`actions.ts` / `ResourceForm`) |
| **Markdown twins** | `/about.md`, `/services.md` with `X-Robots-Tag: noindex` + canonical `Link`; services.md **404** when no published details |
| **LLMO files** | `/llms.txt`, `/llms-full.txt` driven by live indexable routes |
| **Indexable SEO helper** | `lib/seo/indexable.ts` + build script `scripts/check-indexable-pages.mjs` (wired into `npm run build`) |
| **Robots policy module** | `lib/seo/robots-policy.ts` + tests — shared Disallow list on `*` and every AI UA group |
| **Site constants** | `lib/site.ts` for name/description/URLs used by metadata, JSON-LD, llms, md twins |
| **Nav gates** | `MarketingShell` hides Blog/Work until content thresholds met |
| **Tests** | New/extended Vitest coverage (robots, CSP reports/rate-limit, services-publish, turnstile fail-closed, etc.) — suite now **166** tests |

---

## 5. Decisions made

| Decision | Choice |
|----------|--------|
| AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot) | **Allowed** (same Allow/Disallow as `*`) |
| Canonical service slugs | `ai-chatbots`, `ai-agents`, `automation`, `web-development` |
| Slug edits after first save | **Locked** (UI + server) |
| `/work` gate | ≥1 published case study (else 404; omit from nav/sitemap/llms) |
| `/reviews` gate | ≥3 published reviews (else 404; omit from sitemap/llms) |
| `/blog` indexing | `noindex` until ≥1 published post; nav/footer link gated the same way |
| CSP | Stay **Report-Only** until reports reviewed (**7–14 days** recommended); then consider enforcing |
| Live AI product features | **None** in this phase (site is marketing + CMS + forms only) |
| Placeholder capabilities | **Never** on public UI; tests only |
| Hero brand (F15) | Deferred to Batch 8 with a plan-first gate |
| Cookie Policy (F34) | Deferred to Batch 9 |

---

## 6. Remaining work

### Batch 8 (plan first)
- **F15** — Elevate hero brand signal without fake claims / without breaking Signal Atelier.

### Batch 9
- **F34** — Cookie Policy / counsel review; verify CF + Vercel analytics cookie behavior in a real browser.

### Follow-through on Partial items
- **F01** — After CSP report review window, decide enforce vs keep Report-Only; document breakage if any (Turnstile, Supabase, analytics).
- **F31** — Optional: split `QuoteForm` further if it grows past warn threshold.

### Product / content (not audit code)
- Fill real service detail content in admin for the four slugs.
- Publish first permitted reviews (≥3), first case study, first blog post when ready.
- Deploy Batches 1–7 and re-curl production `robots.txt` / `llms.txt` / headers.

### Later / out of scope this phase
- Playwright E2E.
- Enforcing CSP without report evidence.
- Inventing testimonials or case studies.

---

## 7. Manual verification still needed

| Check | Status |
|-------|--------|
| Lighthouse Perf / A11y / SEO / Best Practices (desktop + mobile) on `/`, `/contact`, `/quote`, `/blog`, `/services` | **not run** |
| Before/after Lighthouse comparison | **not run** (no baseline numbers recorded this phase) |
| axe / WAVE on production | **not run** |
| Contrast (`ink-muted` / `ink-subtle` on canvas/surface) | **not run** |
| CSP report review **7–14 days**, then enforce decision | **pending** (endpoint exists; production accumulation after deploy) |
| OG preview ([opengraph.xyz](https://www.opengraph.xyz) / LinkedIn inspector) | **not run** |
| Google Rich Results Test (Organization / WebSite / BlogPosting) | **not run** |
| Raw-HTML curl on key pages (`/`, `/about`, `/services`, `/contact`, `/blog`, `/llms.txt`, `/robots.txt`) for RSC copy + headers | **not run** on production post-deploy |
| Real devices / touch targets (320–1920) | **not run** |
| Cross-browser (Chrome, Firefox, Edge, Safari, iOS Safari, Android Chrome) | **not run** |
| Search Console + Bing sitemap submission | **not run** |
| Analytics cookies vs privacy claims (DevTools Application) | **not run** (ties to F34) |
| Fill/publish real service content in admin for four slugs | **content pending** |
| E2E forms (contact, quote, newsletter, feedback token) | Manual / no Playwright |

---

## 8. Quick wins (historical Phase 1 list)

Most of the original quick-win list is done in Batches 1–7. Still open from that spirit: **F15** hero brand, **CSP enforce** after review, **F34** cookies, and **shipping real CMS proof** (reviews / cases / posts).

---

## 9. Design and UX notes (updated)

- Homepage Signal Atelier direction remains the reference; blog article and admin login are no longer the largest integrity gaps.
- Largest remaining design gap called out by the audit: **F15** hero brand-test after removing nav.
- Trust/conversion still limited by empty proof surfaces — correct ethically; content is the unlock, not more UI chrome.
- Admin Operate chrome is separated from marketing; confirm dialog and table shell reduce a11y/UX debt.

Phase 1 browser screenshots and page-by-page notes remain valid as a **pre-fix** snapshot of production; they were not re-captured after Batches 1–7.

---

## Positive findings (keep)

- Official BrandMark (not Lucide Zap-as-logo).  
- Design tokens in `globals.css` / Tailwind match `DESIGN.md`.  
- Skip link + global `:focus-visible` signal rings (public + admin).  
- Honest empty states; gated routes instead of fake portfolios.  
- Form pipeline: honeypot → Turnstile → rate limit → validate.  
- `SafeHtml` sanitization for admin HTML.  
- Per-page metadata + canonicals; sitemap + robots; feedback/admin noindex.  
- `prefers-reduced-motion` on hero field, sculpture, capabilities, ProcessLine, Quote `MotionConfig`, and CSS spinners.  
- Analytics skipped on `/admin`.  
- External social links use `rel="noopener noreferrer"`.  
- `npm audit` (prod): 0 vulnerabilities at original audit time (**not re-run** for this status update).

---

## Phase gate

Batches **1–7** code is in the working tree. Next approved step: **Batch 8 (F15) — plan first**, then Batch 9 (F34), plus manual verification list above after deploy.
