"use client";

import { useActionState } from "react";
import { setUserRole } from "./actions";

type RoleFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const initial: RoleFormState = { status: "idle" };

export default function UserRoleForm({
  userId,
  email,
  currentRole,
}: {
  userId: string;
  email: string;
  currentRole: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: RoleFormState, formData: FormData): Promise<RoleFormState> => {
      const result = await setUserRole(userId, null, formData);
      if (!result.ok) {
        return { status: "error", message: result.error ?? "Role change failed." };
      }
      return { status: "success" };
    },
    initial,
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-2">
        <label htmlFor={`role-${userId}`} className="sr-only">
          New role for {email}
        </label>
        <select
          id={`role-${userId}`}
          name="role"
          defaultValue={currentRole ?? "editor"}
          className="rounded-atelier border border-line bg-surface-raised px-2 py-1.5 text-xs text-ink focus:border-signal focus:outline-none"
        >
          <option value="editor">editor</option>
          <option value="owner">owner</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-atelier bg-surface-raised px-3 py-1.5 text-xs text-ink-muted transition-colors duration-200 hover:bg-surface-raised disabled:opacity-50"
        >
          {pending ? "Saving…" : "Apply"}
        </button>
      </div>
      {state.status === "error" ? (
        <p role="alert" className="max-w-xs text-right text-xs text-red-300">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p role="status" className="text-xs text-signal">
          Role updated
        </p>
      ) : null}
    </form>
  );
}
