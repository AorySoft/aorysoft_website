import { buildLlmsFullTxt } from "@/lib/seo/llms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const body = await buildLlmsFullTxt();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
