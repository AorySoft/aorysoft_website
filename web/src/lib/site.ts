import { SOCIAL_LINKS } from "@/lib/social";

/** Single source for brand strings used in metadata, JSON-LD, and llms.txt. */
export const SITE_NAME = "AorySoft";
export const SITE_TAGLINE = "AI-first solutions, real-world impact.";
/**
 * Root default <title> (and the home page's absolute title). Keep it a plain
 * string literal: scripts/check-indexable-pages.mjs reads it from this file to
 * flag pages that fall back to the default instead of setting their own.
 */
export const SITE_DEFAULT_TITLE = "AorySoft | AI-first solutions, real-world impact";
export const SITE_DESCRIPTION =
  "AorySoft builds software, AI systems, and automation for businesses: websites, apps, integrations, and practical AI.";
export const SITE_EMAIL = "info@aorysoft.com";
export const SITE_LOGO_PATH = "/brand/aorysoft-logo.jpg";
export const SITE_MARK_PATH = "/brand/aorysoft-mark.svg";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = siteUrl().replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function sameAsUrls(): string[] {
  return SOCIAL_LINKS.map((link) => link.url);
}
