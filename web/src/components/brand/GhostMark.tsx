import { MARK_PATHS, MARK_VIEWBOX } from "@/components/brand/markGeometry";

/**
 * The official A as a faint outline, cropped by its section: the logo field
 * behind the home hero and inner-page heroes. Decorative only.
 */
export default function GhostMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute w-auto text-ink ${className}`}
      viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
