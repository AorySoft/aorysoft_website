# AorySoft Visual Redesign Brief

**Status:** Option A (**Signal Atelier**) approved and implemented in `web/` (2026-11-09).  
**Date:** 2026-11-09  
**Build path (workflow):** `comp` for public landing/showcase; code-first for admin/app screens (`.impeccable/config.json`).

## Goal

Replace the incumbent “Neon Gradient Agency Kit” marketing look with a **premium, recognizable AI-tech identity** that still honors PRODUCT.md: trust over theater, clear path to contact/quote, no fabricated proof.

## Non-goals (this brief)

- No code, layout, component, or asset changes in `web/src`
- No Reviews feature build (separate product plan)
- No inventing portfolio projects, logos, metrics, or testimonials
- No committing a replacement `DESIGN.md` world until Talha approves a direction

## Current state (documented)

Incumbent system recorded in:

- [`DESIGN.md`](../../DESIGN.md) — scan of as-shipped tokens/patterns
- [`.impeccable/design.json`](../../.impeccable/design.json) — sidecar for panel/snippets

**Observed identity:** dark `gray-900` canvas, blue→cyan gradients on nearly everything, system sans only, pill CTAs, glass cards, particle/grid hero décor, Framer Motion on most sections, **placeholder Zap icon** + gradient wordmark. `tailwind.config.ts` is intentionally stock (no token extensions yet).

## Official logo (binding — reviewed 2026-11-09)

Asset: [`brand/aorysoft-logo.jpg`](../../brand/aorysoft-logo.jpg)

| Element | Spec |
|---|---|
| Mark | Geometric stylized **A** — sharp architectural angles; blue→cyan gradient (deep royal → electric cyan) |
| Wordmark | **AorySoft** in white, high-contrast sharp serif (A/S caps) |
| Field | True black; subtle ghosted A watermarks acceptable as atmosphere |

**Compatibility with Signal Atelier: yes — with refinements below.** The logo already encodes premium AI-tech: black stage, blue–cyan as *signal in the mark*, serif authority in the name. The redesign must **serve this logo**, not fight it.

| Logo cue | Site implication |
|---|---|
| Black canvas | Dark-first marketing (true black / near-black graphite) |
| Blue→cyan in the **A** | Keep that gradient as brand property of the mark; UI accents sample those hues sparingly — do **not** paint every CTA/card/heading with the full logo gradient |
| Serif wordmark | Display/headings should harmonize with the logo serif (same family if licensed, or a close high-contrast sharp serif); body = clean sans |
| Sharp A geometry | Prefer precise corners / restrained radii over soft pill-everywhere chrome; optional subtle angular motifs — avoid sci-fi HUD overload |
| Replace Zap | Nav, footer, favicon, OG defaults use the official mark + wordmark |

## Opportunities for improvement

| Area | Incumbent issue | Opportunity |
|---|---|---|
| Brand signal | Zap placeholder; brand is nav-sized | Hero-level **official logo**; first viewport recognizable without nav chrome |
| Typography | System UI only; gradient-clipped H1s | Logo-harmonized sharp serif display + readable sans body; hierarchy via type, not gradient fill on every title |
| Color | Blue/cyan glow everywhere | Logo owns the full blue→cyan ramp; UI uses deep neutrals + sparse signal accents from the same hues |
| Hero | Particles + badge + dual CTA + pillar chips | One composition: brand, one headline, one support line, one CTA group, one dominant visual plane |
| Cards | Default card grid for About/Services/Industries | Prefer editorial sections; cards only where interaction needs a container |
| Motion | Per-section fade-up + hover scale noise | 2–3 intentional motions (hero presence, CTA/focus feedback, one scroll reveal) |
| Proof | Unverified “Featured Projects” read as real | Demote/remove until real work exists; prepare Reviews slot for approved Fiverr entries |
| Tokens | No CSS variables / theme.extend | Introduce a real token layer when implementing the approved world |
| Admin | Same dark cyan vocabulary | Keep **code-first** and quieter Operate mode — share tokens, not marketing theatrics |
| Anti-patterns to reject | AI-purple kits, cream+terracotta, broadsheet, acid-green-on-black cliché, emoji iconography | Stay premium AI-tech without category defaults |

**Skill note:** `ui-ux-pro-max` suggested an “AI-Native” purple (`#7C3AED`) system for this query — treat that palette as an **anti-reference**. Purple-on-lavender “AI product” kits fight PRODUCT.md’s “not a generic agency / not template AI” brief.

---

## Proposed visual directions (pick one)

All three keep: dark-forward premium tech, honest content, Persuade mode on marketing, Operate restraint on `/admin`.

### Option A — **Signal Atelier** (recommended — logo-aligned)

**Concept:** AorySoft as a precision AI engineering studio. The site feels like a high-end product launch for systems that ship — true black / deep graphite stage for the official **A** mark, rare electric blue–cyan signal drawn from the logo, sharp serif authority in headlines, imagery of interfaces/workflows (not stock “people with laptops”).

