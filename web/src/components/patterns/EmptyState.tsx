import type { ReactNode } from "react";
import styles from "./patterns.module.css";

/**
 * Compact, honest "nothing here yet": one sentence and one next action on a
 * short signal rail, instead of a tall empty band.
 */
export default function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative max-w-2xl border-l border-line pl-6 md:pl-8">
      <span className={`${styles.eyebrowNode} absolute -left-[4px] top-2`} aria-hidden="true" />
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <div className="mt-3 text-base leading-relaxed text-ink-muted">{children}</div>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
