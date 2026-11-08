"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canDelete, canEdit, type Role } from "./permissions";
import {
  resources,
  validateResourceInput,
  type ResourceKey,
} from "./resources";

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

function revalidateFor(key: ResourceKey) {
  for (const path of resources[key].revalidate) revalidatePath(path);
  // Blog article pages are dynamic routes; the "page" form revalidates every
  // instance of the pattern so edits/renames/unpublishes are reflected without
  // waiting for the 60 s ISR window (plan §8).
  if (key === "posts") revalidatePath("/blog/[slug]", "page");
  revalidatePath(`/admin/${key}`);
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
  if (error) return { ok: false, error: `Save failed: ${error.message}` };

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

  const { error } = await supabase
    .from(resources[key].table)
    .update({ ...validated.value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: `Save failed: ${error.message}` };

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
