import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServiceRow } from "@/lib/types";
import GhostMark from "@/components/brand/GhostMark";
import { serviceHrefFor } from "@/components/capabilities/serviceModel";
import HeroSculpture from "@/components/hero/HeroSculpture";
import { HERO_NODES } from "@/components/hero/nodes";
import styles from "@/components/hero/HeroSection.module.css";

const HeroSection = ({ services }: { services?: ServiceRow[] | null }) => {
  // Each node opens its published service page when one exists, else the capability tab.
  const nodeHrefs = HERO_NODES.map((node) => serviceHrefFor(services, node.keys));

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* Ghosted A cropped at the lower-left, echoing the logo field. */}
      <GhostMark className="-bottom-40 -left-48 h-[46rem] opacity-[0.045] md:-left-24" />
      <div className={`${styles.field} pointer-events-none absolute inset-0 -z-10`} aria-hidden="true" />

      {/* Sized to the visible viewport (styles.layout): nav + hero fit the first screen on laptops. */}
      <div className={`shell relative ${styles.layout}`}>
        <div className={styles.copy}>
          <h1
            id="hero-title"
            className={`${styles.title} text-balance font-display leading-[1.02] tracking-[-0.025em] text-ink`}
          >
            AI-first solutions,{" "}
            <em className={`${styles.phrase} italic sm:whitespace-nowrap`}>real-world impact</em>
          </h1>

          <p className={`${styles.lead} max-w-[34rem] text-pretty leading-relaxed text-ink-muted`}>
            We build websites, apps, AI systems, and automation that help teams
            get work done. Clear scope, practical delivery, and systems you can
            keep running.
          </p>

          <div className={`${styles.actions} grid grid-cols-2 gap-3 sm:flex sm:gap-4`}>
            <Link href="/quote" className={`${styles.cta} btn-primary sm:min-w-[10.5rem]`}>
              <span>Get a Quote</span>
              <ArrowRight size={16} aria-hidden="true" className={styles.arrow} />
            </Link>
            <Link href="/contact" className="btn-secondary sm:min-w-[10.5rem]">
              Contact us
            </Link>
          </div>
        </div>

        <div className={`${styles.art} relative`}>
          <div className={`${styles.sheen} pointer-events-none absolute inset-[6%] -z-10`} aria-hidden="true" />
          <HeroSculpture nodeHrefs={nodeHrefs} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
