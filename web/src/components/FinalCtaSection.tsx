import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MARK_PATHS } from "@/components/brand/markGeometry";

/**
 * Closing call to action. Also carries the honest "selected work" note (and
 * the #work anchor) until real case studies are cleared for publication.
 */
const FinalCtaSection = () => {
  return (
    <section
      id="work"
      aria-labelledby="final-cta-title"
      className="relative isolate scroll-mt-16 overflow-hidden border-t border-line"
    >
      <svg
        className="pointer-events-none absolute -right-24 top-1/2 -z-10 h-[150%] w-auto -translate-y-1/2 text-signal opacity-[0.07] md:right-0"
        viewBox="0 0 42.4 39.2"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {MARK_PATHS.map((d) => (
          <path key={d} d={d} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_55%_70%_at_80%_50%,rgb(var(--color-signal-deep)/0.14),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="shell py-24 md:py-36">
        <h2
          id="final-cta-title"
          className="max-w-4xl text-balance font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.02] tracking-[-0.025em] text-ink"
        >
          Ready to talk about <em className="italic">your project?</em>
        </h2>
        <p className="body-lead mt-6">
          Tell us what you are trying to build and any constraints you already
          know. We reply through{" "}
          <a
            href="mailto:info@aorysoft.com"
            className="text-ink underline decoration-signal underline-offset-4 hover:text-signal"
          >
            info@aorysoft.com
          </a>{" "}
          and help you figure out the next step.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link href="/quote" className="btn-primary sm:min-w-[10.5rem]">
            Get a Quote
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/contact" className="btn-secondary sm:min-w-[10.5rem]">
            Contact us
          </Link>
        </div>

        <p className="mt-14 max-w-xl border-t border-line pt-6 text-sm leading-relaxed text-ink-subtle">
          Public case studies will show here once they are cleared for display.
          Until then, we share relevant experience privately when we talk.
        </p>
      </div>
    </section>
  );
};

export default FinalCtaSection;
