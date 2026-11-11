import "server-only";

import {
  getPublishedCaseStudies,
  getPublishedPosts,
  getPublishedReviews,
  getPublishedServiceDetails,
} from "@/lib/data";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

export type IndexablePage = {
  path: string;
  title: string;
  description: string;
  lastModified?: string;
};

const ALWAYS: IndexablePage[] = [
  {
    path: "/",
    title: `${SITE_NAME} | AI-first solutions, real-world impact`,
    description: SITE_DESCRIPTION,
  },
  {
    path: "/about",
    title: "About",
    description:
      "How AorySoft builds: engineering, AI, and automation with a clear process — software first, AI where it earns its place.",
  },
  {
    path: "/services",
    title: "Services",
    description:
      "AI chatbots, agents, automation, and web development from AorySoft — practical systems for teams that need software that ships.",
  },
  {
    path: "/careers",
    title: "Careers",
    description:
      "Build software, AI systems, and automation with AorySoft. See open roles or get in touch.",
  },
  {
    path: "/contact",
    title: "Contact",
    description:
      "Contact AorySoft about a project, quote, or question. We reply through info@aorysoft.com.",
  },
  {
    path: "/quote",
    title: "Get a Quote",
    description:
      "Share scope, timeline, and constraints. AorySoft will follow up with a clear proposal.",
  },
  {
    path: "/privacy",
    title: "Privacy",
    description:
      "How AorySoft collects, uses and protects the information you share through our website, contact forms and newsletter.",
  },
  {
    path: "/terms",
    title: "Terms",
    description:
      "The terms that apply when you use the AorySoft website, including content ownership, acceptable use and limitations.",
  },
];

/**
 * Live indexable public pages only. Gated routes (/work, /reviews, /blog when
 * empty, service details below the content threshold) are omitted.
 */
export async function getIndexablePages(): Promise<IndexablePage[]> {
  const [posts, services, cases, reviews] = await Promise.all([
    getPublishedPosts(),
    getPublishedServiceDetails(),
    getPublishedCaseStudies(),
    getPublishedReviews(),
  ]);

  const pages: IndexablePage[] = [...ALWAYS];

  if ((posts?.length ?? 0) >= 1) {
    pages.push({
      path: "/blog",
      title: "Blog",
      description:
        "Notes from AorySoft on AI, automation, and building software that holds up in production.",
    });
    for (const post of posts ?? []) {
      pages.push({
        path: `/blog/${post.slug}`,
        title: post.seo_title || post.title,
        description:
          post.seo_description ||
          post.excerpt ||
          "Article from AorySoft.",
        lastModified: post.updated_at,
      });
    }
  }

  for (const service of services ?? []) {
    if (!service.slug) continue;
    pages.push({
      path: `/services/${service.slug}`,
      title: service.seo_title || service.title,
      description:
        service.seo_description ||
        service.subtitle ||
        service.description ||
        `${service.title} from AorySoft.`,
      lastModified: service.updated_at,
    });
  }

  if ((cases?.length ?? 0) >= 1) {
    pages.push({
      path: "/work",
      title: "Case studies",
      description:
        "Selected AorySoft work — real projects cleared for public display.",
    });
  }

  if ((reviews?.length ?? 0) >= 3) {
    pages.push({
      path: "/reviews",
      title: "Reviews",
      description:
        "Client reviews AorySoft has permission to show — no invented testimonials.",
    });
  }

  return pages;
}

export function indexableAbsoluteUrls(pages: IndexablePage[]): string[] {
  return pages.map((page) => absoluteUrl(page.path));
}
