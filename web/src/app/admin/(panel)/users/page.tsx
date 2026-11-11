import { canView } from "@/lib/admin/permissions";
import { getSessionRole } from "@/lib/admin/session";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import SetupNotice from "../SetupNotice";
import {
  AdminEmptyState,
  AdminTableBody,
  AdminTableHead,
  AdminTableShell,
} from "../components/AdminTableShell";
import UserRoleForm from "./UserRoleForm";

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

  const users = authResult.data.users;

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

      {users.length === 0 ? (
        <AdminEmptyState
          title="No users yet"
          description="Create an admin in the Supabase dashboard, then sign in once to create a profile row."
        />
      ) : (
        <AdminTableShell>
          <AdminTableHead>
            <tr>
              <th scope="col" className="px-4 py-3">Email</th>
              <th scope="col" className="px-4 py-3">Role</th>
              <th scope="col" className="px-4 py-3">Created</th>
              <th scope="col" className="px-4 py-3 text-right">Change role</th>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {users.map((authUser) => {
              const current = roleById.get(authUser.id) ?? null;
              const email = authUser.email ?? authUser.id;
              return (
                <tr key={authUser.id} className="hover:bg-surface/80">
                  <td className="px-4 py-3 text-ink-muted">{email}</td>
                  <td className="px-4 py-3">
                    {current ? (
                      <span className="rounded-atelier bg-surface-raised px-2.5 py-0.5 text-xs text-signal">
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
                    <UserRoleForm
                      userId={authUser.id}
                      email={email}
                      currentRole={current}
                    />
                  </td>
                </tr>
              );
            })}
          </AdminTableBody>
        </AdminTableShell>
      )}
    </div>
  );
}
