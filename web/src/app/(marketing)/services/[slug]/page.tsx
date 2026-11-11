import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getPublishedServiceBySlug,
  getPublishedServiceDetails,
} from "@/lib/data";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateStaticParams() {
  const services = await getPublishedServiceDetails();
  return (services ?? [])
    .filter((service) => service.slug)
    .map((service) => ({ slug: service.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  if (!service) {
    return { title: "Service not found", robots: { index: false, follow: false } };
  }

  const title = service.seo_title || service.title;
  const description =
    service.seo_description || service.subtitle || service.description || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title,
      description,
      url: `/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  if (!service || !service.slug) notFound();

  const canonical = `${siteUrl}/services/${service.slug}`;
  const description =
    service.seo_description || service.subtitle || service.description || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title,
        description,
        url: canonical,
        dateModified: service.updated_at,
        provider: {
          "@type": "Organization",
          name: "AorySoft",
          url: siteUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: `${siteUrl}/services`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title,
            item: canonical,
          },
        ],
      },
      ...(service.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: service.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <main className="min-h-screen bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <article className="shell max-w-3xl py-16 md:py-20">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-signal"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All services
        </Link>

        <header className="mt-8 space-y-4">
          <h1 className="display-title text-ink">{service.title}</h1>
          {service.subtitle ? (
            <p className="text-lg text-ink-subtle">{service.subtitle}</p>
          ) : null}
          {service.description ? (
            <p className="body-lead text-ink-muted">{service.description}</p>
          ) : null}
          <p className="text-sm text-ink-subtle">
            Last updated{" "}
            <time dateTime={service.updated_at}>
              {new Date(service.updated_at).toLocaleDateString()}
            </time>
          </p>
        </header>

        {service.deliverables.length > 0 ? (
          <section className="mt-12 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              Deliverables
            </h2>
            <ul className="mt-6 space-y-3">
              {service.deliverables.map((item) => (
                <li
                  key={item}
                  className="border-l border-line pl-4 text-base leading-relaxed text-ink-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {service.process_steps.length > 0 ? (
          <section className="mt-12 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              How we deliver
            </h2>
            <ol className="mt-6 space-y-6">
              {service.process_steps.map((step, index) => (
                <li key={`${step.title}-${index}`}>
                  <h3 className="font-display text-xl text-ink">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-muted">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {service.technologies.length > 0 ? (
          <section className="mt-12 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              Technologies
            </h2>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {service.technologies.map((tech) => (
                <li key={tech} className="font-display text-xl text-ink">
                  {tech}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {service.faqs.length > 0 ? (
          <section className="mt-12 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ink md:text-3xl">FAQs</h2>
            <dl className="mt-6 space-y-6">
              {service.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-medium text-ink">{faq.question}</dt>
                  <dd className="mt-2 text-base leading-relaxed text-ink-muted">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <footer className="mt-14 border-t border-line pt-8">
          <p className="text-base text-ink-muted">
            Ready to talk about this service?
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/quote" className="btn-primary">
              Get a Quote
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/about" className="btn-secondary">
              About AorySoft
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
