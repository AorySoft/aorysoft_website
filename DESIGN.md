---
name: AorySoft (incumbent)
description: As-shipped dark blue–cyan marketing UI before redesign approval
colors:
  canvas: "#111827"
  surface: "#1f2937"
  surface-raised: "#374151"
  ink: "#ffffff"
  ink-muted: "#d1d5db"
  ink-subtle: "#9ca3af"
  accent-blue: "#2563eb"
  accent-blue-mid: "#3b82f6"
  accent-cyan: "#06b6d4"
  accent-cyan-bright: "#22d3ee"
  hero-blue-deep: "#1e3a8a"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "9999px"
spacing:
  section-y: "80px"
  container-x: "32px"
  stack-md: "24px"
  stack-lg: "64px"
components:
  button-primary:
    backgroundColor: "linear-gradient(to right, {colors.accent-blue}, {colors.accent-cyan})"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "linear-gradient(to right, {colors.accent-blue}, {colors.accent-cyan})"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.accent-cyan-bright}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  card-surface:
    backgroundColor: "rgba(17, 24, 39, 0.5)"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  nav-link-active:
    backgroundColor: "transparent"
    textColor: "{colors.accent-cyan-bright}"
---

# Design System: AorySoft (Incumbent)

> **Status:** Documentation of the **as-shipped** public marketing UI in `web/`. This file is a baseline / anti-reference for redesign planning. It is **not** the approved future visual world. Admin (`/admin`) reuses the same dark gray + cyan vocabulary with denser tooling UI; tokens below describe the public site first.

## Overview

**Creative North Star: "Neon Gradient Agency Kit"**

The incumbent site is a dark-mode marketing template: near-black canvas, blue→cyan gradient accents, glassmorphic bordered cards, pill CTAs, Lucide icons in gradient circles, and Framer Motion fade/slide reveals on almost every section. Typography is the browser/system sans stack — no custom display face is loaded. Atmosphere comes from animated particles, grid overlays, backdrop blur, and cyan glow shadows rather than photography or product craft.

Density is medium-high: each home section repeats a centered headline + supporting sentence + card/grid pattern. Brand mark is a Zap icon in a rounded square plus gradient wordmark. The look reads as generic “AI SaaS agency 2024” more than a distinctive AorySoft identity.

**Key Characteristics:**
- Dark gray-900 canvas with alternating gray-800/30 section bands
- Single accent axis: Tailwind blue ↔ cyan gradients
- System sans, bold gradient-clipped headlines
- Pill buttons + large-radius glass cards
- Motion-first: particles, hover scale, per-section whileInView entrances
- No design tokens in CSS variables; stock Tailwind 3 defaults only (`tailwind.config.ts` intentionally unextended)

## Colors

A cool dark palette with one blue–cyan accent ramp used for almost every interactive and decorative moment.

