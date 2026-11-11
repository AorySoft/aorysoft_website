import { getActiveServices, getPublishedServiceDetails } from "@/lib/data";
import { isServiceDetailPublished } from "@/lib/services-publish";
import { absoluteUrl, SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function mdHeaders(canonicalHtml: string): HeadersInit {
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    "X-Robots-Tag": "noindex",
    Link: `<${canonicalHtml}>; rel="canonical"`,
  };
}

/** Plain-text twin of /services for agents that prefer markdown. */
export async function GET() {
  const htmlCanonical = absoluteUrl("/services");
  const details = (await getPublishedServiceDetails()) ?? [];

  // No published (detail-threshold) services → 404 twin, not an empty catalog.
  if (details.length === 0) {
    return new Response("Not found", {
      status: 404,
      headers: mdHeaders(htmlCanonical),
    });
  }

  const active = (await getActiveServices()) ?? [];
  const detailSlugs = new Set(
    details.map((service) => service.slug).filter(Boolean),
  );

  const lines = [
    `# ${SITE_NAME} services`,
    "",
    SITE_DESCRIPTION,
    "",
    `HTML index: ${htmlCanonical}`,
    `Contact: ${SITE_EMAIL}`,
    "",
  ];

  for (const service of active) {
    lines.push(`## ${service.title}`);
    if (service.subtitle) lines.push(service.subtitle);
    if (service.description) lines.push(service.description);
    // Only link real detail pages; unpublished ones are simply not linked
    // (no internal CMS wording in public output).
    if (isServiceDetailPublished(service) && service.slug) {
      lines.push(`Detail: ${absoluteUrl(`/services/${service.slug}`)}`);
    }
    if (service.features?.length) {
      lines.push("Features:");
      for (const feature of service.features) lines.push(`- ${feature}`);
    }
    lines.push("");
  }

  lines.push("## Published detail pages");
  for (const slug of detailSlugs) {
    lines.push(`- ${absoluteUrl(`/services/${slug}`)}`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: mdHeaders(htmlCanonical),
  });
}
