import { absoluteUrl } from "@/lib/site";
import { buildAboutMarkdown } from "@/lib/seo/about-markdown";

export const dynamic = "force-static";

/** Plain-text twin of /about for agents that prefer markdown. */
export async function GET() {
  const htmlCanonical = absoluteUrl("/about");
  // Generated from the same constants as /about (src/lib/about-content.ts).
  const body = buildAboutMarkdown();

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
      Link: `<${htmlCanonical}>; rel="canonical"`,
    },
  });
}
