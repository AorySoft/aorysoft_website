import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isPublicSupabaseConfigured } from "@/lib/supabase/admin";
import { canDelete, canEdit, type Role } from "@/lib/admin/permissions";
import SetupNotice from "../SetupNotice";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import { deleteSubmission } from "./actions";

export const metadata = { title: "Admin — Submissions" };

const TYPES = ["all", "contact", "quote"] as const;
const STATUSES = ["all", "new", "read", "replied", "archived"] as const;

function filterLink(
  type: string,
  status: string,
  label: string,
  active: boolean,
) {
  const query =
    (type !== "all" ? `type=${type}` : "") +
    (status !== "all" ? `${type !== "all" ? "&" : ""}status=${status}` : "");
  return (
    <Link
      href={`/admin/submissions${query ? `?${query}` : ""}`}
      className={`rounded-full px-4 py-1.5 text-sm transition-colors duration-200 ${
        active
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
          : "border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {label}
    </Link>
  );
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const { type = "all", status = "all" } = await searchParams;

  if (!isPublicSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <SetupNotice what="The submissions inbox needs a connected Supabase project" />
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  const role: Role | null =
    profile?.role === "owner" || profile?.role === "editor"
      ? profile.role
      : null;

  if (!canEdit(role, "submissions")) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        Your account has no role for the submissions inbox yet.
      </div>
    );
  }

  let query = supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (type !== "all") query = query.eq("type", type);
  if (status !== "all") query = query.eq("status", status);

  const { data: rows, error } = await query;
  const submissions = (!error && rows) || [];
  const mayDelete = canDelete(role, "submissions");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <Link
          href={`/admin/submissions/export?type=${type}&status=${status}`}
          className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors duration-200 hover:border-cyan-500/50 hover:text-cyan-400"
        >
          Export CSV
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) =>
          filterLink(t, "all", t === "all" ? "All types" : t, type === t && status === "all"),
        )}
        <span className="mx-2 h-4 w-px bg-gray-700" aria-hidden="true" />
        {STATUSES.map((s) =>
          filterLink("all", s, s === "all" ? "All statuses" : s, status === s && type === "all"),
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Could not load submissions: {error.message}
        </p>
      )}

      {!error && submissions.length === 0 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-10 text-center">
          <p className="font-medium text-white">No submissions match</p>
          <p className="mt-1 text-sm text-gray-400">
            Contact/quote forms deliver here once the Phase 4 pipeline (Turnstile
            → Supabase → Resend) is connected.
          </p>
        </div>
      )}

      {submissions.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-900 text-xs uppercase text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">Received</th>
                <th scope="col" className="px-4 py-3">Type</th>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Email</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-950/50">
              {submissions.map((row) => (
                <tr key={row.id} className="hover:bg-gray-900/60">
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-cyan-400">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-200">{row.name}</td>
                  <td className="px-4 py-3 text-gray-300">{row.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        row.status === "new"
                          ? "bg-blue-500/20 text-blue-300"
                          : row.status === "replied"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-3">
                      <Link
                        href={`/admin/submissions/${row.id}`}
                        className="text-cyan-400 transition-colors duration-200 hover:text-cyan-300"
                      >
                        View
                      </Link>
                      {mayDelete && (
                        <ConfirmDeleteButton
                          remove={() => deleteSubmission(row.id)}
                          label={`Delete submission from ${row.name}`}
                          confirmMessage={`Delete the submission from ${row.name}? This cannot be undone.`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
