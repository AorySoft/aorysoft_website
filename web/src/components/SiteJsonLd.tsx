import {
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_LOGO_PATH,
  SITE_NAME,
  absoluteUrl,
  sameAsUrls,
} from "@/lib/site";

/** Sitewide Organization + WebSite JSON-LD (Batch 6 / F07). */
export default function SiteJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${absoluteUrl("/")}/#organization`,
        name: SITE_NAME,
        url: absoluteUrl("/"),
        email: SITE_EMAIL,
        description: SITE_DESCRIPTION,
        logo: absoluteUrl(SITE_LOGO_PATH),
        sameAs: sameAsUrls(),
        contactPoint: {
          "@type": "ContactPoint",
          email: SITE_EMAIL,
          contactType: "customer support",
          url: absoluteUrl("/contact"),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}/#website`,
        name: SITE_NAME,
        url: absoluteUrl("/"),
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${absoluteUrl("/")}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