- **Palette sketch:** True black / near-black graphite (`#000000`–`#121820`), white / cool mist text, accents sampled from the logo gradient (royal blue → electric cyan) used ≤~10% of UI surface — **not** purple; full logo gradient reserved for the mark (and rare hero moments)
- **Type sketch:** High-contrast sharp serif for display/headings (harmonize with logo wordmark) + highly readable sans for body/UI
- **Shape sketch:** Precise geometry echoing the A-mark angles; restrained radii; avoid pill-default chrome
- **Layout:** Full-bleed atmospheric hero with logo as hero-level brand; left-weighted editorial bands for services; sparse proof areas
- **Motion:** Soft hero light-field drift; CTA state; one staggered service reveal
- **References (feel, not clone):** Linear / Vercel-grade product marketing restraint; Stripe-level typographic confidence; Anthropic/OpenAI marketing calm — filtered through AorySoft’s logo + “build + automate” catalog
- **Why it fits:** Matches the logo’s black + blue/cyan + premium serif DNA without neon template noise; scales to healthcare and enterprise audiences without looking playful

### Option B — **Orbital Systems**

**Concept:** Infrastructure and agents as an orbital map — structured grids, thin luminous rules, HUD-lite data accents used sparingly.

- Cooler blue-steel neutrals, hairline geometry, monospace only for micro-labels (not body)
- Stronger “systems” metaphor; risk: can tip into sci-fi FUI if overdone
- Better if you want more overt “AI ops / automation” theater

### Option C — **Lumen Works**

**Concept:** Soft luminous fields on deep slate — warmer, more human “atelier” for a broad services company.

- Aurora/mesh light as atmosphere; slightly softer radii; more photography-friendly
- Risk: closer to common dark SaaS if accent and type aren’t sharp
- Better if you want approachable SMB warmth over razor product-lab energy

---

## Recommended design concept (if Option A)

**Creative North Star:** “Signal Atelier”

**One-sentence thesis:** AorySoft’s public site should feel like walking into a premium AI product studio — dark, precise, and signal-bright only where action matters — so visitors trust engineering depth and request a quote without being sold by fake metrics or neon chrome.

**First-viewport composition (Persuade):**
1. Official logo (mark + wordmark) as hero-level brand signal — not a tiny nav-only treatment  
2. One headline (tagline candidate below)  
3. One supporting sentence (capabilities → outcomes)  
4. Primary CTA: Get a Quote · Secondary: Contact or selected work (only if real)  
5. Dominant full-bleed visual plane (abstract signal field relating to the A-mark / real product UI still — no inset card collage; no Zap)

**Section jobs (home, draft):**
1. Hero — brand + promise + CTA  
2. Capabilities — curated service groups (not 15 equal cards)  
3. How we build — engineering + AI + automation mechanism  
4. Selected work — real only; empty/honest state until ready  
5. Reviews — published, approved entries only (after Reviews admin ships)  
6. Industries — light, non-fabricated framing  
7. Final CTA — contact/quote  

**Admin:** same token foundation, denser Operate UI, no marketing particles/glows.

### Tagline candidates (PRODUCT.md notes openness)

Keep current or choose one later (copy decision, not visual):

1. **AI-first solutions, real-world impact.** (current — clear, on-brand)  
2. **Software, AI, and automation that ships.**  
3. **Build smarter systems. Automate what slows you down.**  
4. **Engineering for the AI-era business.**  

Recommend keeping **#1** through redesign unless a stronger line is approved; visual identity should not depend on swapping the tagline.

---

## Content / trust gates before polish

- Hide phone/address until verified  
- Unverified Featured Projects: remove or clearly non-case-study treatment  
- Reviews: ship admin CRUD before featuring social proof  
- Tech list: feature demonstrable stack; demote equal-weight rainbow chips  

## Implementation phases (only after approval)

1. Approve **Option A / B / C** (or hybrid notes)  
2. Comp-first: 1–2 homepage hero comps + one interior (Services or Contact) matching the chosen world  
3. Replace visual world via Impeccable new-work → new `DESIGN.md` (incumbent becomes historical)  
4. Tokenize Tailwind theme + shared primitives  
5. Rebuild public marketing surfaces; keep admin quieter  
6. Parallel product track: Reviews management plan  

## Verification (when implementation is authorized)

- Desktop + mobile first viewport brand test  
- Contrast / focus / `prefers-reduced-motion`  
- No fabricated proof in UI  
- Quote + contact paths remain obvious  
- Comp fidelity check against approved images (buildPath `comp`)

## Risks

| Risk | Mitigation |
|---|---|
| Redesign before real portfolio/reviews | Honest empty states; don’t invent fillers |
| Over-decorating “AI” | Cap accent usage; kill particle spam |
| Admin distraction | Code-first Operate; shared tokens only |
| Scope creep into Reviews + full IA rewrite | Separate plans; this brief is visual world + marketing surfaces |

## Decision asked of you

1. **Approve Option A (Signal Atelier), B, C, or request adjustments**  
2. Confirm tagline keep vs replace (optional now)  
3. After direction approval: authorize **comp generation** (still no site code until comps approved)
