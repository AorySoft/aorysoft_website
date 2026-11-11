// Public content fetchers (anon key, RLS governs). Server-side only.
// Each returns `null` when Supabase is not configured or a query fails —
// pages then render their built-in placeholder content instead of crashing,
// and the admin panel shows the honest "connect Supabase" setup state.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isPublicSupabaseConfigured } from "@/lib/supabase/admin";
import {
  isServiceDetailPublished,
  normalizeDeliverables,
  normalizeFaqs,
  normalizeProcessSteps,
} from "@/lib/services-publish";
import type {
  CaseStudyRow,
  JobRow,
  PostRow,
  ReviewRow,
  ServiceRow,
} from "@/lib/types";

const SERVICE_COLUMNS =
  "id, title, subtitle, description, features, icon, color, sort_order, active, slug, seo_title, seo_description, deliverables, process_steps, technologies, faqs, created_at, updated_at";

function normalizeServiceRow(row: ServiceRow): ServiceRow {
  return {
    ...row,
    features: Array.isArray(row.features) ? row.features.map(String) : [],
    deliverables: normalizeDeliverables(row.deliverables),
    process_steps: normalizeProcessSteps(row.process_steps),
    technologies: Array.isArray(row.technologies)
      ? row.technologies.map(String).filter(Boolean)
      : [],
    faqs: normalizeFaqs(row.faqs),
    slug: row.slug ?? null,
    seo_title: row.seo_title ?? null,
    seo_description: row.seo_description ?? null,
  };
}

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
  cover_image: { url: string; alt: string | null } | null;
  category: { name: string } | null;
};

export async function getPublishedPosts(): Promise<PostWithRelations[] | null> {
  return safeQuery((client) =>
    client
      .from("posts")
      .select(
        "id, title, slug, excerpt, body_html, cover_image_id, author, publish_date, featured, status, seo_title, seo_description, seo_og_image_url, category_id, created_at, updated_at, cover_image:media!cover_image_id(url, alt), category:categories(name)",
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
        "id, title, slug, excerpt, body_html, cover_image_id, author, publish_date, featured, status, seo_title, seo_description, seo_og_image_url, category_id, created_at, updated_at, cover_image:media!cover_image_id(url, alt), category:categories(name)",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .returns<PostWithRelations | null>(),
  );
}

export async function getActiveServices(): Promise<ServiceRow[] | null> {
  const rows = await safeQuery((client) =>
    client
      .from("services")
      .select(SERVICE_COLUMNS)
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .returns<ServiceRow[]>(),
  );
  return rows ? rows.map(normalizeServiceRow) : null;
}

/** Active services that meet the public detail-page publish threshold. */
export async function getPublishedServiceDetails(): Promise<ServiceRow[] | null> {
  const rows = await getActiveServices();
  if (!rows) return null;
  return rows.filter(isServiceDetailPublished);
}

export async function getPublishedServiceBySlug(
  slug: string,
): Promise<ServiceRow | null> {
  const row = await safeQuery((client) =>
    client
      .from("services")
      .select(SERVICE_COLUMNS)
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle()
      .returns<ServiceRow | null>(),
  );
  if (!row) return null;
  const normalized = normalizeServiceRow(row);
  return isServiceDetailPublished(normalized) ? normalized : null;
}

export async function getPublishedCaseStudies(): Promise<CaseStudyRow[] | null> {
  return safeQuery((client) =>
    client
      .from("case_studies")
      .select(
        "id, title, slug, summary, body, status, published_at, created_at, updated_at",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .returns<CaseStudyRow[]>(),
  );
}

export async function getPublishedCaseStudyBySlug(
  slug: string,
): Promise<CaseStudyRow | null> {
  return safeQuery((client) =>
    client
      .from("case_studies")
      .select(
        "id, title, slug, summary, body, status, published_at, created_at, updated_at",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .returns<CaseStudyRow | null>(),
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

export type ReviewWithImage = ReviewRow & {
  profile_image: { url: string; alt: string } | null;
};

/** Published reviews with confirmed display permission (RLS + filters). */
export async function getPublishedReviews(): Promise<ReviewWithImage[] | null> {
  return safeQuery((client) =>
    client
      .from("reviews")
      .select(
        "id, display_name, review_text, rating, source, source_url, project_or_service, attribution, profile_image_id, permission_confirmed, featured, status, submitter_email, sort_order, created_at, updated_at, profile_image:media!profile_image_id(url, alt)",
      )
      .eq("status", "published")
      .eq("permission_confirmed", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .returns<ReviewWithImage[]>(),
  );
}
