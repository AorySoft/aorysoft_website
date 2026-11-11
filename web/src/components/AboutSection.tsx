import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Home teaser for About. Full copy lives on /about.
 */
const AboutSection = () => {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="section-y scroll-mt-16 border-t border-line bg-surface"
    >
      <div className="shell max-w-3xl">
        <h2 id="about-title" className="display-title">
          How we build
        </h2>
        <p className="body-lead mt-5">
          We help teams ship digital products, AI features, and automation that
          hold up in day-to-day use — with a process you can follow without
          guesswork.
        </p>
        <Link
          href="/about"
          className="mt-8 inline-flex items-center gap-2 text-sm text-signal transition-colors hover:text-ink"
        >
          About AorySoft
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};

export default AboutSection;
