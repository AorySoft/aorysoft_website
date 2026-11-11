import Link from "next/link";
import { canView } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import { isPublicSupabaseConfigured } from "@/lib/supabase/admin";
import SetupNotice from "../SetupNotice";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import {
  AdminEmptyState,
  AdminTableBody,
  AdminTableHead,
  AdminTableShell,
} from "../components/AdminTableShell";
import { deleteSubscriber } from "./actions";

export const metadata = { title: "Admin — Newsletter" };

export default async function NewsletterPage() {
  if (!isPublicSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <SetupNotice what="Subscriber management needs a connected Supabase project" />
      </div>
    );
  }

  const { supabase, role } = await getSessionRole();

  if (!canView(role, "newsletter")) {
    return (
      <div className="rounded-atelier-lg border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        Newsletter subscriber management is owner-only (plan §5.5). Your
        account currently has the editor role.
      </div>
    );
  }

  const { data: rows, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  const subscribers = (!error && rows) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Newsletter subscribers</h1>
        <Link
          href="/admin/newsletter/export"
          className="rounded-atelier-lg border border-line px-4 py-2 text-sm text-ink-muted transition-colors duration-200 hover:border-signal/50 hover:text-signal"
        >
          Export CSV
        </Link>
      </div>

      <p className="text-sm text-ink-subtle">
        Double opt-in: subscribers land as <em>pending</em> and only flip to{" "}
        <em>confirmed</em> via the emailed token link. Unconfirmed addresses
        never receive newsletter email.
      </p>

      {error && (
        <p role="alert" className="rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Could not load subscribers: {error.message}
        </p>
      )}

      {!error && subscribers.length === 0 && (
        <AdminEmptyState
          title="No subscribers yet"
          description="Confirmed newsletter signups from the blog will appear here."
        />
      )}

      {subscribers.length > 0 && (
        <AdminTableShell>
          <AdminTableHead>
            <tr>
              <th scope="col" className="px-4 py-3">Added</th>
              <th scope="col" className="px-4 py-3">Email</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Consent</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {subscribers.map((row) => (
              <tr key={row.id} className="hover:bg-surface/80">
                <td className="px-4 py-3 text-ink-muted">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-ink-muted">{row.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-atelier px-2.5 py-0.5 text-xs ${
                      row.status === "confirmed"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : row.status === "pending"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-surface-raised text-ink-subtle"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-subtle">
                  {row.consent_at
                    ? new Date(row.consent_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <ConfirmDeleteButton
                    action={deleteSubscriber}
                    id={row.id}
                    label={`Delete subscriber ${row.email}`}
                    confirmMessage={`Delete ${row.email} from the subscriber list?`}
                  />
                </td>
              </tr>
            ))}
          </AdminTableBody>
        </AdminTableShell>
      )}
    </div>
  );
}
