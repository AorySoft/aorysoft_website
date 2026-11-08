"use server";

import { revalidatePath } from "next/cache";
import { canEdit } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import { validateSettings } from "@/lib/admin/settings";
import type { ActionState } from "@/lib/admin/actions";

export async function saveSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user, role } = await getSessionRole();
  if (!user) return { ok: false, error: "Not signed in." };
  // Site settings are owner-only (plan §5.5 matrix).
  if (!canEdit(role, "settings"))
    return { ok: false, error: "Site settings are owner-only." };

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { ok: false, error: "Settings payload is not valid JSON." };
  }

  const validated = validateSettings(payload);
  if (!validated.ok) return { ok: false, error: validated.error };

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { id: true, data: validated.value, updated_by: user.id },
      { onConflict: "id" },
    );

  if (error) return { ok: false, error: `Save failed: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}
