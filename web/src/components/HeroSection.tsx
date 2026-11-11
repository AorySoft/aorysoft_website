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

      {/* Height follows the viewport but is capped, so tall screens get no empty band under the hero. */}
      <div className="shell relative grid grid-cols-[minmax(0,1fr)] items-center gap-y-8 pb-14 pt-8 md:pb-20 md:pt-14 lg:min-h-[min(calc(100svh-4rem),46rem)] lg:grid-cols-12 lg:gap-x-8 lg:py-12">
        <div className="lg:col-span-6">
          <h1
            id="hero-title"
            className="text-balance font-display text-[clamp(2.625rem,7.4vw,5.75rem)] leading-[1.02] tracking-[-0.025em] text-ink"
          >
            AI-first solutions,{" "}
            <em className={`${styles.phrase} italic sm:whitespace-nowrap`}>real-world impact</em>
          </h1>

          <p className="mt-6 max-w-[34rem] text-pretty text-lg leading-relaxed text-ink-muted md:mt-8 md:text-xl">
            We build websites, apps, AI systems, and automation that help teams
            get work done. Clear scope, practical delivery, and systems you can
            keep running.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-11">
            <Link href="/quote" className={`${styles.cta} btn-primary sm:min-w-[10.5rem]`}>
              <span>Get a Quote</span>
              <ArrowRight size={16} aria-hidden="true" className={styles.arrow} />
            </Link>
            <Link href="/contact" className="btn-secondary sm:min-w-[10.5rem]">
              Contact us
            </Link>
          </div>
        </div>

        <div className="relative -mx-4 sm:mx-0 lg:col-span-6 lg:-mr-6 xl:-mr-10">
          <div className={`${styles.sheen} pointer-events-none absolute inset-[6%] -z-10`} aria-hidden="true" />
          <HeroSculpture nodeHrefs={nodeHrefs} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
