import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveServices } from "@/lib/data";
import { isServiceDetailPublished } from "@/lib/services-publish";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI chatbots, agents, automation, and web development from AorySoft — practical systems for teams that need software that ships.",
  alternates: { canonical: "/services" },
};

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
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="section-y border-b border-line bg-surface">
        <div className="shell max-w-3xl">
          <h1 className="display-title">Services</h1>
          <p className="body-lead mt-5">
            Product engineering, AI, and automation. Open a service for detail
            when published, or tell us what you need and we will help shape the
            first version.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/quote" className="btn-primary">
              Get a Quote
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="shell">
          {services.length === 0 ? (
            <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
              No active services are listed yet. Reach out and we will map the
              right scope with you.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {services.map((service) => {
                const detail = isServiceDetailPublished(service);
                return (
                  <li
                    key={service.id}
                    className="border border-line bg-surface-raised/40 p-6 md:p-8"
                  >
                    <h2 className="font-display text-2xl text-ink md:text-3xl">
                      {detail && service.slug ? (
                        <Link
                          href={`/services/${service.slug}`}
                          className="transition-colors hover:text-signal"
                        >
                          {service.title}
                        </Link>
                      ) : (
                        service.title
                      )}
                    </h2>
                    {service.subtitle ? (
                      <p className="mt-2 text-sm text-ink-subtle">
                        {service.subtitle}
                      </p>
                    ) : null}
                    {service.description ? (
                      <p className="mt-4 text-base leading-relaxed text-ink-muted">
                        {service.description.length > 220
                          ? `${service.description.slice(0, 220).trim()}…`
                          : service.description}
                      </p>
                    ) : null}
                    {detail && service.slug ? (
                      <Link
                        href={`/services/${service.slug}`}
                        className="mt-6 inline-flex items-center gap-2 text-sm text-signal transition-colors hover:text-ink"
                      >
                        View service
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    ) : (
                      <Link
                        href="/quote"
                        className="mt-6 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-signal"
                      >
                        Ask about this
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
