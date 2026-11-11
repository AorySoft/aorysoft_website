import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isPublicSupabaseConfigured } from "@/lib/supabase/admin";
import { canDelete, canEdit, type Role } from "@/lib/admin/permissions";
import SetupNotice from "../SetupNotice";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import {
  AdminEmptyState,
  AdminTableBody,
  AdminTableHead,
  AdminTableShell,
} from "../components/AdminTableShell";
import { deleteSubmission } from "./actions";

export const metadata = { title: "Admin — Submissions" };

const TYPES = ["all", "contact", "quote"] as const;
const STATUSES = ["all", "new", "read", "replied", "archived"] as const;

function filterLink(
  type: string,
  status: string,
  label: string,
  active: boolean,
  key: string,
) {
  const params = new URLSearchParams();
  if (type !== "all") params.set("type", type);
  if (status !== "all") params.set("status", status);
  const query = params.toString();
  return (
    <Link
      key={key}
      href={`/admin/submissions${query ? `?${query}` : ""}`}
      className={`rounded-atelier px-4 py-1.5 text-sm transition-colors duration-200 ${
        active
          ? "bg-signal text-canvas"
          : "border border-line bg-surface-raised text-ink-muted hover:bg-surface-raised"
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
      <div className="rounded-atelier-lg border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
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
          className="rounded-atelier-lg border border-line px-4 py-2 text-sm text-ink-muted transition-colors duration-200 hover:border-signal/50 hover:text-signal"
        >
          Export CSV
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) =>
          filterLink(
            t,
            status,
            t === "all" ? "All types" : t,
            type === t,
            `type-${t}`,
          ),
        )}
        <span className="mx-2 h-4 w-px bg-line" aria-hidden="true" />
        {STATUSES.map((s) =>
          filterLink(
            type,
            s,
            s === "all" ? "All statuses" : s,
            status === s,
            `status-${s}`,
          ),
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Could not load submissions: {error.message}
        </p>
      )}

      {!error && submissions.length === 0 && (
        <AdminEmptyState
          title="No submissions match"
          description="Contact and quote forms deliver here after Turnstile, validation, and Resend succeed."
        />
      )}

      {submissions.length > 0 && (
        <AdminTableShell>
          <AdminTableHead>
            <tr>
              <th scope="col" className="px-4 py-3">Received</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Name</th>
              <th scope="col" className="px-4 py-3">Email</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {submissions.map((row) => (
              <tr key={row.id} className="hover:bg-surface/80">
                <td className="px-4 py-3 text-ink-muted">
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-atelier bg-surface-raised px-2.5 py-0.5 text-xs text-signal">
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted">{row.name}</td>
                <td className="px-4 py-3 text-ink-muted">{row.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-atelier px-2.5 py-0.5 text-xs ${
                      row.status === "new"
                        ? "bg-signal/20 text-signal"
                        : row.status === "replied"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-surface-raised text-ink-subtle"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-3">
                    <Link
                      href={`/admin/submissions/${row.id}`}
                      className="text-signal transition-colors duration-200 hover:text-signal"
                    >
                      View
                    </Link>
                    {mayDelete && (
                      <ConfirmDeleteButton
                        action={deleteSubmission}
                        id={row.id}
                        label={`Delete submission from ${row.name}`}
                        confirmMessage={`Delete the submission from ${row.name}? This cannot be undone.`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </AdminTableBody>
        </AdminTableShell>
      )}
    </div>
  );
}
