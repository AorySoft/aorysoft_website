/**
 * Geometry of the official AorySoft "A" mark, traced from
 * `brand/aorysoft-logo.jpg` (see `brand/aorysoft-mark.svg`).
 * Coordinates live in a 42.4 × 39.2 box; the base of both strokes sits on y = 38.6.
 */
export const MARK_VIEWBOX = { width: 42.4, height: 39.2 } as const;

export const MARK_PATHS = [
  // Left stroke: slanted parallelogram.
  "M18 0.6H27.3L10.6 38.6H0.6Z",
  // Right stroke: rises to a peak and returns as the crossbar foot.
  "M27.2 10.6L41.8 38.6H15.9L19.6 29.6H27.8L24.3 22.5V17Z",
] as const;

/** Vertical fill sampled from the logo: light blue → deep blue → cyan base. */
export const MARK_STOPS = [
  { offset: 0, color: "#3A9CD8" },
  { offset: 0.42, color: "#3070C6" },
  { offset: 0.7, color: "#358BCD" },
  { offset: 1, color: "#06D6EA" },
] as const;
