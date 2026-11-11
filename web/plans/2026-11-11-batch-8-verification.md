# Batch 8 verification (step 7)

## Setup

- **Build:** local production build of `batch-8-ai-native` (`next start`).
- **Data:** live CMS including the temporary test content.
- **Browser:** headless Chrome via CDP with reduced motion emulated.
- **Zoom:** emulated by CSS viewport ÷ zoom with a matching device-scale factor.
- **Not used:** Lighthouse. The owner runs PageSpeed Insights on production.

## Layout audit: 14 routes × 16 sizes (224 checks)

**Sizes checked:**
- Laptops: 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1440
- Zoom: 150% on 1366×768 and 1920×1080, 200% on 1366×768 and 1920×1080
- Phones and tablets: 375×667, 390×844, 412×915, 768×1024, 1024×768
- Landscape phones: 667×375, 844×390

**Routes checked:** `/`, `/services`, a service page, `/about`, `/blog`, a post, `/careers`, `/contact`, `/quote`, `/privacy`, `/work`, `/reviews`, the 404 page, and a newsletter token page.

**Results:**
- **Horizontal overflow:** none at any size.
- **Home hero fully in the first screen:** yes at every laptop size, at 150% zoom on both laptops, at 200% zoom on 1920×1080, on every portrait phone and tablet, on 1024×768, and on 844×390.
- **Sections:** sections fit one screen at every laptop size, except the cases below.

### Sizes where something is still taller than the screen

| Where | Size(s) | Height vs screen | Why / decision |
|---|---|---|---|
| Home hero | 1366×768 @200%, 667×375 | over by ~95 px | 384 px and 375 px tall, so the layout stacks; usable and scrolls normally. The rule targets laptops. |
| Home · Capabilities | 1366×768, 1024×768, 1920×1080 @150% | 1.11–1.17× | Tabs plus panel with a feature list and example; tightened twice. Content-driven. |
| `/services` list | all laptops | 1.6–2.8× | 8 services (4 real + 4 test) as a list; shrinks with real content. |
| `/careers` · Open roles | 1366×768–1536×864 | 1.12–1.25× | 2 role rows plus the apply note (a list). |
| `/contact` form, `/quote` wizard | 1366×768–1920×1080 | 1.08–1.43× | Forms; allowed to be taller by the rule. |
| Most sections at 150% on 1366×768, 200% and landscape phones | 911×512, 683×384, 960×540, 667×375, 844×390 | 1.1–2.8× | 384–540 px of height; lists and forms cannot fit. Spacing and type already at their minimums. |
| Portrait phones | 375–412 wide | 1.1–2× for capabilities, lists, reviews | Stacked lists on narrow screens; normal mobile scroll. |

## Performance (same-run A/B against the baseline build `a55f551`, same data)

Median of 3 runs per round, 2 rounds. Mobile uses 4× CPU and throttled networking.

| Route | Mobile LCP baseline → Batch 8 | Desktop LCP baseline → Batch 8 |
|---|---|---|
| `/` | ~4.0 s → ~4.3 s | ~500 → ~650 ms |
| `/services` | ~2.7 → ~2.1 s | ~390 → ~340 ms |
| `/about` | ~2.4 → ~2.1 s | ~280 → ~345 ms (noise) |

- **CLS:** 0.000 on every route and run.
- **Home regression:** home LCP is slower: about +150 ms desktop, about +0.3 s on throttled mobile. That is over the plan's +100 ms budget.
  - First paint moves too (FCP = LCP), so it isn't the LCP element.
  - Likely causes are render-blocking CSS or HTML ordering, not JS: home JS dropped 40 KB.
  - Open follow-up: re-check with PageSpeed on production after deploy.

**Client JS (gzip):**

| Route | Before | After |
|---|---|---|
| `/` | 240.6 KB | 200.2 KB |
| `/about` | 233.2 KB | 187.3 KB |
| `/quote` | 233.6 KB | 230.6 KB |
| Other routes | — | ±0.5 KB |

## Other checks

- **Server-rendered content:**
  - all 8 capability panels are in the home HTML
  - FAQ answers, deliverables, the example captions and the FAQPage JSON-LD are in the service page HTML
  - every public route has its h1 in the raw HTML
  - no route ships the loading spinner
- **Dynamic-route `notFound()`:** returns 404, but the body is RSC-only (N7 remainder).
- **Contrast (tokens):**
  - ink: ≥16.6:1
  - muted: ≥8.4:1
  - subtle: ≥4.88:1
  - signal on any surface: ≥7.35:1
  - black on the primary button: 8.65:1
