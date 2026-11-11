import type { ReactNode } from "react";
import styles from "./patterns.module.css";

/** Small label above a title, marked with a signal node. */
export default function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted ${className}`}
    >
      <span className={styles.eyebrowNode} aria-hidden="true" />
      {children}
    </p>
  );
}
