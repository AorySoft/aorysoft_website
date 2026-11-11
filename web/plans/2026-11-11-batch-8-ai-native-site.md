# Batch 8 — AI-native look and feel across the public site (F15 included)

**Status:** plan only, awaiting approval. No code is written until it's approved.
**Branch:** `fix/disable-admin-analytics` · **Baseline commit:** `a55f551`

## Goal

Every public page should read clearly as **AorySoft, an AI, automation and web/app development company**, including pages reached directly from search. All of it stays inside the Signal Atelier language (`DESIGN.md`) and the honesty rules. We get there through a few shared patterns and one set of site-wide rules, not one-off decoration.

## Non-goals (YAGNI)

- No redesign. Same tokens, fonts, true-black stage and logo gradient. No new colors and no new libraries.
- No new client JS for the patterns. They are server components plus CSS. Framer Motion is *removed* where a pattern replaces it (section 9).
- No invented content: no metrics, client names, logos, testimonials, dashboards, or chats presented as real. No new service copy written by us; service pages render CMS fields only.
- Admin, database schema, RLS and forms logic are out of scope. Batch 9 (cookies) is separate.

## How the review was done (honest scope)

- **Method.** Production build of the current branch (`next start` on port 3471, stopped afterwards). Headless Chrome via CDP with reduced motion emulated, full-page shots at 375, 768, 1280 and 1920 for 16 URLs, saved to the session scratchpad only. The Playwright MCP was not used, because it writes into `.playwright-mcp/`.
- **Reviewed in detail:**
  - every page at 1280
  - home at 375, 1280 (in segments) and 1920
  - services at 375
- **Captured but not reviewed per page:** 768, and 375/1920 for the inner pages. Step 0 adds a full four-width pass before any change.
- **Code review only.** These can't render populated today, because no service has a slug and there are 0 posts and 0 cases:
  - `/services/[slug]`
  - `/blog/[slug]`
  - populated `/work` and `/reviews`
  - the `error.tsx` boundaries

## Bug found during the review (fix first, independent of design)

**All capability tab panels are visible at once.** `ServicesSection.tsx:202-209` gives each panel `hidden={!selected}` *and* Tailwind's `grid` class. The utility overrides `[hidden]{display:none}`, so all four panels stack (about 2,500 px on home) and the tabs do nothing.
- Fix: apply `grid` only when selected, or add `[&[hidden]]:hidden`. Keep every panel in the DOM, as the existing comment intends, for crawlers/LLMs.
- Add an RTL test that only one panel is displayed.

---

## 1. Page-by-page review

The columns are: what it looks like now, what feels generic or off, and the planned change.

### Home

| Section | Now | What feels off | Change |
|---|---|---|---|
| Hero | Left copy; A-mark sculpture with wordmark and 4 signal nodes (Web / Apps / AI agents / Automation). | The strongest AI-native moment on the site, but the wordmark is small (`7.2cqw`). At 1280/1920 the `min-h 100svh` hero leaves about 250–350 px of empty black under the content. At 375 the brand shows only in the 28 px nav logo until the sculpture scrolls in (it starts at about y = 500). | **F15:** elevate the wordmark into a proper lockup with the mark (size and tracking matched to `BrandMark`). Trim the empty space under the hero. The nodes link to a published service page when one exists, otherwise they stay as now (`#services`). |
| Capabilities | Tabs plus four stacked panels (bug above); one chat vignette; serif tab labels at small size. | The stacked bug makes it look like a long template list. "AI Automation" shows a **chat** scene because its CMS `icon` is `bot`. The vignette carries **no visible "example" label**. | Fix the bug. Vignette goes in **P2 ExampleFrame** with a visible caption. Panel CTA links to the service detail page when published, otherwise to `/quote`. The tab indicator moves from Framer to CSS. |
| How we build (`AboutSection`) | Centered narrow text band on surface. | Sparse. It's the only centered section and it breaks the left-weighted rule. | **Merge** into "How a project runs" using **P1 StepRoute** with the existing `PROCESS_STEPS`, plus the "About AorySoft" link. |
| Technology | Labeled rows (Interface / Logic / Data / AI & automation / Platform). | Good and distinctive; tall padding only. | Keep, as **P5 StackRows**. Tighten padding. |
| Who we build for | Four large muted serif industry rows. | Long; muted titles read as disabled. | Keep. Tighten rhythm; titles to `text-ink`. |
| Client reviews | Empty: a long dark band with one sentence. Now 1 published review exists (see the 0013 note in the handover). | The empty band wastes about 450 px. | Hide when 0 (**Q1**); render as now when ≥1. |
| Build with us (`CareersPreview`) | Thin band with one button. | A low-value interruption before the final CTA; careers is already in the nav and footer. | Remove from home (**Q2**). |
| Final CTA | Big serif CTA, ghost A, case-study note. | Good. | Keep. |

