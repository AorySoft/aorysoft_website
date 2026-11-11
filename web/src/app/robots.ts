import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { buildRobotsRules } from "@/lib/seo/robots-policy";

export default function robots(): MetadataRoute.Robots {
  const rules = buildRobotsRules();
  return {
    rules: rules.map((rule) => ({
      userAgent: rule.userAgent,
      allow: rule.allow,
      // Fresh array per group so every UA repeats the full Disallow list.
      disallow: [...rule.disallow],
    })),
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
