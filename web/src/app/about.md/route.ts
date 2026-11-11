import { absoluteUrl, SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

/** Plain-text twin of /about for agents that prefer markdown. */
export async function GET() {
  const htmlCanonical = absoluteUrl("/about");
  const body = `# About ${SITE_NAME}

${SITE_DESCRIPTION}

## How we build

We help teams ship digital products, AI features, and automation that hold up in day-to-day use. Software first, AI where it earns its place, and a process you can follow without guesswork.

We care about honest delivery: clear communication, realistic timelines, and work we are willing to stand behind.

## Disciplines

- Engineering — Websites, apps, and platforms that are clear to use and easier to maintain over time.
- AI — Chatbots, voice agents, and custom AI wired into the work your team already does. Not demos for demos' sake.
- Automation — Workflows and integrations that cut repetitive work so people can spend time on the decisions that matter.

## How a project runs

1. Discover — Goals, users, and constraints first.
2. Design — Flows and interfaces shaped before code.
3. Build — Software and AI systems in small, reviewable steps.
4. Integrate — Connected to the tools and data you already use.
5. Operate — Deployed, maintained, and improved.

## Links

- HTML: ${htmlCanonical}
- Services: ${absoluteUrl("/services")}
- Contact: ${SITE_EMAIL} · ${absoluteUrl("/contact")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
      Link: `<${htmlCanonical}>; rel="canonical"`,
    },
  });
}
