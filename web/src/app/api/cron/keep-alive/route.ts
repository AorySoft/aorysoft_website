// Supabase keep-alive (plan §5.3). A Free-tier Supabase project is paused after
// ~7 days of low activity, which would take the whole site down. Vercel cron
// calls this endpoint daily to run a few real queries through the public anon
// key (RLS still applies — only published/active rows are visible), generating
// the "user database queries" Supabase looks for.
//
// Protected: Vercel sends `Authorization: Bearer ${CRON_SECRET}` for configured
// crons. Without a matching header the endpoint is a no-op 401, so it can never
// be used to generate arbitrary load. If CRON_SECRET is unset the endpoint is
// disabled (503) rather than left open. Responses are logged so a failed run is
// visible in Vercel's function logs — Hobby cron failures otherwise fail
// silently.
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured; keep-alive is disabled." },
      { status: 503 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const startedAt = new Date().toISOString();
  const [posts, services] = await Promise.all([
    supabase
      .from("posts")
      .select("id", { head: true, count: "exact" })
      .eq("status", "published"),
    supabase.from("services").select("id", { head: true, count: "exact" }).eq("active", true),
  ]);

  const errors = [posts.error, services.error]
    .filter((error): error is NonNullable<typeof error> => Boolean(error))
    .map((error) => error.message);

  const payload = {
    ok: errors.length === 0,
    startedAt,
    finishedAt: new Date().toISOString(),
    counts: { posts: posts.count, services: services.count },
    errors,
  };

  // Proof-of-run for the Hobby plan, where a failed invocation is otherwise silent.
  console.log("[keep-alive]", JSON.stringify(payload));

  return NextResponse.json(payload, { status: errors.length === 0 ? 200 : 500 });
}
