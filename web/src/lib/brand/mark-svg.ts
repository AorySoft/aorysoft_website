// The official AorySoft "A" as a standalone SVG string, for places that cannot
// render the React <AoryMark>: plain-HTML token pages and the OG image.
// Geometry and colours come from markGeometry (traced from brand/aorysoft-mark.svg).
import { MARK_PATHS, MARK_STOPS, MARK_VIEWBOX } from "@/components/brand/markGeometry";

export function markSvg({
  width,
  title,
  gradientId = "aory-mark",
}: {
  width: number;
  /** Accessible name; omit when the mark sits next to the wordmark (decorative). */
  title?: string;
  gradientId?: string;
}): string {
  const height = Math.round((width * MARK_VIEWBOX.height) / MARK_VIEWBOX.width);
  const a11y = title ? `role="img"><title>${title}</title>` : `aria-hidden="true">`;
  const stops = MARK_STOPS.map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join("");
  const paths = MARK_PATHS.map((d) => `<path d="${d}" fill="url(#${gradientId})"/>`).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}" fill="none" focusable="false" ${a11y}` +
    `<defs><linearGradient id="${gradientId}" x1="0" y1="0.6" x2="0" y2="38.6" gradientUnits="userSpaceOnUse">${stops}</linearGradient></defs>` +
    `${paths}</svg>`
  );
}

/** `data:` URI of the mark, for <img> inside next/og ImageResponse. */
export function markDataUri(width: number): string {
  return `data:image/svg+xml;base64,${Buffer.from(markSvg({ width })).toString("base64")}`;
}
