import { canView } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import SetupNotice from "../SetupNotice";
import { setUserRoleAction } from "./actions";

export const metadata = { title: "Admin — Users" };

export default async function UsersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <SetupNotice what="User management needs a connected Supabase project" />
      </div>
    );
  }

  const { role } = await getSessionRole();

  if (!canView(role, "users")) {
    return (
      <div className="rounded-atelier-lg border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        User management is owner-only (plan §5.5).
      </div>
    );
  }

  const service = getServiceClient();
  if (!service) {
    return (
      <SetupNotice what="SUPABASE_SERVICE_ROLE_KEY is not configured" />
    );
  }

  const [authResult, profilesResult] = await Promise.all([
    service.auth.admin.listUsers({ page: 1, perPage: 100 }),
    service.from("profiles").select("id, role, created_at"),
  ]);

  if (authResult.error) {
    return (
      <p role="alert" className="rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        Could not list users: {authResult.error.message}
      </p>
    );
  }

  const roleById = new Map(
    (profilesResult.data ?? []).map((row) => [row.id, row.role as string]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin users</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-subtle">
          New admins are created in the Supabase dashboard (Users → Create new
          user, <strong>Auto Confirm</strong> enabled; public signups stay
          disabled). A profile row with the editor role is created on first
          sign-in; promote or demote here — role changes run through the
          server-side service-role path, never the client.
        </p>
      </div>

      <div className="overflow-x-auto rounded-atelier-lg border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-ink-subtle">
            <tr>
              <th scope="col" className="px-4 py-3">Email</th>
              <th scope="col" className="px-4 py-3">Role</th>
              <th scope="col" className="px-4 py-3">Created</th>
              <th scope="col" className="px-4 py-3 text-right">Change role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-canvas/50">
            {authResult.data.users.map((authUser) => {
              const current = roleById.get(authUser.id) ?? null;
              return (
                <tr key={authUser.id} className="hover:bg-surface/80">
                  <td className="px-4 py-3 text-ink-muted">
                    {authUser.email ?? authUser.id}
                  </td>
                  <td className="px-4 py-3">
                    {current ? (
                      <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs text-signal">
                        {current}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-subtle">
                        no profile yet (signs in once)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-subtle">
                    {authUser.created_at
                      ? new Date(authUser.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={setUserRoleAction.bind(null, authUser.id)}
                      className="inline-flex items-center gap-2"
                    >
                      <label htmlFor={`role-${authUser.id}`} className="sr-only">
                        New role for {authUser.email ?? authUser.id}
                      </label>
                      <select
                        id={`role-${authUser.id}`}
                        name="role"
                        defaultValue={current ?? "editor"}
                        className="rounded-atelier border border-line bg-surface-raised px-2 py-1.5 text-xs text-ink focus:border-signal focus:outline-none"
                      >
                        <option value="editor">editor</option>
                        <option value="owner">owner</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-atelier bg-surface-raised px-3 py-1.5 text-xs text-ink-muted transition-colors duration-200 hover:bg-surface-raised"
                      >
                        Apply
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
