import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import CapabilityVignette from "@/components/capabilities/CapabilityVignettes";
import stageStyles from "@/components/capabilities/capabilities.module.css";
import { vignetteFor } from "@/components/capabilities/serviceModel";
import ExampleFrame from "@/components/patterns/ExampleFrame";
import PageEndCta from "@/components/patterns/PageEndCta";
import PageHero from "@/components/patterns/PageHero";
import SectionHeader from "@/components/patterns/SectionHeader";
import ServiceRow from "@/components/patterns/ServiceRow";
import StackRows from "@/components/patterns/StackRows";
import StepRoute from "@/components/patterns/StepRoute";
import { getPublishedServiceBySlug, getPublishedServiceDetails } from "@/lib/data";
import { jsonLdScript, serviceJsonLd } from "@/lib/seo/service-jsonld";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const updatedFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export async function generateStaticParams() {
  const services = await getPublishedServiceDetails();
  return (services ?? []).filter((service) => service.slug).map((service) => ({ slug: service.slug as string }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  if (!service) return { title: "Service not found", robots: { index: false, follow: false } };

  const title = service.seo_title || service.title;
  const description = service.seo_description || service.subtitle || service.description || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title, description, url: `/services/${service.slug}` },
  };
}

/**
 * One template for every service, driven only by CMS fields: the icon picks
 * the labeled illustrative example; deliverables, process steps, technologies,
 * and FAQs render as shared patterns and are skipped when empty.
 */
export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, all] = await Promise.all([getPublishedServiceBySlug(slug), getPublishedServiceDetails()]);
  if (!service || !service.slug) notFound();

  const others = (all ?? []).filter((item) => item.slug && item.id !== service.id).slice(0, 3);

  return (
    <main className="bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(serviceJsonLd({ ...service, slug: service.slug }, siteUrl)) }}
      />

      <PageHero eyebrow="Service" title={service.title} lead={service.subtitle} back={{ href: "/services", label: "All services" }}>
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

      <section aria-labelledby="overview-title" className="section-y">
        <div className="shell grid gap-[clamp(2rem,5svh,3rem)] lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeader id="overview-title" eyebrow="Overview" title="What it is" />
            {service.description ? (
              <p className="mt-[clamp(0.75rem,2.5svh,1.25rem)] whitespace-pre-line text-base leading-relaxed text-ink-muted md:text-lg">
                {service.description}
              </p>
            ) : null}
            <p className="mt-6 text-sm text-ink-muted">
              Last updated <time dateTime={service.updated_at}>{updatedFormat.format(new Date(service.updated_at))}</time>
            </p>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <ExampleFrame frameClassName={stageStyles.stage}>
              <CapabilityVignette kind={vignetteFor(service.icon ?? "")} />
            </ExampleFrame>
          </div>
        </div>
      </section>

      {service.deliverables.length > 0 ? (
        <section aria-labelledby="deliverables-title" className="section-y border-t border-line bg-surface">
          <div className="shell">
            <SectionHeader split id="deliverables-title" eyebrow="Scope" title="What you get" />
            <ul className="mt-[clamp(1.5rem,5svh,3rem)] grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
              {service.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-3 border-b border-line py-[clamp(0.75rem,2svh,1rem)] text-base text-ink">
                  <span className="mt-2.5 h-1 w-1 shrink-0 bg-signal" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {service.process_steps.length > 0 ? (
        <section aria-labelledby="process-title" className="section-y border-t border-line">
          <div className="shell">
            <SectionHeader split id="process-title" eyebrow="Process" title="How we deliver" />
            <StepRoute steps={service.process_steps} className="mt-[clamp(1.75rem,6svh,4rem)]" />
          </div>
        </section>
      ) : null}

      {service.technologies.length > 0 ? (
        <section aria-labelledby="tech-title" className="section-y border-t border-line bg-surface">
          <div className="shell">
            <SectionHeader split id="tech-title" eyebrow="Stack" title="Technology" lead="Tools we typically use for this service. The stack can shift per project." />
            <StackRows layers={[{ name: "Core tools", tools: service.technologies }]} className="mt-[clamp(1.5rem,5svh,3rem)]" />
          </div>
        </section>
      ) : null}

      {service.faqs.length > 0 ? (
        <section aria-labelledby="faq-title" className="section-y border-t border-line">
          <div className="shell">
            <SectionHeader split id="faq-title" eyebrow="FAQ" title="Questions" />
            <dl className="mt-[clamp(1.5rem,5svh,3rem)] grid border-t border-line md:grid-cols-2 md:gap-x-10">
              {service.faqs.map((faq) => (
                <div key={faq.question} className="border-b border-line py-[clamp(1rem,3svh,1.5rem)]">
                  <dt className="font-display text-xl text-ink">{faq.question}</dt>
                  <dd className="mt-2 text-base leading-relaxed text-ink-muted">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section aria-labelledby="other-services-title" className="section-y border-t border-line bg-surface">
          <div className="shell">
            <SectionHeader split id="other-services-title" eyebrow="More" title="Other services" />
            <div className="mt-[clamp(1rem,3svh,2rem)] border-t border-line">
              {others.map((item) => (
                <ServiceRow
                  key={item.id}
                  headingLevel={3}
                  title={item.title}
                  subtitle={item.subtitle}
                  iconKey={item.icon}
                  href={`/services/${item.slug}`}
                  linkLabel={`View ${item.title}`}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <PageEndCta title={`Talk to us about ${service.title}`} />
    </main>
  );
}
