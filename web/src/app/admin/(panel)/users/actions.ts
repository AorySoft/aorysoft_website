"use server";

import { revalidatePath } from "next/cache";
import { canEdit } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import { getServiceClient } from "@/lib/supabase/admin";
import type { ActionState } from "@/lib/admin/actions";

/**
 * Role changes are owner-only and run through the service-role path
 * (plan §5.5): `profiles` has no client-writable policy, so this is the only
 * API-side way a role can change (dashboard SQL is the other).
 */
export async function setUserRole(
  targetUserId: string,
  _bound: unknown,
  formData: FormData,
): Promise<ActionState> {
  const { role, user } = await getSessionRole();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!canEdit(role, "users"))
    return { ok: false, error: "User management is owner-only." };

  const nextRole = formData.get("role");
  if (nextRole !== "owner" && nextRole !== "editor") {
    return { ok: false, error: "Role must be owner or editor." };
  }

  const service = getServiceClient();
  if (!service)
    return {
      ok: false,
      error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server.",
    };

  const { error } = await service
    .from("profiles")
    .update({ role: nextRole })
    .eq("id", targetUserId);

  if (error) return { ok: false, error: `Role change failed: ${error.message}` };

  revalidatePath("/admin/users");
  return { ok: true };
}

/** Void-returning wrapper for direct <form action={...}> usage. */
export async function setUserRoleAction(
  targetUserId: string,
  formData: FormData,
): Promise<void> {
  await setUserRole(targetUserId, null, formData);
}