### Primary
- **Signal Blue** (#2563eb / Tailwind `blue-600`): Primary CTA fill start, icon wells, progress bars.
- **Mid Blue** (#3b82f6 / `blue-500`): Logo tile and mid gradient stops.
- **Hero Navy** (#1e3a8a / `blue-900`): Hero / page-header gradient origin.

### Secondary
- **Accent Cyan** (#06b6d4 / `cyan-500`): CTA fill end, glow shadows.
- **Bright Cyan** (#22d3ee / `cyan-400`): Active nav, outline buttons, scroll cue, focus borders.

### Neutral
- **Canvas Ink** (#111827 / `gray-900`): Page background (`body`).
- **Surface** (#1f2937 / `gray-800`): Inputs, card interiors, form shells.
- **Raised Edge** (#374151 / `gray-700`): Borders and hairlines.
- **Ink** (#ffffff): Primary text on dark.
- **Ink Muted** (#d1d5db / `gray-300`): Subheads and section support copy.
- **Ink Subtle** (#9ca3af / `gray-400`): Footer / secondary labels.

### Named Rules
**The Gradient Everywhere Rule.** Blue→cyan gradients appear on CTAs, logos, icon wells, progress, and headline accents — rarity is not part of the incumbent system.

**The Dark-Only Rule.** Public marketing UI is dark-mode only; no light theme tokens exist.

## Typography

**Display Font:** System UI sans (`ui-sans-serif, system-ui, sans-serif`) — no custom `@font-face` or Google Fonts in root layout  
**Body Font:** Same stack  
**Label/Mono Font:** None distinct

**Character:** Neutral, template-default. Hierarchy is achieved by size and weight, not by typeface contrast. Headlines often use `bg-clip-text` white→gray or blue→cyan gradients.

### Hierarchy
- **Display** (700, ~3rem→4.5rem / `text-5xl md:text-7xl`, tight leading): Home hero H1.
- **Headline** (700, ~2.25rem→3rem / `text-4xl md:text-5xl`): Section titles (“About”, “Services”, page heroes).
- **Title** (600, ~1.25rem): Card titles, form step headings.
- **Body** (400, ~1.25rem / `text-xl` common for lead copy): Section intros; form body closer to `text-sm`–`text-base`.
- **Label** (500, ~0.875rem): Form labels, footer links, badges.

### Named Rules
**The One-Face Rule.** Incumbent uses a single system sans; personality is not carried by typography.

## Layout

Centered marketing layout inside `max-w-7xl` with horizontal padding `px-4 sm:px-6 lg:px-8`. Sections typically use `py-20`. Home is a vertical stack of full-width sections (Hero → About → Services → Portfolio → Technologies → Industries → Careers preview). Navbar is fixed `h-16` with content offset `pt-16`. Mobile: hamburger drawer; desktop: centered link row + right-side Quote CTA.

Rhythm is repetitive: centered header block (`mb-16`) then responsive grids (`md:grid-cols-2/3`, `lg:grid-cols-3`, tech up to `xl:grid-cols-6`).

## Elevation & Depth

Hybrid of tonal layering and glow shadows. Cards sit on semi-transparent dark fills with `backdrop-blur` and `border-gray-700`. Depth cues include `shadow-2xl shadow-blue-500/20` on scrolled nav and `hover:shadow-blue-500/50` on primary CTAs — colored glow more than structural elevation.

### Shadow Vocabulary
- **Nav elevated** (`shadow-2xl shadow-blue-500/20`): Fixed nav after scroll.
- **CTA glow** (`hover:shadow-lg` / `hover:shadow-2xl` + `shadow-blue-500/50`): Primary buttons.
- **Card rest:** Usually border + blur only; no neutral drop shadow scale.

### Named Rules
**The Glow-Not-Lift Rule.** Depth is communicated with cyan/blue glows and blur glass, not a neutral elevation ladder.

## Shapes

Soft, highly rounded vocabulary: logo tile `rounded-lg` (8px); inputs `rounded-xl` (12px); cards `rounded-2xl` / `rounded-3xl` (16–24px); CTAs and chips `rounded-full` (pill). Icon containers are frequently circular (`rounded-full` wells). Borders are 1px gray-700, shifting toward cyan on hover.

## Components

### Buttons
- **Shape:** Pill (`rounded-full`) for marketing CTAs; `rounded-xl` for form submits.
- **Primary:** Blue→cyan gradient fill, white text, generous padding; hover adds blue glow shadow and slight scale (Framer).
- **Secondary / Ghost:** Transparent with cyan border/text (`border-cyan-400`).
- **Hover / Focus:** Scale micro-interactions; inputs use `focus:border-cyan-400` + `focus:ring-2 focus:ring-cyan-400/20`.

### Cards / Containers
- **Corner Style:** Large radius (`rounded-2xl` / `rounded-3xl`)
- **Background:** `bg-gray-900/50` or `bg-gray-800/50` + backdrop blur
- **Border:** `border-gray-700`, hover `border-cyan-500/50`
- **Internal Padding:** Typically `p-6`–`p-8`

### Inputs / Fields
- **Style:** `bg-gray-800`, `border-gray-700`, `rounded-xl`, white text, gray placeholder
- **Focus:** Cyan border + soft cyan ring
- **Error / Disabled:** Ad-hoc per form; no shared tokenized error color system beyond Tailwind red utilities where used

### Navigation
- Fixed top bar; transparent over hero, then `bg-gray-900/95 backdrop-blur-md` when scrolled
- Links: gray-300 → cyan-400 active/hover with gradient underline grow
- Brand: Zap-in-gradient-tile + gradient wordmark
- Mobile: full-width overlay menu

### Signature patterns (incumbent)
- **Hero particle field:** Deterministic cyan dots + CSS grid overlay on blue/gray/cyan gradient plane
- **Section header formula:** Gradient H2 + `text-xl text-gray-300` centered max-w-3xl
- **Icon well:** Gradient circle + Lucide icon above card copy
- **Tech “AI Core” hub:** Large gradient circle labeled “AI Core” above tech chip grid

## Do's and Don'ts

### Do:
- **Do** treat this file as the **current implementation record** when refining without a redesign approval.
- **Do** keep public writes, honesty rules, and content constraints from PRODUCT.md even when visuals change later.
- **Do** note that `tailwind.config.ts` has an empty `theme.extend` — any new system must introduce tokens deliberately.

### Don't:
- **Don't** treat Neon Gradient Agency Kit as the target brand identity for future work once a redesign direction is approved.
- **Don't** invent CSS variables or custom fonts that are not in the codebase when describing the incumbent.
- **Don't** document unverified portfolio/metrics content as visual “proof” assets — they are placeholders under PRODUCT.md.
