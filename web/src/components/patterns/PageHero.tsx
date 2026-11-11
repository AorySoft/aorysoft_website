import type { ReactNode } from "react";
import GhostMark from "@/components/brand/GhostMark";
import Eyebrow from "./Eyebrow";
import styles from "./patterns.module.css";

/**
 * Shared inner-page hero: left-aligned at the shell edge, eyebrow + display h1
 * + lead, with the logo field (faint A outline and signal glow) behind it so
 * the brand reads on every page, not only the home first viewport.
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Actions or extra content under the lead. */
  children?: ReactNode;
  /** Shorter padding for long-form pages (legal). */
  compact?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-surface">
      <GhostMark className="-right-24 -top-16 h-[30rem] opacity-[0.04] md:-right-10 md:h-[34rem]" />
      <div className={`${styles.heroField} pointer-events-none absolute inset-0 -z-10`} aria-hidden="true" />
      <div className={`shell relative ${compact ? "py-14 md:py-20" : "py-16 md:py-24"}`}>
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="display-title mt-5">{title}</h1>
          {lead ? <div className="body-lead mt-5">{lead}</div> : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
