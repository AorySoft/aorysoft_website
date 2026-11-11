// Server-only helper: option lists for relational form fields (categoryRef /
// mediaRef — posts cover image, review profile image, etc.). Reads run under
// the caller's session, so RLS applies.
import type { createClient } from "@/lib/supabase/server";

export type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export async function getFormOptions(supabase: SupabaseServer) {
  const [categories, media] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase
      .from("media")
      .select("id, url, alt")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  return {
    categories: categories.data ?? [],
    media: media.data ?? [],
  };
}
