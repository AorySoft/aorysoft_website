"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canDelete, canEdit, type Role } from "./permissions";
import {
  resources,
  validateResourceInput,
  type ResourceKey,
} from "./resources";
import { revalidationTargets } from "./revalidation";
import {
  SLUG_LOCKED_MESSAGE,
  SLUG_LOCK_RESOURCES,
  friendlySlugError,
  isSlugLocked,
} from "./slug-lock";

export type ActionState = {
  ok: boolean;
  error?: string;
  errors?: Record<string, string>;
};

/**
 * Re-derive the caller's role from the session on EVERY mutation.
 * RLS is the real enforcement (queries run under the caller's JWT); these
 * checks exist for defense-in-depth and honest error messages.
 */
async function requireRole(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  role: Role | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role =
    profile?.role === "owner" || profile?.role === "editor"
      ? profile.role
      : null;
  return { supabase, role };
}

function formDataToRecord(formData: FormData): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    // File inputs are not part of generic resources (media handles uploads).
    if (value instanceof File) continue;
    record[key] = value;
  }
  return record;
}

// Publish/unpublish must not wait for the 60 s ISR window or a redeploy:
// targets include the public layout (nav gates) and the sitemap (N1).
function revalidateFor(key: ResourceKey) {
  for (const target of revalidationTargets(key)) {
    if (target.type) revalidatePath(target.path, target.type);
    else revalidatePath(target.path);
  }
}

export async function createResource(
  key: ResourceKey,
  _bound: unknown,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, role } = await requireRole();
  if (!role) return { ok: false, error: "Not signed in or no role assigned." };
  if (!canEdit(role, key))
    return { ok: false, error: "Your role cannot modify this area." };

  const validated = validateResourceInput(key, formDataToRecord(formData));
  if (!validated.ok) return { ok: false, errors: validated.errors };

  const { error } = await supabase.from(resources[key].table).insert(validated.value);
  if (error) {
    const slugErrors = friendlySlugError(error, resources[key].singular);
    if (slugErrors) return { ok: false, errors: slugErrors };
    return { ok: false, error: `Save failed: ${error.message}` };
  }

  revalidateFor(key);
  return { ok: true };
}

export async function updateResource(
  key: ResourceKey,
  id: string,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, role } = await requireRole();
  if (!role) return { ok: false, error: "Not signed in or no role assigned." };
  if (!canEdit(role, key))
    return { ok: false, error: "Your role cannot modify this area." };

  const validated = validateResourceInput(key, formDataToRecord(formData));
  if (!validated.ok) return { ok: false, errors: validated.errors };

  const payload = { ...validated.value };

  // Services/cases: the slug locks once the page has been published, so a
  // public URL never changes (simpler than redirects). select("*") works
  // whether or not migration 0016 (slug_locked_at) is applied yet; the 0016
  // trigger enforces the same rule in the database.
  if (SLUG_LOCK_RESOURCES.has(key)) {
    const { data: existing } = await supabase
      .from(resources[key].table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (existing && isSlugLocked(key, existing as Record<string, unknown>)) {
      const currentSlug = (existing as { slug?: string | null }).slug ?? null;
      if ((payload.slug ?? null) !== currentSlug) {
        return { ok: false, errors: { slug: SLUG_LOCKED_MESSAGE } };
      }
    }
  }

  if (key === "cases" && payload.status === "published" && !payload.published_at) {
    payload.published_at = new Date().toISOString().slice(0, 10);
  }

  const { error } = await supabase
    .from(resources[key].table)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    const slugErrors = friendlySlugError(error, resources[key].singular);
    if (slugErrors) return { ok: false, errors: slugErrors };
    return { ok: false, error: `Save failed: ${error.message}` };
  }

  revalidateFor(key);
  return { ok: true };
}

export async function deleteResource(
  key: ResourceKey,
  id: string,
): Promise<ActionState> {
  const { supabase, role } = await requireRole();
  if (!role) return { ok: false, error: "Not signed in or no role assigned." };
  if (!canDelete(role, key))
    return {
      ok: false,
      error: "Deletion is owner-only. Ask the account owner to remove this item.",
    };

  const { error } = await supabase.from(resources[key].table).delete().eq("id", id);
  if (error) return { ok: false, error: `Delete failed: ${error.message}` };

  revalidateFor(key);
  return { ok: true };
}