### Other pages

| Page | Now | What feels off | Change |
|---|---|---|---|
| `/services` | Indented hero, 2×2 bordered cards, "Ask about this". | Generic card grid, no AI/automation signal, hero alignment differs from home and careers. | **P4 PageHero**. Cards become **P3 ServiceRow**. |
| `/services/[slug]` | Single column: overview, deliverables, numbered process, technologies, FAQs (code review). | Plain lists; no capability-specific visual. | Section 4 template (P1, P2, P5, P8). |
| `/about` | Indented hero, 3 discipline columns, `ProcessLine`, 3 equal CTAs. | Best inner page. Alignment inconsistent; three equal CTAs dilute the action. | P4. `ProcessLine` becomes the shared P1 (CSS, no Framer). One primary and one secondary CTA. |
| `/blog` (empty) | Centered hero, "search-x" icon empty state, centered newsletter box. | The icon reads as an error; three alignments on one page. | P4, **P6 EmptyState**, **P7 NewsletterBlock** left-aligned. |
| `/blog/[slug]` | Atelier article (code review). | No next step after the article. | **P8 PageEndCta**. |
| `/careers` | Left hero, "no open roles" band, "Don't see your role?" band. | Two sparse bands. | P4; one composed P6 block combining both. |
| `/contact` | Indented hero; form card plus 2 aside cards. | Solid. | P4 only. |
| `/quote` | Centered hero; progress bar; centered wizard. | Centered, unlike every other inner page. | P4 (left). Wizard unchanged (keeps Framer, section 9). |
| `/privacy`, `/terms` | Indented prose; `h2` in bold sans. | The only pages with sans `h2`s. | P4 compact; `h2` in display serif. Copy unchanged. |
| `/work` (gated) | 404 when empty; populated list is code review only. | Plain text list when populated. | P4; items as P3 rows. Gate unchanged. |
| `/reviews` (gated) | 404 when fewer than 3. | — | P4. Gate unchanged. |
| 404 | Centered cyan "404", one button. | Bare; doesn't help a search visitor. | Add links to Services, About and Contact (existing routes only). |
| Root `error.tsx` / `not-found.tsx` | Render outside `MarketingShell` (code review). | No brand. | Add `BrandMark`. |
| Newsletter confirm / unsubscribe | Raw HTML card (`token-page.ts`), **no brand**. | A visitor from an email sees no AorySoft identity. | Inline the official mark SVG and the wordmark; still static HTML. |
| Navbar / Footer | `BrandMark` plus links. | Consistent. | Footer lists published service pages (**Q6**). |
| OG image | A Georgia "A" in a bordered box. | Not the official mark. | Section 3. |

---

## 2. Shared AI-native pattern set

All patterns are server components plus CSS modules, with no new dependencies, and all respect `prefers-reduced-motion`.

