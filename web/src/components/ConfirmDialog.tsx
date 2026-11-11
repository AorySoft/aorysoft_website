"use client";

import { useEffect, useId, useRef } from "react";

function isFocusable(el: HTMLElement | null): el is HTMLElement {
  return Boolean(
    el &&
      el.isConnected &&
      el !== document.body &&
      !el.hasAttribute("disabled"),
  );
}

/**
 * Accessible confirm dialog (FRONTEND_AUDIT F14 / verification R3).
 *
 * - Focus is captured ONCE when the dialog opens and moved to Cancel.
 * - Tab / Shift+Tab wrap inside the dialog; Escape cancels (not while pending).
 * - While `pending`, focus stays on the dialog panel (buttons are disabled).
 * - `error` renders inside the dialog as role="alert" so it is never hidden
 *   behind the overlay; focus returns to Cancel so the user can retry/close.
 * - On close: after Cancel/Escape focus returns to the trigger; after a
 *   successful confirm (the trigger is often removed, e.g. a deleted row)
 *   focus moves to the page's <main> landmark.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pending = false,
  error = null,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const errorId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const confirmedRef = useRef(false);

  // Latest callback/state without re-running the open/close effect.
  const onCancelRef = useRef(onCancel);
  const pendingRef = useRef(pending);
  useEffect(() => {
    onCancelRef.current = onCancel;
    pendingRef.current = pending;
  });

  // Open/close lifecycle — depends on `open` only.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    confirmedRef.current = false;
    cancelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!pendingRef.current) onCancelRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current.contains(active);
      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      const trigger = previouslyFocused.current;
      if (!confirmedRef.current && isFocusable(trigger)) {
        trigger.focus();
        return;
      }
      const main = document.querySelector<HTMLElement>("main");
      if (main) {
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
        main.focus();
      } else if (isFocusable(trigger)) {
        trigger.focus();
      }
    };
  }, [open]);

  // Keep focus inside while the action runs (both buttons are disabled).
  useEffect(() => {
    if (open && pending) panelRef.current?.focus();
  }, [open, pending]);

  // A failed action leaves the dialog open: the next close is not a success.
  useEffect(() => {
    if (open && error && !pending) {
      confirmedRef.current = false;
      cancelRef.current?.focus();
    }
  }, [open, error, pending]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-canvas/80"
        aria-label="Dismiss dialog"
        disabled={pending}
        onClick={() => {
          if (!pending) onCancel();
        }}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={error ? `${descId} ${errorId}` : descId}
        aria-busy={pending || undefined}
        className="relative z-10 w-full max-w-md rounded-atelier-lg border border-line bg-surface p-6 shadow-soft focus:outline-none"
      >
        <h2 id={titleId} className="font-display text-2xl text-ink">
          {title}
        </h2>
        <p id={descId} className="mt-3 text-sm leading-relaxed text-ink-muted">
          {message}
        </p>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-4 rounded-atelier border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            className="btn-secondary"
            disabled={pending}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-atelier bg-red-600 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-red-500 disabled:opacity-50"
            disabled={pending}
            onClick={() => {
              confirmedRef.current = true;
              onConfirm();
            }}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
