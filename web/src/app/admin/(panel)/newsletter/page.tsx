import Link from "next/link";
import { canView } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import { isPublicSupabaseConfigured } from "@/lib/supabase/admin";
import SetupNotice from "../SetupNotice";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
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
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
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
          className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors duration-200 hover:border-cyan-500/50 hover:text-cyan-400"
        >
          Export CSV
        </Link>
      </div>

      <p className="text-sm text-gray-500">
        Double opt-in: subscribers land as <em>pending</em> and only flip to{" "}
        <em>confirmed</em> via the emailed token link (Phase 4). Unconfirmed
        addresses never receive newsletter email.
      </p>

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Could not load subscribers: {error.message}
        </p>
      )}

      {!error && subscribers.length === 0 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-10 text-center">
          <p className="font-medium text-white">No subscribers yet</p>
          <p className="mt-1 text-sm text-gray-400">
            The signup flow goes live with the Phase 4 newsletter pipeline.
          </p>
        </div>
      )}

      {subscribers.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-900 text-xs uppercase text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">Added</th>
                <th scope="col" className="px-4 py-3">Email</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Consent</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-950/50">
              {subscribers.map((row) => (
                <tr key={row.id} className="hover:bg-gray-900/60">
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-200">{row.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        row.status === "confirmed"
                          ? "bg-green-500/20 text-green-300"
                          : row.status === "pending"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {row.consent_at
                      ? new Date(row.consent_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmDeleteButton
                      remove={() => deleteSubscriber(row.id)}
                      label={`Delete subscriber ${row.email}`}
                      confirmMessage={`Delete ${row.email} from the subscriber list?`}
                    />
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
