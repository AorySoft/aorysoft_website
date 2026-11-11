import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageEndCta from "@/components/patterns/PageEndCta";
import PageHero from "@/components/patterns/PageHero";
import SectionHeader from "@/components/patterns/SectionHeader";
import ProcessLine, { PROCESS_TITLE } from "@/components/sections/ProcessLine";
import TechnologiesSection from "@/components/TechnologiesSection";
import { ABOUT_HEADING, ABOUT_HONESTY, ABOUT_LEAD, ABOUT_PILLARS } from "@/lib/about-content";
import { jsonLdScript } from "@/lib/seo/service-jsonld";

export const metadata: Metadata = {
  title: "About",
  description:
    "How AorySoft builds: engineering, AI, and automation with a clear process — software first, AI where it earns its place.",
  alternates: { canonical: "/about" },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Copy is shared with /about.md (src/lib/about-content.ts) so they never drift.
export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "About AorySoft",
        url: `${siteUrl}/about`,
        description: "How AorySoft builds digital products, AI features, and automation.",
        isPartOf: { "@type": "WebSite", name: "AorySoft", url: siteUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "About", item: `${siteUrl}/about` },
        ],
      },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <PageHero eyebrow="About AorySoft" title={ABOUT_HEADING} lead={ABOUT_LEAD}>
        <p className="max-w-measure text-base leading-relaxed text-ink-muted">{ABOUT_HONESTY}</p>
      </PageHero>

      <section aria-labelledby="disciplines-title" className="section-y">
        <div className="shell">
          <SectionHeader split id="disciplines-title" eyebrow="What we do" title="Three disciplines, one team" />
          <ul className="mt-[clamp(1.5rem,5svh,3rem)] grid gap-[clamp(1.5rem,4svh,2.5rem)] md:grid-cols-3 md:gap-8">
            {ABOUT_PILLARS.map((pillar) => (
              <li key={pillar.title} className="border-t border-line pt-[clamp(1rem,3svh,1.5rem)]">
                <h3 className="font-display text-2xl text-ink">{pillar.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">{pillar.description}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/services"
            className="mt-[clamp(1.5rem,4svh,2.5rem)] inline-flex items-center gap-2 text-sm text-signal transition-colors hover:text-ink"
          >
            Explore services
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="process-title" className="section-y border-t border-line bg-surface">
        <div className="shell">
          <SectionHeader split id="process-title" eyebrow="Process" title={PROCESS_TITLE} />
          <ProcessLine showTitle={false} headingLevel={3} className="mt-[clamp(1.75rem,6svh,4rem)]" />
        </div>
      </section>

      <TechnologiesSection />

      <PageEndCta secondary={{ href: "/services", label: "Explore services" }} />
    </main>
  );
}
