import { useId } from "react";
import Link from "next/link";
import { MARK_PATHS, MARK_STOPS, MARK_VIEWBOX } from "@/components/brand/markGeometry";

type BrandMarkProps = {
  href?: string;
  size?: "sm" | "md" | "lg" | "hero";
  showWordmark?: boolean;
  className?: string;
};

const sizes = {
  sm: { mark: 28, word: "text-lg" },
  md: { mark: 36, word: "text-xl" },
  lg: { mark: 48, word: "text-2xl" },
  hero: { mark: 64, word: "text-3xl md:text-4xl" },
} as const;

/**
 * The official AorySoft "A" mark (traced from brand/aorysoft-logo.jpg).
 * Pass a `title` only when the mark stands alone; next to the wordmark it is decorative.
 */
export function AoryMark({ size = 36, className = "", title }: { size?: number; className?: string; title?: string }) {
  // Per-instance id: the nav and footer both render a mark on every page.
  const gradientId = `aory-mark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const height = Math.round((size * MARK_VIEWBOX.height) / MARK_VIEWBOX.width);

  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0.6" x2="0" y2="38.6" gradientUnits="userSpaceOnUse">
          {MARK_STOPS.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} fill={`url(#${gradientId})`} />
      ))}
    </svg>
  );
}

export default function BrandMark({ href = "/", size = "md", showWordmark = true, className = "" }: BrandMarkProps) {
  const dims = sizes[size];
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <AoryMark size={dims.mark} title={showWordmark ? undefined : "AorySoft"} />
      {showWordmark ? (
        <span className={`font-display tracking-tight text-ink ${dims.word}`}>AorySoft</span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex items-center rounded-atelier" aria-label="AorySoft home">
      {content}
    </Link>
  );
}
