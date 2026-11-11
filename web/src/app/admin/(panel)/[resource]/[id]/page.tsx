import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  initialForResourceForm,
  resources,
  resolveResourceKey,
} from "@/lib/admin/resources";
import { canEdit, type Role } from "@/lib/admin/permissions";
import ResourceForm from "../../components/ResourceForm";
import { getFormOptions } from "../../options";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: raw, id } = await params;
  const key = resolveResourceKey(raw);
  if (!key) notFound();

  const def = resources[key];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role: Role | null =
    profile?.role === "owner" || profile?.role === "editor"
      ? profile.role
      : null;

  if (!canEdit(role, key)) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        Your role cannot edit {def.title.toLowerCase()}.
      </div>
    );
  }

  // RLS decides whether this row is visible at all.
  const { data: row } = await supabase
    .from(def.table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  const needsFormOptions = def.fields.some(
    (field) => field.kind === "mediaRef" || field.kind === "categoryRef",
  );
  const options = needsFormOptions
    ? await getFormOptions(supabase)
    : { categories: [], media: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Edit {def.singular}: {String(row.title ?? row.name ?? row.slug ?? "")}
      </h1>
      <ResourceForm
        def={def}
        initial={initialForResourceForm(
          key,
          row as unknown as Record<string, unknown>,
        )}
        categories={options.categories}
        media={options.media}
      />
    </div>
  );
}
