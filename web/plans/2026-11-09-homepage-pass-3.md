# Homepage pass 3 — logo, remaining sections, review fixes

**Date:** 2026-11-09 · **Direction:** Signal Atelier, Amplified (approved) · **Status:** approved by owner ("do all three"), implementing

## Goal

Finish the homepage in the approved direction (the approved hero and the Capabilities rail stay as they are). Put the approved traced logo everywhere it appears. Fix the issues the read-only review found on other pages, to WCAG 2.2 AA.

## Non-goals (YAGNI)

- No Supabase data or schema changes; test service rows are unpublished by the owner in `/admin`.
- No commits.
- No new dependencies (framer-motion + CSS only; no GSAP).
- No Reviews feature, no new copy claims, no redesign of admin.
- Blog, Careers, Contact and Quote pages are fixed, not redesigned.

## Current state

- Hero (`HeroSection` + `hero/`) and Capabilities rail (`ServicesSection` + `capabilities/`) were accepted in live mode.
- `BrandMark.tsx` draws a hand-made SVG A. Its gradient id is derived from the size, so the nav and the footer both render `aory-grad-28`.
- The traced mark lives in `brand/aorysoft-mark.svg` and `components/brand/markGeometry.ts`.
- The remaining sections are still the plain editorial versions: About, Technologies, Industries, CareersPreview, Portfolio (honest empty state) and FinalCta.
- The review found:
  - About: a hydration mismatch when reduced motion is on.
  - Careers: invented benefits, placeholder roles and `careers@`.
  - Blog: badge contrast fails (~2.2:1); some leftover pre-restyle classes.
  - Contact: inline links are distinguished by colour only.
  - Field borders: about 1.2:1 against the field background.
  - Quote: choice buttons have no `aria-pressed`, there's no fieldset/legend, the progressbar has no name, and headings jump h1→h3.

## Steps

1. **Logo.**
   - `BrandMark`/`AoryMark` use `MARK_PATHS`/`MARK_STOPS` and a per-instance `useId` gradient id.
   - Don't announce the brand name twice when the wordmark is shown.
   - Remove the dead code.
   - Export `public/brand/aorysoft-mark.svg` and use it as the favicon (the OG image stays the JPG).
2. **How we build** (About).
   - A process line: Discover → Design → Build → Integrate → Operate.
   - A scroll-linked cyan pulse, driven by CSS scroll-driven animation with an IntersectionObserver fallback.
   - Keep the existing copy and pillars.
   - Fix hydration: stable `initial`, with reduced motion handled through `MotionConfig` / CSS.
3. **Industries.**
   - A large serif index; each row reveals its description on hover/focus within (disclosure via a native `<details>` on touch).
   - Keep the copy.
4. **Technology.**
   - A stack wall grouped by layer (Interface / Logic / Data / AI & automation / Platform).
   - Use only items from the existing list.
5. **Selected work.**
   - Remove it from the home page (`page.tsx`); merge the message into the Final CTA.
   - Keep `/#work` anchors working by pointing them at the CTA.
6. **Final CTA.** A full-width serif statement over a ghosted A outline, with the existing copy and actions.
7. **Review fixes.**
   - Careers: remove the benefits list and the placeholder roles (use an honest empty state), and use `info@aorysoft.com`.
   - Blog: change the badge to `bg-signal text-canvas`; replace the leftover classes with tokens; no pills.
   - Contact: underline inline links.
   - `.field-input`: give the border at least 3:1 against the field background.
   - Quote: add `aria-pressed`, `fieldset`/`legend`, a progressbar label and correct heading levels; respect reduced motion on the progress bar.
8. **Tests.** BrandMark ids are unique; the quote choice state is announced; existing suites stay green.

## Files likely touched

- `src/components/{BrandMark,AboutSection,IndustriesSection,TechnologiesSection,FinalCtaSection,Footer}.tsx`, plus new section modules under `src/components/sections/`
- `src/app/{page,layout,globals.css}`
- `src/app/{careers/CareersContent,blog/BlogContent,contact/ContactContent,quote/QuoteForm}.tsx`
- `public/brand/aorysoft-mark.svg`

## Verification

`npm run typecheck` · `npx eslint src` · `npx vitest run --pool=threads` · Impeccable detector on `/` · browser checks at 1440 and 375 px with reduced motion on and off, plus a keyboard-only pass.

## Risks

- Form files hold Turnstile, the honeypot and server-action wiring. Make markup and class changes only; the pipeline stays untouched (security-pii).
- CSS scroll-driven animations aren't supported in Safari/Firefox. They must degrade to a static, fully visible state.
- `QuoteForm.tsx` is large. Don't grow it past the 450-line limit; extract the choice group if needed.