| # | Pattern | Expresses | Reuses | New | Used on |
|---|---|---|---|---|---|
| P1 | **StepRoute**: steps on a signal line with node squares; CSS pulse on view, static under reduced motion | How it works / workflows / process | `sections/ProcessLine.tsx`; hero `.track/.pulse/.node` styles | Generalize `ProcessLine` (drop Framer) to take `steps: {title, detail?}[]` | Home, About, Service detail (`process_steps`) |
| P2 | **ExampleFrame**: bordered stage with a caption bar "Illustrative example" | AI behavior (chat, agent, workflow, insight) without claiming it's real | `CapabilityVignette` (7 scenes), `capabilities.module.css` | `ExampleFrame.tsx` | Home capabilities, Service detail |
| P3 | **ServiceRow**: icon node + title + subtitle + up to 3 deliverables + link | Catalog density without a card grid | `ICONS` map, `toCapability` | `ServiceRow.tsx` | `/services`, `/work` items |
| P4 | **PageHero**: eyebrow (DM Sans label with a signal node) + display h1 + lead + optional CTAs + faint GhostMark/field | Brand signal on every inner page | `GhostMark`, `.field`, `display-title`, `body-lead` | `PageHero.tsx`, `brand/GhostMark.tsx` (moved out of `HeroSection`) | All inner pages |
| P5 | **StackRows**: labeled technology rows | Technology as tools we use (text, not vendor logos) | `TechnologiesSection`, `stack.module.css` | Extract `StackRows.tsx` | Home, Service detail |
| P6 | **EmptyState**: compact, left-aligned, node motif, one honest sentence, one action | Honest absence without dark stretches | — | `EmptyState.tsx` | Blog, Careers |
| P7 | **NewsletterBlock** | Consistent newsletter | `NewsletterSignup.tsx` (logic unchanged) | Layout wrapper | Blog index, Blog post |
| P8 | **PageEndCta**: one-line band, primary Quote + one contextual secondary | A clear next step on every page | `FinalCtaSection` styles | `PageEndCta.tsx` | Services, Service detail, About, Blog post, Careers, Work, Reviews |

Each pattern gets a short entry in `DESIGN.md` (Components).

## 3. Brand signal on every page type

- **Marketing pages:** `Navbar` and `Footer` `BrandMark` (unchanged), plus P4 GhostMark on inner heroes.
- **Home first viewport (F15):**
  - the sculpture wordmark becomes a lockup sized to the mark
  - it stays `aria-hidden`, because the accessible brand name is the nav link "AorySoft home" and the `<title>`
  - at 375 the lockup comes within about 1.5 viewports by trimming the hero gap
- **404 / error:** the marketing 404 keeps its chrome. The root `not-found.tsx` and `error.tsx` add `BrandMark`, a link labeled "AorySoft home".
- **Newsletter token pages:** inline SVG from `MARK_PATHS`/`MARK_STOPS` with `<title>AorySoft</title>`, plus the text wordmark. No external request; the CSP is unaffected.
- **OG image:**
  - the official mark (from `MARK_PATHS` + `MARK_STOPS`, as an inline SVG data URI) + wordmark + `SITE_TAGLINE` on black
  - `alt`: "AorySoft: AI-first solutions, real-world impact"
- **Source of truth:** `brand/aorysoft-mark.svg` and `brand/aorysoft-logo.jpg`, read only; `markGeometry.ts` is already traced from them. **Nothing in `brand/` is modified.**

## 4. Service detail template (one template, CMS-driven)

The order below uses only existing CMS fields: `title`, `subtitle`, `description`, `icon`, `deliverables`, `process_steps`, `technologies`, `faqs`, `seo_*`.

1. **P4 PageHero:** eyebrow "Service", h1 `title`, lead `subtitle`, CTAs (Quote / Contact).
2. **Overview + P2 ExampleFrame** (stacked at 375). `description` on the left; on the right, the scene for the service's `icon` via the existing `vignetteFor`:
   - `bot` → chat
   - `brain` → agent
   - `zap` → workflow
   - `code` → build
   - and so on

   The capability-specific feel comes from the CMS icon choice, not hardcoded copy.
3. **Deliverables:** two-column ruled list.
4. **How it runs:** P1 from `process_steps`, only when present.
5. **Technology:** P5 from `technologies`.
6. **FAQs:** existing list and JSON-LD, unchanged; answers stay in the server HTML.
7. **P8 PageEndCta.**

The admin help text for `icon` explains which example each icon shows (one line in `resource-catalog.ts`).

## 5. Home: new order

1. **Hero** (F15 lockup, trimmed gap)
2. **Capabilities** (bug fixed, ExampleFrame, CSS indicator, links to detail pages when published)
3. **How a project runs** (merges `AboutSection`; P1 with `PROCESS_STEPS`; link to About)
4. **Technology** (P5)
5. **Who we build for** (tightened)
6. **Client reviews** (only when ≥1 published, Q1)
7. **Final CTA**

**Removed from home:**
- the `AboutSection` band (merged into 3)
- `CareersPreview` (Q2)

Every section ends in a link to its dedicated page.

## 6. Honesty rules (every illustrative element)