- **Honesty:** a grep found the "insight" example implying real channel data ("Orders by channel · last 8 weeks"). It now uses generic groups and the note "sample shapes · no real data", and a test (`CapabilityVignettes.test.tsx`) fails if any scene shows percentages, money, periods or result words.
- **Reduced motion:** every new loop (StepRoute pulse, tab indicator) has a reduced-motion rule. The audits ran with reduced motion emulated.

## Home LCP regression: investigation (follow-up)

### Method

- **Same minimal data in both builds:** the Supabase URL is pointed at an unreachable `.invalid` host, so every query is empty. No test content and no database access.
- **Builds compared:** pre-Batch-8 `a55f551`, intermediate commits (bisect), and current.
- **Runs:** alternating A/B, 5–7 runs, medians. Mobile 375 px.

### Findings

| Check | Baseline | Batch 8 |
|---|---|---|
| Render-blocking CSS | 2 files, 11.3 KB gz | 2 files, 12.5 KB gz (same order) |
| Font preloads | 3 | 3 (same) |
| HTML | 12.3 KB gz | 13.6 KB gz |
| TTFB, CSS end, font end | — | identical within ±60 ms |
| LCP element (mobile) | hero lead `<p>` | hero lead `<p>` |
| LCP element (desktop) | h1 `<em>` | lead `<p>` (h1 is smaller under the viewport rule) |

- **Network-only throttling:** LCP 1024 → 1028 ms (no regression).
- **Desktop:** 332 → 388 ms (+56 ms, within budget).
- **4× CPU:** about +0.6–1.0 s. All of it is main-thread **Layout before first paint** (traces: about 1.2 s vs about 2.1 s). Scripts, parse and style are equal or lower.

**Ruled out by injection or bisect:** `text-wrap`, container queries, the viewport meta, the new global tokens, animations, and every individual home section.

**Bisect:**
- `8ca502b` (home restructure) ≈ baseline.
- `29d9849` (sizing) ≈ baseline LCP.
- The regression appears with step 6 (`e9132fc`).

**Cause:** moving the root `app/loading.tsx` into admin (Q7).
- With a root Suspense boundary, Next's static HTML paints a small shell first and reveals the content in a second pass.
- Without it, slow CPUs lay out the whole page before the first paint.
- Proof: current code with `loading.tsx` restored gives LCP **2180 ms** vs 3720 ms in the same run.

### Options (not applied; needs a decision because of the no-JS trade-off)

| Option | Mobile 4× CPU LCP (same run) | Trade-off |
|---|---|---|
| A. Invisible `app/(marketing)/loading.tsx` (`return null`) | 2476 ms vs current 3100 (baseline ≈ 2508) | No spinner; h1 stays in the raw HTML. Page content ships in `<div hidden>` revealed by an inline script, so visitors with JS disabled see a blank page (true before Batch 8 too, with a spinner). Dynamic-route 404 body unchanged. |
| B. Restore root `loading.tsx` | 2180 ms | Brings back the spinner in raw HTML (reverts N7/Q7). |
| C. `content-visibility: auto` on below-the-fold sections | about −350 ms | Pure CSS, but not enough alone. Offscreen sizes become estimates (anchor jumps, the layout audit reads estimates). |
| D. Accept | +0.6–1.0 s on slow CPUs only | Network-bound and desktop are within budget. |

**Recommendation:** A, which gives baseline parity with no spinner. Confirm the no-JS trade-off first.

## Capabilities tightening (follow-up)

- **Change:** the example frame is capped at `(--avail-h − 20rem) × 1.6`, and gaps and feature rows are tighter.
- **Result:**
  - 1366×768: 1.12× → fits
  - 1024×768: 1.11× → 1.08×
  - 1280×720 (1920×1080 at 150%): 1.17× → 1.07×

## Option A applied: invisible `app/(marketing)/loading.tsx`

Same method: minimal data in both builds, alternating runs, medians.

| Profile | Pre-Batch-8 (`a55f551`) | Option A | Δ |
|---|---|---|---|
| Mobile, 4× CPU + throttled network (7 runs) | 2672 ms | 2708 ms | **+36 ms** |
| Mobile, network only (7 runs) | 1048 ms | 1080 ms | +32 ms |
| Desktop (5 runs) | 316 ms | 276 ms | −40 ms |

**Raw HTML on the real-data production build:**
- The h1 and main copy are present on `/`, `/services`, `/about` and `/contact`, inside Next's hidden swap container.
- There's no spinner.
- With JavaScript disabled, a visitor would see a blank page. This is the accepted trade-off.
