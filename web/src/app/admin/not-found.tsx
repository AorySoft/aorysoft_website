import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin — not found",
  robots: { index: false, follow: false },
};

/** Admin 404 — no public Navbar/Footer (FRONTEND_AUDIT F03 / N8). */
export default function AdminNotFound() {
  return (
    <main
      id="admin-main"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-canvas px-4 text-ink focus:outline-none"
    >
      <div className="surface-panel w-full max-w-md p-8 text-center">
        <p className="font-display text-5xl text-signal">404</p>
        <h1 className="mt-4 font-display text-2xl text-ink">
          Admin page not found
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          This admin area or record does not exist, or you do not have access
          to it.
        </p>
        <Link href="/admin" className="btn-primary mt-6">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
