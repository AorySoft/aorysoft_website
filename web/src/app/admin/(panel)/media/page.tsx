import { canView, type Role } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import { isPublicSupabaseConfigured } from "@/lib/supabase/admin";
import type { MediaRow } from "@/lib/types";
import SetupNotice from "../SetupNotice";
import MediaManager from "./MediaManager";

export const metadata = { title: "Admin — Media" };

export default async function MediaPage() {
  if (!isPublicSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Media</h1>
        <SetupNotice what="The media library needs a connected Supabase project (storage bucket from supabase/0003_storage.sql)" />
      </div>
    );
  }

  const { supabase, role } = await getSessionRole();

  if (!canView(role, "media")) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        Your account has no role for the media library yet.
      </div>
    );
  }

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Media library</h1>

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Could not load media: {error.message}
        </p>
      )}

      <MediaManager
        items={(!error && (data as MediaRow[])) || []}
        role={role as Role | null}
      />
    </div>
  );
}
