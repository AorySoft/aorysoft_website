import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canDelete, canEdit, type Role } from "@/lib/admin/permissions";
import ConfirmDeleteButton from "../../components/ConfirmDeleteButton";
import { deleteSubmission, updateSubmissionStatusAction } from "../actions";

export const metadata = { title: "Admin — Submission" };

const STATUSES = ["new", "read", "replied", "archived"] as const;

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role: Role | null =
    profile?.role === "owner" || profile?.role === "editor"
      ? profile.role
      : null;

  if (!canEdit(role, "submissions")) notFound();

  const { data: row } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  const details =
    row.details && Object.keys(row.details as object).length > 0
      ? JSON.stringify(row.details, null, 2)
      : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {row.type === "quote" ? "Quote request" : "Contact message"}
        </h1>
        <Link
          href="/admin/submissions"
          className="text-sm text-ink-subtle transition-colors duration-200 hover:text-ink"
        >
          ← Back to inbox
        </Link>
      </div>

      <section className="space-y-4 rounded-atelier-lg border border-line bg-surface/80 p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ["Received", new Date(row.created_at).toLocaleString()],
            ["Name", row.name],
            ["Email", row.email],
            ["Phone", row.phone ?? "—"],
            ["Company", row.company ?? "—"],
            ["Service", row.service ?? "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-ink-subtle">
                {label}
              </dt>
              <dd className="mt-1 text-sm text-ink-muted">{value}</dd>
            </div>
          ))}
        </dl>

        {row.message && (
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">
              Message
            </p>
            <p className="mt-2 whitespace-pre-wrap rounded-atelier-lg bg-canvas/60 p-4 text-sm leading-relaxed text-ink-muted">
              {row.message}
            </p>
          </div>
        )}

        {details && (
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">
              Quote details (JSON)
            </p>
            <pre className="mt-2 overflow-x-auto rounded-atelier-lg bg-canvas/60 p-4 text-xs text-ink-muted">
              {details}
            </pre>
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-atelier-lg border border-line bg-surface/80 p-6">
        <form
          action={updateSubmissionStatusAction.bind(null, row.id)}
          className="flex items-center gap-3"
        >
          <label htmlFor="status" className="text-sm text-ink-muted">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={row.status}
            className="rounded-atelier border border-line bg-surface-raised px-3 py-2 text-sm text-ink focus:border-signal focus:outline-none"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-atelier-lg bg-signal px-4 py-2 text-sm font-semibold text-canvas transition-all duration-200 hover:shadow-lg hover:shadow-signal"
          >
            Update
          </button>
        </form>

        {canDelete(role, "submissions") && (
          <ConfirmDeleteButton
            action={deleteSubmission}
            id={row.id}
            label={`Delete submission from ${row.name}`}
            confirmMessage={`Delete the submission from ${row.name}? This cannot be undone.`}
          />
        )}
      </section>
    </div>
  );
}
