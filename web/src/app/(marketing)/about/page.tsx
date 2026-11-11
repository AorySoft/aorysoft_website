import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProcessLine from "@/components/sections/ProcessLine";
import {
  ABOUT_HEADING,
  ABOUT_HONESTY,
  ABOUT_LEAD,
  ABOUT_PILLARS,
} from "@/lib/about-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "How AorySoft builds: engineering, AI, and automation with a clear process — software first, AI where it earns its place.",
  alternates: { canonical: "/about" },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Copy is shared with /about.md (src/lib/about-content.ts) so they never drift.
const pillars = ABOUT_PILLARS;

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "About AorySoft",
        url: `${siteUrl}/about`,
        description:
          "How AorySoft builds digital products, AI features, and automation.",
        isPartOf: { "@type": "WebSite", name: "AorySoft", url: siteUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "About",
            item: `${siteUrl}/about`,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="section-y border-b border-line bg-surface">
        <div className="shell max-w-3xl">
          <h1 className="display-title">{ABOUT_HEADING}</h1>
          <p className="body-lead mt-5">{ABOUT_LEAD}</p>
          <p className="mt-4 max-w-measure text-base leading-relaxed text-ink-subtle">
            {ABOUT_HONESTY}
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="shell">
          <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
            {pillars.map((pillar) => (
              <li key={pillar.title} className="border-t border-line pt-6">
                <h2 className="font-display text-2xl text-ink">{pillar.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">
                  {pillar.description}
                </p>
              </li>
            ))}
          </ul>

          <ProcessLine />

          <div className="mt-16 flex flex-col gap-3 border-t border-line pt-10 sm:flex-row">
            <Link href="/services" className="btn-primary">
              Explore services
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/quote" className="btn-secondary">
              Get a Quote
            </Link>
            <Link
              href="/#technologies"
              className="btn-secondary sm:ml-0"
            >
              Technology we use
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
