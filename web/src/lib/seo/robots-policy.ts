import { absoluteUrl } from "@/lib/site";

/** Private paths every crawler group must Disallow (Batch 6/7). */
export const ROBOTS_DISALLOW = [
  "/admin",
  "/api/",
  "/feedback",
  "/newsletter/confirm",
  "/newsletter/unsubscribe",
] as const;

export const ROBOTS_AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
] as const;

export type RobotsRule = {
  userAgent: string;
  allow: string;
  disallow: string[];
};

export function buildRobotsRules(): RobotsRule[] {
  const disallow = [...ROBOTS_DISALLOW];
  return [
    { userAgent: "*", allow: "/", disallow: [...disallow] },
    ...ROBOTS_AI_AGENTS.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: [...disallow],
    })),
  ];
}

/** Serialize the same shape Next serves from app/robots.ts (for tests + review). */
export function formatRobotsTxt(rules = buildRobotsRules()): string {
  const blocks = rules.map((rule) => {
    const lines = [`User-Agent: ${rule.userAgent}`, `Allow: ${rule.allow}`];
    for (const path of rule.disallow) {
      lines.push(`Disallow: ${path}`);
    }
    return lines.join("\n");
  });
  blocks.push(`Sitemap: ${absoluteUrl("/sitemap.xml")}`);
  return `${blocks.join("\n\n")}\n`;
}
