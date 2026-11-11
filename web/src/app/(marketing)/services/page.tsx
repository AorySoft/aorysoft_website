import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EmptyState from "@/components/patterns/EmptyState";
import PageEndCta from "@/components/patterns/PageEndCta";
import PageHero from "@/components/patterns/PageHero";
import ServiceRow from "@/components/patterns/ServiceRow";
import { getActiveServices } from "@/lib/data";
import { jsonLdScript } from "@/lib/seo/service-jsonld";
import { isServiceDetailPublished } from "@/lib/services-publish";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI chatbots, agents, automation, and web development from AorySoft — practical systems for teams that need software that ships.",
  alternates: { canonical: "/services" },
};

const excerpt = (text: string | null) =>
  text && text.length > 220 ? `${text.slice(0, 220).trim()}…` : text;

export default async function ServicesIndexPage() {
  const services = (await getActiveServices()) ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Services",
    url: absoluteUrl("/services"),
    description: metadata.description,
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <PageHero
        eyebrow="Services"
        title="What we build"
        lead="Websites, apps, AI systems, and automation. Open a service for the detail, or tell us what you need and we will help shape the first version."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/quote" className="btn-primary">
            Get a Quote
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/contact" className="btn-secondary">
            Contact us
          </Link>
        </div>
      </PageHero>

      <section aria-label="All services" className="section-y">
        <div className="shell">
          {services.length === 0 ? (
            <EmptyState
              title="No services listed yet"
              action={
                <Link href="/quote" className="btn-primary">
                  Get a Quote
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              }
            >
              Reach out and we will map the right scope with you.
            </EmptyState>
          ) : (
            <div className="border-t border-line">
              {services.map((service) => {
                const href = isServiceDetailPublished(service) && service.slug ? `/services/${service.slug}` : null;
                const highlights = service.deliverables.length > 0 ? service.deliverables : (service.features as string[]);
                return (
                  <ServiceRow
                    key={service.id}
                    title={service.title}
                    subtitle={service.subtitle}
                    description={excerpt(service.description)}
                    iconKey={service.icon}
                    highlights={Array.isArray(highlights) ? highlights.map(String) : []}
                    href={href ?? "/quote"}
                    linkLabel={href ? `View ${service.title}` : "Ask about this"}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      <PageEndCta
        title="Not sure which service fits?"
        text="Describe the problem; we will suggest the smallest useful first version."
        secondary={{ href: "/about", label: "How we work" }}
      />
    </main>
  );
}
