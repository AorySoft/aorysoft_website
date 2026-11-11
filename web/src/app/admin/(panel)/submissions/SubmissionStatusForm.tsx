"use client";

import { useActionState } from "react";
import { updateSubmissionStatus } from "./actions";

const STATUSES = ["new", "read", "replied", "archived"] as const;

type StatusFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const initial: StatusFormState = { status: "idle" };

export default function SubmissionStatusForm({
  submissionId,
  currentStatus,
}: {
  submissionId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: StatusFormState, formData: FormData): Promise<StatusFormState> => {
      const result = await updateSubmissionStatus(submissionId, null, formData);
      if (!result.ok) {
        return { status: "error", message: result.error ?? "Update failed." };
      }
      return { status: "success" };
    },
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="status" className="text-sm text-ink-muted">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
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
          disabled={pending}
          className="rounded-atelier-lg bg-signal px-4 py-2 text-sm font-semibold text-canvas transition-all duration-200 hover:shadow-signal disabled:opacity-50"
        >
          {pending ? "Updating…" : "Update"}
        </button>
      </div>
      {state.status === "error" ? (
        <p role="alert" className="text-sm text-red-300">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p role="status" className="text-sm text-signal">
          Status saved
        </p>
      ) : null}
    </form>
  );
}
