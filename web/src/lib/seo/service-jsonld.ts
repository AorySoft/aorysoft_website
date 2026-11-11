import type { ServiceRow } from "@/lib/types";

/** Service + BreadcrumbList (+ FAQPage when FAQs exist) for a service detail page. */
export function serviceJsonLd(service: ServiceRow & { slug: string }, siteUrl: string) {
  const canonical = `${siteUrl}/services/${service.slug}`;
  const description = service.seo_description || service.subtitle || service.description || undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title,
        description,
        url: canonical,
        dateModified: service.updated_at,
        provider: { "@type": "Organization", name: "AorySoft", url: siteUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` },
          { "@type": "ListItem", position: 3, name: service.title, item: canonical },
        ],
      },
      ...(service.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: service.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
          ]
        : []),
    ],
  };
}

/** JSON-LD as a string safe to inline in a <script> (no closing-tag injection). */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
