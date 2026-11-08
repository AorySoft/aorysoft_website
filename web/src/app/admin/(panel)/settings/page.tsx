import { canView } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import { isPublicSupabaseConfigured } from "@/lib/supabase/admin";
import type { SiteSettingsData } from "@/lib/types";
import SetupNotice from "../SetupNotice";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "Admin — Site Settings" };

export default async function SettingsPage() {
  if (!isPublicSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <SetupNotice what="Site settings need a connected Supabase project" />
      </div>
    );
  }

  const { supabase, role } = await getSessionRole();

  if (!canView(role, "settings")) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        Site settings are owner-only (plan §5.5). Your account currently has
        the editor role.
      </div>
    );
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("data")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        Could not load settings: {error.message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Hero copy, about text, industries, technologies, CTA and footer
          contact. Owner-only. These values drive the public pages once
          connected; placeholders render until settings exist.
        </p>
      </div>
      <SettingsForm initial={(data?.data as SiteSettingsData) ?? {}} />
    </div>
  );
}
