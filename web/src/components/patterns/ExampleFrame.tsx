import type { ReactNode } from "react";

/**
 * Honesty frame for illustrative scenes (chat, agent, workflow, insight…).
 * The scene itself stays aria-hidden; the caption is always visible and the
 * screen-reader text spells out that nothing shown is a real client or result.
 */
export default function ExampleFrame({
  children,
  label = "Illustrative example",
  frameClassName = "",
}: {
  children: ReactNode;
  label?: string;
  /** Class for the wrapper directly around the scene (e.g. a stage style). */
  frameClassName?: string;
}) {
  return (
    <figure className="min-w-0">
      <div aria-hidden="true" className={frameClassName}>
        {children}
      </div>
      <figcaption className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
        <span className="h-px w-5 bg-signal" aria-hidden="true" />
        {label}
        <span className="sr-only">: not a real client conversation, system, or result.</span>
      </figcaption>
    </figure>
  );
}
