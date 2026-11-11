import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProcessLine from "@/components/sections/ProcessLine";

export const metadata: Metadata = {
  title: "About",
  description:
    "How AorySoft builds: engineering, AI, and automation with a clear process — software first, AI where it earns its place.",
  alternates: { canonical: "/about" },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const pillars = [
  {
    title: "Engineering",
    description:
      "Websites, apps, and platforms that are clear to use and easier to maintain over time.",
  },
  {
    title: "AI",
    description:
      "Chatbots, voice agents, and custom AI wired into the work your team already does. Not demos for demos' sake.",
  },
  {
    title: "Automation",
    description:
      "Workflows and integrations that cut repetitive work so people can spend time on the decisions that matter.",
  },
];

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
          <h1 className="display-title">How we build</h1>
          <p className="body-lead mt-5">
            We help teams ship digital products, AI features, and automation
            that hold up in day-to-day use. Software first, AI where it earns
            its place, and a process you can follow without guesswork.
          </p>
          <p className="mt-4 max-w-measure text-base leading-relaxed text-ink-subtle">
            We care about honest delivery: clear communication, realistic
            timelines, and work we are willing to stand behind.
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