- **Visible labels.** Every scene sits in an ExampleFrame with a visible caption, "Illustrative example", plus an `sr-only` expansion ("not a real client conversation or result"). The scenes stay `aria-hidden`.
- **No numbers or results in examples:** no counters, percentages, "hours saved", uptime, or client counts.
- **No fakes.** No client or partner logos; technology appears as text in StackRows. No fake chat transcripts presented as real. **No fake dashboards:** the existing "insight" scene shows unlabeled shapes only (no axes, values or KPIs) and is captioned as an example. No stock "team" imagery.
- **CMS-only proof.** Reviews, cases and posts come only from the CMS and keep their gates (cases ≥1; `/reviews` ≥3; permission confirmed).
- **New sentences** are listed in each PR for your approval; everything else is existing copy moved.

## 7. Consistency pass (one set of rules, site-wide)

| Area | Current inconsistency | Rule after Batch 8 |
|---|---|---|
| Hero alignment | Left on home and careers; indented `max-w-3xl` on services, about, contact, privacy and terms; centered on blog and quote | **P4 PageHero:** left at the shell edge, `max-w-3xl` text measure, on every inner page |
| Hero height and padding | Each page uses its own `pt`/`pb`; home is `100svh` | PageHero uses `section-y`; home hero content-height at lg with a capped min-height (no empty band) |
| Section rhythm | Mixed `section-y`, custom `py-*`, and `mt-12 pt-10` stacks; alternating `bg-canvas`/`bg-surface` without a rule | `section-y` everywhere. Background alternates by section order only (canvas → surface → canvas). Sections are separated by a `border-line` top rule. |
| Section headers | Each section hand-rolls h2 + lead | One `SectionHeader` (eyebrow optional, display h2, `body-lead`), used by every section |
| Headings | Privacy/terms `h2` in bold sans; everything else display serif | Display serif h1–h3 on all marketing pages; DM Sans for labels only |
| CTA wording | "Get a Quote" / "Get a quote" (quote h1) / "Get started with X" / "Ask about this" / "Explore services" / "Email us" / "View careers" / "Back to home" | **Primary is always "Get a Quote"** → `/quote`. Secondary is "Contact us" or a specific "View …" link. Service CTAs read "Get a Quote" with the service preselected (existing `requestCapability` behavior). The quote page h1 stays "Get a quote" (heading case). |
| CTA placement | 0–3 CTAs per page; about has 3 equal buttons | Max one primary + one secondary per section; every page ends with P8 or the home Final CTA |
| Card styles | Bordered cards on services, contact and quote; editorial rows on home | Cards only for interactive containers (forms, wizard, ExampleFrame). Listings use rows (P3). |
| Empty states | Icon empty state (blog), sentence bands (careers, reviews) | P6 everywhere; or hide (home reviews) |
| Motion | Framer (tab indicator, ProcessLine, quote steps) next to CSS (hero, vignettes, blog reveal) | CSS for all marketing patterns. Framer only in the quote wizard. Max 2–3 motions per viewport (`DESIGN.md`), all disabled by reduced motion. |
| Muted text | Industry titles in muted serif look disabled | `text-ink` for headings; `ink-muted` for body; `ink-subtle` for meta only |

## 8. Constraints and how each is satisfied

| Constraint | How |
|---|---|
| `prefers-reduced-motion` | Every new animation lives in a CSS module with a `@media (prefers-reduced-motion: reduce)` block (static end state); existing hero and vignette blocks are kept. Verified with the CDP reduced-motion emulation in step 7. |
| CLS | New visuals are absolutely positioned or have a fixed aspect ratio (ExampleFrame keeps `aspect-[5/4]`). No content is injected after hydration. Fonts are unchanged (preloaded with `adjustFontFallback`). Measured with a Chrome trace before and after. |
| No layout shift on mobile | Same as above, plus no viewport-height-dependent sizing except the capped home hero, and the 375 screenshots compared at load and after 3 s |
| Keyboard / screen reader | Tabs keep the existing roving `tablist` behavior. StepRoute is an ordered list. ExampleFrame captions are visible and the scenes are `aria-hidden`. Every page keeps one h1 and the landmarks. RTL tests for roles and headings. |
| Contrast | Tokens only: `ink` and `ink-muted` on canvas/surface, and black on signal (all ≥ 4.5:1). `ink-subtle` is used only for ≥14 px meta. A token contrast check is added to step 7. |
| All content in server HTML | Every pattern is a server component. All capability panels stay in the DOM (only display toggles). FAQ answers are rendered (no client fetch). Example captions are SSR. Checked by curl/grep of the built HTML in step 7. |
| No heavy client dependencies | No new packages; Framer usage goes down (section 9) |
| No regressions (SEO, JSON-LD, gating) | h1s, titles and canonicals unchanged; `check:seo` must pass; JSON-LD components untouched; gates untouched; `sitemap`/`llms` unchanged. Existing tests (`ServicesSection`, `indexable`, `seo-check-lib`) must stay green. |

