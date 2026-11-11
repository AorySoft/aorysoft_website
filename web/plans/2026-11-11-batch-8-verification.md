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
