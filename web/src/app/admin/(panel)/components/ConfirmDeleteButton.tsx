"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

/**
 * Reusable confirm-then-delete button. The `remove` prop is a bound server
 * action that must return { ok, error? }.
 */
export default function ConfirmDeleteButton({
  remove,
  label,
  confirmMessage,
}: {
  remove: () => Promise<{ ok: boolean; error?: string }>;
  label: string;
  confirmMessage: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!window.confirm(confirmMessage)) return;
    setPending(true);
    setError(null);
    const result = await remove();
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Delete failed.");
      return;
    }
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label={label}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-300 transition-colors duration-200 hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </>
  );
}
