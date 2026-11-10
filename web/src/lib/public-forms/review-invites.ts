// Invite-only review redeem helpers. SERVER ONLY.
import "server-only";
import { getServiceClient } from "@/lib/supabase/admin";
import { signToken, verifyToken } from "./tokens";

export type ReviewInvite = {
  id: string;
  label: string | null;
  client_name: string | null;
  client_email: string | null;
  project_or_service: string | null;
  status: "open" | "used" | "revoked";
  expires_at: string;
};

export function inviteUrlForId(inviteId: string, baseUrl: string): string {
  const token = signToken(inviteId);
  return `${baseUrl.replace(/\/$/, "")}/feedback?token=${encodeURIComponent(token)}`;
}

export async function loadOpenInvite(
  token: unknown,
): Promise<
  | { ok: true; invite: ReviewInvite }
  | { ok: false; reason: "invalid" | "used" | "revoked" | "expired" | "missing" }
> {
  const inviteId = verifyToken(token);
  if (!inviteId) return { ok: false, reason: "invalid" };

  const supabase = getServiceClient();
  if (!supabase) return { ok: false, reason: "missing" };

  const { data, error } = await supabase
    .from("review_invites")
    .select(
      "id, label, client_name, client_email, project_or_service, status, expires_at",
    )
    .eq("id", inviteId)
    .maybeSingle();

  if (error || !data) return { ok: false, reason: "invalid" };

  const invite = data as ReviewInvite;
  if (invite.status === "used") return { ok: false, reason: "used" };
  if (invite.status === "revoked") return { ok: false, reason: "revoked" };
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, invite };
}
