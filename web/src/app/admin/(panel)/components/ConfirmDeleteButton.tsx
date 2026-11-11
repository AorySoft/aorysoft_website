"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

/**
 * Reusable confirm-then-delete button. Pass a server action reference plus the
 * row id — never wrap the action in a closure from a Server Component (that
 * cannot be serialized to the client).
 */
export default function ConfirmDeleteButton({
  action,
  id,
  label,
  confirmMessage,
}: {
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
  id: string;
  label: string;
  confirmMessage: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    setError(null);
    const result = await action(id);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Delete failed.");
      return;
    }
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        disabled={pending}
        aria-label={label}
        className="inline-flex items-center gap-1.5 rounded-atelier border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors duration-200 hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && !open && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={open}
        title="Confirm delete"
        message={confirmMessage}
        confirmLabel="Delete"
        pending={pending}
        error={error}
        onCancel={() => {
          if (!pending) setOpen(false);
        }}
        onConfirm={handleConfirm}
      />
    </>
  );
}
