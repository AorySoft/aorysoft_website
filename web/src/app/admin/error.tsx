"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Admin error boundary — no public Navbar/Footer (FRONTEND_AUDIT F03 / N8). */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin-error]", error);
  }, [error]);

  return (
    <main
      id="admin-main"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-canvas px-4 text-ink focus:outline-none"
    >
      <div
        role="alert"
        className="surface-panel w-full max-w-md p-8 text-center"
      >
        <p className="font-display text-5xl text-signal">!</p>
        <h1 className="mt-4 font-display text-2xl text-ink">
          Something went wrong in the admin panel
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Try again. If it keeps happening, note the reference below for
          debugging.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-ink-subtle">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/admin" className="btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
