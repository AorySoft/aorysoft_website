import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  resources,
  resolveResourceKey,
} from "@/lib/admin/resources";
import { canEdit, canDelete, canView, type Role } from "@/lib/admin/permissions";
import ResourceTable from "../components/ResourceTable";
import ReviewInvitePanel from "../components/ReviewInvitePanel";

export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: raw } = await params;
  const key = resolveResourceKey(raw);
  if (!key) notFound();

  const def = resources[key];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound(); // proxy already guards; belt and suspenders

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role: Role | null =
    profile?.role === "owner" || profile?.role === "editor"
      ? profile.role
      : null;

  if (!canView(role, key)) {
    return (
      <div className="rounded-atelier-lg border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        Your account has no role for this area yet. An owner can assign roles
        in Supabase (see supabase/0002_rls.sql bootstrap notes).
      </div>
    );
  }

  // RLS scopes this read to what the role may see (drafts included for
  // content editors via the manage policy).
  const { data, error } = await supabase
    .from(def.table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (!error && data) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{def.title}</h1>
        {canEdit(role, key) && (
          <Link
            href={`/admin/${def.key}/new`}
            className="rounded-atelier-lg bg-signal px-5 py-2 text-sm font-semibold text-canvas transition-all duration-200 hover:shadow-lg hover:shadow-signal"
          >
            New {def.singular}
          </Link>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          Could not load {def.title.toLowerCase()}: {error.message}
        </p>
      )}

      {key === "reviews" && canEdit(role, key) ? <ReviewInvitePanel /> : null}

      <ResourceTable
        def={def}
        rows={rows}
        canEdit={canEdit(role, key)}
        canDelete={canDelete(role, key)}
      />
    </div>
  );
}
