import "server-only";

import { getIndexablePages } from "@/lib/seo/indexable";
import {
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
} from "@/lib/site";

/** Compact llms.txt: identity + indexable URLs only (no invented body copy). */
export async function buildLlmsTxt(): Promise<string> {
  const pages = await getIndexablePages();
  const lines = [
    `# ${SITE_NAME}`,
    `> ${SITE_TAGLINE}`,
    "",
    SITE_DESCRIPTION,
    "",
    `Contact: ${SITE_EMAIL}`,
    `Website: ${absoluteUrl("/")}`,
    "",
    "## Pages",
  ];

  for (const page of pages) {
    // Always list core conversion URLs; skip legal in the short file for focus.
    if (page.path === "/privacy" || page.path === "/terms") continue;
    lines.push(`- [${page.title}](${absoluteUrl(page.path)}): ${page.description}`);
  }

  lines.push("");
  lines.push(`Full map: ${absoluteUrl("/llms-full.txt")}`);
  lines.push(`Sitemap: ${absoluteUrl("/sitemap.xml")}`);
  lines.push("");
  return lines.join("\n");
}

/** Longer catalog for agents that want every indexable URL + short blurb. */
export async function buildLlmsFullTxt(): Promise<string> {
  const pages = await getIndexablePages();
  const lines = [
    `# ${SITE_NAME} — full page map`,
    `> ${SITE_TAGLINE}`,
    "",
    SITE_DESCRIPTION,
    "",
    `Contact: ${SITE_EMAIL}`,
    "",
    "Only published, indexable URLs are listed. Empty blog, unpublished services,",
    "and gated /work or /reviews are omitted until real content exists.",
    "",
  ];

  for (const page of pages) {
    lines.push(`## ${page.title}`);
    lines.push(`URL: ${absoluteUrl(page.path)}`);
    lines.push(page.description);
    if (page.lastModified) {
      lines.push(`Updated: ${page.lastModified.slice(0, 10)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
