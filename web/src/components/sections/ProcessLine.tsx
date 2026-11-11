import StepRoute from "@/components/patterns/StepRoute";
import { PROCESS_STEPS } from "@/lib/about-content";

// Shared with /about.md (via about-content) so the HTML and markdown twin never drift.
export const PROCESS_TITLE = "How a project runs";

/**
 * The five delivery steps on a signal rail. CSS only (StepRoute); this used to
 * be a Framer scroll-fill, which shipped ~45 KB gzip of client JS to /about.
 */
export default function ProcessLine({
  showTitle = true,
  className = "mt-20 md:mt-24",
  headingLevel = 4,
}: {
  showTitle?: boolean;
  className?: string;
  headingLevel?: 3 | 4;
}) {
  return (
    <div className={className}>
      {showTitle ? <h3 className="font-display text-2xl text-ink md:text-3xl">{PROCESS_TITLE}</h3> : null}
      <StepRoute steps={PROCESS_STEPS} headingLevel={headingLevel} className={showTitle ? "mt-10" : ""} />
    </div>
  );
}