## 9. Performance budget

**Current client JS (gzip, from the build):** every route loads a shared base of about **187 KB**. Framer adds about **45 KB** where used.

| Route | JS gzip | Framer on route |
|---|---|---|
| `/` | 240.6 KB | yes (tab indicator) |
| `/about` | 233.2 KB | yes (`ProcessLine`) |
| `/quote` | 233.6 KB | yes (wizard) |
| `/blog` | 196.3 KB | no |
| `/contact` | 189.6 KB | no |
| `/services`, `/careers`, `/privacy`, `/terms` | 187.2 KB | no |
| 404 | 186.7 KB | no |

**Expected impact per step (gzip JS; LCP):**

| Step | JS | LCP |
|---|---|---|
| 1. Panel bug fix | 0 | Neutral (less DOM painted on home) |
| 2. Brand quick wins (OG, token pages, root error/404) | 0 on pages (the OG image is generated server-side) | Neutral |
| 3. Primitives + tokens | 0 (server components) | Neutral |
| 4. Home | **About −45 KB** if the capability indicator and P1 drop Framer and nothing else on home uses it; the hero sculpture is unchanged | Neutral to slightly better (shorter page; LCP element stays the h1) |
| 5. Service detail template | +0 to 2 KB (vignette scenes are already server-rendered markup) | Neutral |
| 6. Remaining pages | **`/about` −45 KB** (P1 replaces Framer `ProcessLine`); others ±1 KB | Neutral |

**Budget for the whole plan:** no route grows by more than 2 KB gzip; home and about should drop by about 45 KB each. LCP must not get worse than baseline by more than 100 ms in the local trace.

**Framer vs CSS:** CSS for P1–P8 and the capability tab indicator (a transform/width transition). Keep Framer only in the quote wizard, where `AnimatePresence` step transitions are used; that's outside this batch.

## 10. Baseline

| Item | Home | Service page |
|---|---|---|
| First viewport at 375 | Nav (logo + menu), h1, lead, 2 CTAs; sculpture starts about y = 500 (below) | **Not measurable:** no published service (no slugs) |
| First viewport at 1280 | Nav, h1, lead, 2 CTAs, sculpture + wordmark + 4 nodes; about 300 px of empty black under it | n/a |
| LCP element | **Not measured** (expected: h1 text at both widths) | n/a |
| Client JS | 240.6 KB gzip (section 9 lists all routes) | Not prerendered without data |
| CLS | **Not measured.** Observed: nothing visibly shifts in screenshots; fonts preloaded; sculpture fixed ratio | n/a |
| Lighthouse mobile | **Not measured.** No Lighthouse is installed; `npx lighthouse` would download a package (Q9). | n/a |

**Re-baseline:** after this branch is deployed, take the final baseline on production (PageSpeed Insights mobile plus the CDP trace) before step 4 ships. A service-page baseline needs one published service (Q4).

## 11. Step plan (ordered by value and risk; each step is one reviewable commit)

