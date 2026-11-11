import {
  ABOUT_HEADING,
  ABOUT_HONESTY,
  ABOUT_LEAD,
  ABOUT_PILLARS,
  PROCESS_STEPS,
} from "@/lib/about-content";
import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, absoluteUrl } from "@/lib/site";

/** Markdown twin of /about, generated from the same constants as the page. */
export function buildAboutMarkdown(): string {
  const lines = [
    `# About ${SITE_NAME}`,
    "",
    SITE_DESCRIPTION,
    "",
    `## ${ABOUT_HEADING}`,
    "",
    ABOUT_LEAD,
    "",
    ABOUT_HONESTY,
    "",
    "## Disciplines",
    "",
    ...ABOUT_PILLARS.map((pillar) => `- ${pillar.title} — ${pillar.description}`),
    "",
    "## How a project runs",
    "",
    ...PROCESS_STEPS.map((step, index) => `${index + 1}. ${step.title} — ${step.text}`),
    "",
    "## Links",
    "",
    `- HTML: ${absoluteUrl("/about")}`,
    `- Services: ${absoluteUrl("/services")}`,
    `- Contact: ${SITE_EMAIL} · ${absoluteUrl("/contact")}`,
    "",
  ];
  return lines.join("\n");
}
