import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/admin/permissions";
import AdminNav from "./AdminNav";

// Admin responses are per-session private data — never prerendered or cached
// (plan §5.5). This applies to every route under (panel).
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Role comes from profiles (RLS: users read only their own row). Missing
  // profile row = authenticated but not yet authorized (bootstrap state) —
  // the panel then shows every area as unavailable instead of crashing.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role: Role | null = profile?.role === "owner" || profile?.role === "editor"
    ? profile.role
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-gray-800 p-4 md:flex">
          <AdminNav role={role} email={user.email ?? ""} />
        </aside>

        {/* Mobile nav */}
        <div className="flex-1">
          <div className="border-b border-gray-800 p-4 md:hidden">
            <AdminNav role={role} email={user.email ?? ""} mobile />
          </div>
          <main className="p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