| # | Step | Ships | Why this position |
|---|---|---|---|
| 0 | Baseline: CDP trace (LCP/CLS) + four-width screenshots of every URL; production numbers after deploy | Nothing (data) | Needed to judge everything else |
| **1** | **Fix capability panel bug** + RTL test | **Ships first** | Visible defect on the most important page; tiny, zero risk |
| **2** | **Brand quick wins:** OG with the official mark, token pages, root `error`/`not-found` with `BrandMark`, 404 helpful links | **Ships first** (with 1) | High value, isolated files, no layout risk |
| 3 | Shared primitives + rules: `SectionHeader`, `PageHero`, `ExampleFrame`, `EmptyState`, `PageEndCta`, `StackRows`, `ServiceRow`, `ProcessLine` → CSS `StepRoute`; tests | Not visible on its own | Foundation for 4–6 |
| 4 | Home: F15 lockup + hero gap, capabilities (ExampleFrame, CSS indicator), merged How a project runs, technology, industries, reviews rule, careers band removed | Visible | The biggest impression |
| 5 | Service detail template + icon help text | Visible once a service is published | Depends on 3; content-gated |
| 6 | Remaining pages: services, about, blog (+ post end), careers, contact, quote hero, privacy/terms, work, reviews | Visible | Mechanical adoption of 3 |
| 7 | Verify: gates, JS budget, LCP/CLS vs baseline, reduced motion, SSR content grep, contrast check, four-width after-shots | Report | — |
| 8 | Docs: `DESIGN.md` patterns + rules, `FRONTEND_AUDIT.md` (F15, panel bug), before/after summary | Docs | — |

Gates after every step: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run check:seo`. `test:rls` is not needed (no DB changes).

## Files likely touched

- **New:** `components/PageHero.tsx`, `SectionHeader.tsx`, `ExampleFrame.tsx`, `EmptyState.tsx`, `PageEndCta.tsx`, `ServiceRow.tsx`, `StackRows.tsx`, `brand/GhostMark.tsx`, plus tests.
- **Edited:**
  - `ServicesSection.tsx`, `HeroSection.tsx`, `hero/HeroSculpture.module.css`, `TechnologiesSection.tsx`, `IndustriesSection.tsx`, `ReviewsSection.tsx`, `sections/ProcessLine.tsx`
  - the marketing pages listed in section 1
  - `app/error.tsx`, `app/not-found.tsx`, `app/opengraph-image.tsx`
  - `lib/public-forms/token-page.ts`, `lib/admin/resource-catalog.ts` (help text)
  - `DESIGN.md`, `FRONTEND_AUDIT.md`
- **Not deleted.** `AboutSection.tsx` and `CareersPreview.tsx` become unused. I'll list them for you to decide on.

## Risks

- **File size.** `ServicesSection.tsx` is 270 lines; extracting the panel keeps it under 300. `services/[slug]/page.tsx` is 232; sections move into components.
- **OG font.** `ImageResponse` can't use `next/font`, so Instrument Serif needs a TTF (Q3).
- **N7.** Gated 404s ship a spinner in raw HTML until `app/loading.tsx` moves (Q7).
- **No PII, RLS, service-role or forms-logic changes.**

## 12. Open questions for you

| # | Question | My recommendation |
|---|---|---|
| Q1 | Home reviews when there are 0 published | Hide the section; `/reviews` stays gated |
| Q2 | Home "Build with us" band | Remove; careers stays in the nav and footer |
| Q3 | OG image font | Commit the Instrument Serif TTF (OFL) under `src/app/fonts/` |
| Q4 | Which four services, and their content (current CMS: AI Automation, Smart Integrations, Data Analytics, Cloud Solutions; you described chatbots, agents, automation, web development) | You fill the CMS (slug, overview, ≥4 deliverables, icon, optional process/tech/FAQs). I write no service copy. Publishing one service also unlocks the service-page baseline. |
| Q5 | Inner-page hero alignment | Left at the shell edge everywhere |
| Q6 | Footer links to published service pages | Yes, footer only |
| Q7 | Move `app/loading.tsx` (N7) in this batch | Yes, to `app/admin/(panel)/loading.tsx` |
| Q8 | New copy needed: the eyebrow labels (e.g. "Services", "Service", "About"), the ExampleFrame caption "Illustrative example", 404 helper links text | Approve as listed, or give wording |
| Q9 | Lighthouse mobile locally (needs `npx lighthouse`, a download) or PageSpeed Insights on production after deploy | PageSpeed on production after deploy |
| Q10 | Brand assets: is `brand/aorysoft-mark.svg` the final official mark, and is there an approved wordmark file (the current wordmark is Instrument Serif text)? | Keep text wordmark unless you have a file |

---

## After Batch 8 (not started)

**Batch 9 (F34):** verify the real cookie behavior of Cloudflare Web Analytics and Vercel Analytics against the privacy page claims ("the public website sets no tracking cookies"), add an accurate cookies section, and report the findings.
