import type { CSSProperties } from "react";
import styles from "./patterns.module.css";

export type RouteStep = { title: string; text?: string };

/**
 * Steps on a signal rail (vertical on small screens, horizontal from md) with
 * a light pulse travelling through them: how a workflow, agent, or project
 * runs. Pure CSS and an ordered list, so every step is in the server HTML and
 * the pulse stops under reduced motion.
 */
export default function StepRoute({
  steps,
  headingLevel = 3,
  className = "",
}: {
  steps: readonly RouteStep[];
  headingLevel?: 3 | 4;
  className?: string;
}) {
  if (steps.length === 0) return null;
  const Heading = headingLevel === 3 ? "h3" : "h4";
  return (
    <ol
      className={`${styles.route} ${className}`}
      style={{ "--steps": Math.min(steps.length, 6) } as CSSProperties}
    >
      <span className={styles.rail} aria-hidden="true" />
      {steps.map((step, index) => (
        <li key={`${index}-${step.title}`} className="relative">
          <span className={styles.node} aria-hidden="true" />
          <span className="block text-xs font-medium tabular-nums text-ink-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Heading className="mt-1 font-display text-2xl text-ink">{step.title}</Heading>
          {step.text ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p> : null}
        </li>
      ))}
    </ol>
  );
}
