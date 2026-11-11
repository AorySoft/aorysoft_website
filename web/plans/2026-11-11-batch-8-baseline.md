# Batch 8 baseline (before any change)

- **Build:** local production build of `a55f551` (`next start`).
- **Measured:** 2026-11-11 with headless Chrome via CDP. Median of 3 runs.
  - Mobile (375): 4× CPU slowdown and a throttled network (150 ms RTT, 1.6 Mbps).
  - Desktop (1280): no throttling.
- These are lab numbers on a local machine and are **not** Lighthouse or PageSpeed. The final baseline gets re-taken on production after deploy (PageSpeed is run by the owner).

## LCP / CLS

| Width | Route | LCP | LCP element | CLS |
|---|---|---|---|---|
| 375 | `/` | 2620 ms | hero lead `<p>` | 0.000 |
| 375 | `/services` | 1736 ms | hero lead `<p>` | 0.000 |
| 375 | `/about` | 2912 ms | hero lead `<p>` | 0.000 |
| 1280 | `/` | 436 ms | h1 `<em>` "real-world impact" | 0.000 |
| 1280 | `/services` | 240 ms | hero lead `<p>` | 0.000 |
| 1280 | `/about` | 272 ms | hero lead `<p>` | 0.000 |

There is no service-page baseline because no service was published when this was measured.

## Client JS per route (gzip, from the build's script tags)

| Route | Scripts | JS gzip |
|---|---|---|
| `/` | 13 | 240.6 KB |
| `/about` | 13 | 233.2 KB |
| `/quote` | 13 | 233.6 KB |
| `/blog` | 12 | 196.3 KB |
| `/contact` | 12 | 189.6 KB |
| `/services`, `/careers`, `/privacy`, `/terms` | 11 | 187.2 KB |
| 404 | 10 | 186.7 KB |

Framer Motion is on `/` (capabilities tab indicator), `/about` (`ProcessLine`) and `/quote` (wizard).

## First viewport

- **375:** nav (logo + menu), h1, lead, 2 CTAs. The sculpture starts at about y = 500, below the fold.
- **1280:** nav, h1, lead, 2 CTAs, plus the sculpture with wordmark and 4 nodes. There's about 300 px of empty black under the hero.

## Known defect at baseline

All four capability panels render at once: Tailwind's `grid` class overrides `[hidden]`.
