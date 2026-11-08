"use server";

import { revalidatePath } from "next/cache";
import { canDelete } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import type { ActionState } from "@/lib/admin/actions";

export async function deleteSubscriber(id: string): Promise<ActionState> {
  const { supabase, role } = await getSessionRole();
  if (!canDelete(role, "newsletter"))
    return { ok: false, error: "Subscriber management is owner-only." };

  const { error } = await supabase
    .from("newsletter_subscribers")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: `Delete failed: ${error.message}` };

  revalidatePath("/admin/newsletter");
  return { ok: true };
}
