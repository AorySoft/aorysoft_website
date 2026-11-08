import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isPublicSupabaseConfigured } from "@/lib/supabase/admin";
import SetupNotice from "./SetupNotice";

export const metadata = { title: "Admin — Dashboard" };

type Count = number | null;

async function count(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  filters?: [string, unknown],
): Promise<Count> {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filters) query = query.eq(filters[0], filters[1]);
  const { count: n, error } = await query;
  if (error) return null; // permission denied or table missing → honest dash
  return n ?? 0;
}

export default async function AdminDashboard() {
  const configured = isPublicSupabaseConfigured();

  let counts: {
    publishedPosts: Count;
    draftPosts: Count;
    activeJobs: Count;
    activeServices: Count;
    newSubmissions: Count;
    confirmedSubscribers: Count;
  } | null = null;

  if (configured) {
    const supabase = await createClient();
    const [
      publishedPosts,
      draftPosts,
      activeJobs,
      activeServices,
      newSubmissions,
      confirmedSubscribers,
    ] = await Promise.all([
      count(supabase, "posts", ["status", "published"]),
      count(supabase, "posts", ["status", "draft"]),
      count(supabase, "jobs", ["active", true]),
      count(supabase, "services", ["active", true]),
      count(supabase, "submissions", ["status", "new"]),
      count(supabase, "newsletter_subscribers", ["status", "confirmed"]),
    ]);
    counts = {
      publishedPosts,
      draftPosts,
      activeJobs,
      activeServices,
      newSubmissions,
      confirmedSubscribers,
    };
  }

  const cards: { label: string; value: Count; href: string }[] = counts
    ? [
        { label: "New submissions", value: counts.newSubmissions, href: "/admin/submissions" },
        { label: "Published posts", value: counts.publishedPosts, href: "/admin/posts" },
        { label: "Draft posts", value: counts.draftPosts, href: "/admin/posts" },
        { label: "Active services", value: counts.activeServices, href: "/admin/services" },
        { label: "Active jobs", value: counts.activeJobs, href: "/admin/jobs" },
        {
          label: "Confirmed subscribers",
          value: counts.confirmedSubscribers,
          href: "/admin/newsletter",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {!configured && <SetupNotice />}

      {configured && counts && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 transition-colors duration-200 hover:border-cyan-500/50"
            >
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {card.value ?? "—"}
              </p>
              {card.value === null && (
                <p className="mt-1 text-xs text-gray-500">
                  Not visible with your role (RLS).
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {configured && (
        <p className="text-sm text-gray-500">
          Counts run under your session with RLS applied — a dash means that
          area is not visible to your role, not that something is broken.
        </p>
      )}
    </div>
  );
}
