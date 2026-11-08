"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canDelete, canEdit, type Role } from "@/lib/admin/permissions";
import type { ActionState } from "@/lib/admin/actions";

const STATUSES = ["new", "read", "replied", "archived"] as const;

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

export async function updateSubmissionStatus(
  id: string,
  _bound: unknown,
  formData: FormData,
): Promise<ActionState> {
  const status = formData.get("status");
  if (typeof status !== "string" || !(STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const { supabase, role } = await requireRole();
  if (!canEdit(role, "submissions"))
    return { ok: false, error: "Your role cannot update submissions." };

  const { error } = await supabase
    .from("submissions")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: `Update failed: ${error.message}` };

  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  return { ok: true };
}

export async function deleteSubmission(id: string): Promise<ActionState> {
  const { supabase, role } = await requireRole();
  if (!canDelete(role, "submissions"))
    return { ok: false, error: "Deletion is owner-only." };

  const { error } = await supabase.from("submissions").delete().eq("id", id);
  if (error) return { ok: false, error: `Delete failed: ${error.message}` };

  revalidatePath("/admin/submissions");
  return { ok: true };
}

/**
 * Void-returning wrapper for direct <form action={...}> usage (React form
 * actions must resolve to void; the state-returning version is for
 * useActionState).
 */
export async function updateSubmissionStatusAction(
  id: string,
  formData: FormData,
): Promise<void> {
  await updateSubmissionStatus(id, null, formData);
}
