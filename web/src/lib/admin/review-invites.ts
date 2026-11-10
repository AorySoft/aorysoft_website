"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { inviteUrlForId } from "@/lib/public-forms/review-invites";
import type { Role } from "@/lib/admin/permissions";
import { canEdit } from "@/lib/admin/permissions";

export type CreateInviteResult =
  | { ok: true; url: string; expiresAt: string }
  | { ok: false; message: string };

/**
 * Editor/owner mints a one-time feedback invite and returns the share URL.
 */
export async function createReviewInvite(input: {
  label?: string;
  clientName?: string;
  clientEmail?: string;
  projectOrService?: string;
  daysValid?: number;
}): Promise<CreateInviteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in required." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role: Role | null =
    profile?.role === "owner" || profile?.role === "editor"
      ? profile.role
      : null;
  if (!canEdit(role, "reviews")) {
    return { ok: false, message: "You cannot create review invites." };
  }

  const days = Math.min(Math.max(Number(input.daysValid) || 30, 1), 90);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("review_invites")
    .insert({
      label: input.label?.trim() || null,
      client_name: input.clientName?.trim() || null,
      client_email: input.clientEmail?.trim() || null,
      project_or_service: input.projectOrService?.trim() || null,
      status: "open",
      expires_at: expiresAt,
    })
    .select("id, expires_at")
    .single();

  if (error || !data) {
    console.error("[admin] createReviewInvite failed:", error);
    return {
      ok: false,
      message:
        "Could not create invite. Apply supabase/0010_review_invites.sql if the table is missing.",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = inviteUrlForId(data.id, baseUrl);

  revalidatePath("/admin/reviews");
  return { ok: true, url, expiresAt: data.expires_at };
}
