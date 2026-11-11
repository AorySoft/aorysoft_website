import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/patterns/SectionHeader";
import StepRoute from "@/components/patterns/StepRoute";
import { ABOUT_LEAD, PROCESS_STEPS } from "@/lib/about-content";

/**
 * Home summary of how we work: the shared About lead and the five delivery
 * steps on a signal rail, linking to /about for the full story.
 */
export default function HowWeWorkSection() {
  return (
    <section
      id="about"
      aria-labelledby="how-we-work-title"
      className="section-y scroll-mt-16 border-t border-line bg-surface"
    >
      <div className="shell">
        <SectionHeader id="how-we-work-title" eyebrow="How we work" title="How a project runs" lead={ABOUT_LEAD}>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-2 text-sm text-signal transition-colors hover:text-ink"
          >
            About AorySoft
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </SectionHeader>
        <StepRoute steps={PROCESS_STEPS} className="mt-14 md:mt-16" />
      </div>
    </section>
  );
}
