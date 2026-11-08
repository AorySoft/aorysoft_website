// Public content fetchers (anon key, RLS governs). Server-side only.
// Each returns `null` when Supabase is not configured or a query fails —
// pages then render their built-in placeholder content instead of crashing,
// and the admin panel shows the honest "connect Supabase" setup state.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isPublicSupabaseConfigured } from "@/lib/supabase/admin";
import type { JobRow, PostRow, ServiceRow } from "@/lib/types";

let anonClient: SupabaseClient | null = null;

function getAnonClient(): SupabaseClient | null {
  if (anonClient) return anonClient;
  if (!isPublicSupabaseConfigured()) return null;

  anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return anonClient;
}

async function safeQuery<T>(
  run: (client: SupabaseClient) => PromiseLike<{ data: T | null; error: unknown }>,
): Promise<T | null> {
  const client = getAnonClient();
  if (!client) return null;
  try {
    const { data, error } = await run(client);
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export type PostWithRelations = PostRow & {
  cover_image: { url: string } | null;
  category: { name: string } | null;
};

export async function getPublishedPosts(): Promise<PostWithRelations[] | null> {
  return safeQuery((client) =>
    client
      .from("posts")
      .select(
        "id, title, slug, excerpt, body_html, cover_image_id, author, publish_date, featured, status, seo_title, seo_description, seo_og_image_url, category_id, created_at, updated_at, cover_image:media!cover_image_id(url), category:categories(name)",
      )
      .eq("status", "published")
      .order("publish_date", { ascending: false })
      .returns<PostWithRelations[]>(),
  );
}

/**
 * Single published post by slug (public article page). Returns null when
 * Supabase is unconfigured, the query fails, or the slug matches no *published*
 * row — draft previews are admin-only and never reachable here.
 */
export async function getPublishedPostBySlug(
  slug: string,
): Promise<PostWithRelations | null> {
  return safeQuery((client) =>
    client
      .from("posts")
      .select(
        "id, title, slug, excerpt, body_html, cover_image_id, author, publish_date, featured, status, seo_title, seo_description, seo_og_image_url, category_id, created_at, updated_at, cover_image:media!cover_image_id(url), category:categories(name)",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .returns<PostWithRelations | null>(),
  );
}

export async function getActiveServices(): Promise<ServiceRow[] | null> {
  return safeQuery((client) =>
    client
      .from("services")
      .select(
        "id, title, subtitle, description, features, icon, color, sort_order, active, created_at, updated_at",
      )
      .eq("active", true)
      .order("sort_order", { ascending: true }),
  );
}

export async function getActiveJobs(): Promise<JobRow[] | null> {
  return safeQuery((client) =>
    client
      .from("jobs")
      .select(
        "id, title, department, location, type, experience, description, requirements, responsibilities, active, created_at, updated_at",
      )
      .eq("active", true)
      .order("created_at", { ascending: false }),
  );
}
