---
name: AorySoft
description: Signal Atelier — premium AI-first technology marketing identity
colors:
  canvas: "#000000"
  surface: "#0b0f14"
  surface-raised: "#121820"
  line: "#1e2836"
  ink: "#f4f7fa"
  ink-muted: "#a8b3c2"
  ink-subtle: "#7b8796"
  signal: "#06b6d4"
  signal-deep: "#2563eb"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "3.25rem"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  atelier: "6px"
  atelier-lg: "10px"
spacing:
  section-y: "80px"
  container-x: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.atelier}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.atelier}"
    padding: "12px 24px"
  input-field:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.atelier-lg}"
    padding: "12px 16px"
---

# Design System: AorySoft

## Overview

**Creative North Star: "Signal Atelier"**

AorySoft’s public identity is a precision AI engineering studio on a true-black stage. The official geometric **A** mark owns the blue→cyan gradient; UI samples those hues sparingly as signal accents. Instrument Serif carries authority in display and headings; DM Sans handles product UI and body. Geometry stays precise and restrained — not pill-chrome, not neon template noise.

Admin (`/admin`) shares the same tokens in Operate mode: denser, quieter, without marketing atmosphere.

**Key Characteristics:**
- True black / graphite surfaces with cool mist text
- Signal cyan (and deep blue) used rarely; logo keeps the full gradient
- Sharp serif display + clean sans body
- Editorial sections over card grids where possible
- 2–3 intentional motions (hero field drift, content enter, CTA/focus)

## Colors

Deep black neutrals with a logo-derived signal accent.

### Primary
- **Signal Cyan** (#06b6d4): Primary CTA fills, active links, focus rings, sparse accents.
- **Signal Deep** (#2563eb): Logo gradient pole; optional deep accent — not default CTA fill.

### Neutral
- **Canvas** (#000000): Page background.
- **Surface** (#0b0f14) / **Raised** (#121820): Section and panel grounds.
- **Line** (#1e2836): Borders and rules.
- **Ink** (#f4f7fa) / **Muted** (#a8b3c2) / **Subtle** (#7b8796): Text hierarchy.

### Named Rules
**The Logo Owns the Gradient Rule.** Full blue→cyan ramps belong on the mark (and rare hero moments), not on every button, card, and headline.

**The Signal Rarity Rule.** Accent color stays roughly ≤10% of any marketing viewport.

## Typography

**Display Font:** Instrument Serif  
**Body Font:** DM Sans  

**Character:** Premium, precise, product-studio. Serif for promise; sans for clarity.

### Hierarchy
- **Display:** Instrument Serif, ~2.5–4rem — hero and section titles.
- **Title:** Instrument Serif, ~1.5–2rem — card/aside headings.
- **Body:** DM Sans, ~1–1.125rem — supporting copy (measure ~65ch).
- **Label:** DM Sans medium, ~0.875rem — forms and meta.

### Named Rules
**The No Gradient Text Rule.** Emphasis comes from size and weight, not clipped gradient fills on headlines.

## Layout

`max-w-7xl` shell with generous section rhythm (`py-20` / `md:py-28`). Home: Hero → How we build → Capabilities → Selected work → Technology → Who we build for → Careers → Final CTA. Left-weighted editorial bands preferred over centered template stacks after the hero.

## Elevation & Depth

Mostly tonal: bordered surfaces on black. Primary CTA may use a soft signal shadow on hover. No decorative glass stacks.

## Shapes

`6px` / `10px` atelier radii. Prefer rules and panels over soft pills. Geometric A-mark angles inform precision, not sci-fi HUD chrome.

## Components

### Buttons
- **Primary:** Solid signal cyan, canvas text, atelier radius.
- **Secondary:** Transparent with line border; signal on hover.
- **Focus:** Signal outline, 3px offset.

### Cards / Containers
- Thin line borders, surface fills, atelier-lg radius — used when interaction or grouping needs a container.

### Inputs
- Raised surface, line border, signal focus ring.

### Navigation
- Fixed, transparent over hero; blurred canvas + line when scrolled. Official BrandMark (A + wordmark). Quote CTA uses primary button.

### Brand
- Official logo asset: `brand/aorysoft-logo.jpg` / `web/public/brand/aorysoft-logo.jpg`. SVG `AoryMark` approximates the geometric A for crisp UI.

## Do's and Don'ts

### Do:
- **Do** keep AorySoft hero-level in the first viewport.
- **Do** hide unverified phone/address and unpublished case studies.
- **Do** respect `prefers-reduced-motion` for field drift and entrances.

### Don't:
- **Don't** use the Lucide Zap placeholder as a brand mark.
- **Don't** fabricate metrics, reviews, or portfolio projects.
- **Don't** spray blue→cyan gradients across UI chrome.
- **Don't** default to Inter, purple AI kits, or pill-everywhere SaaS patterns.
