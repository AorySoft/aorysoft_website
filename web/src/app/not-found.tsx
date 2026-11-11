import type { Metadata } from "next";
import Link from "next/link";
import MarketingShell from "@/components/MarketingShell";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** Global unmatched-URL fallback — root layout has no chrome, so wrap here. */
export default function NotFound() {
  return (
    <MarketingShell>
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
        <p className="font-display text-7xl text-signal">404</p>
        <h1 className="mt-6 font-display text-3xl text-ink">Page not found</h1>
        <p className="mt-3 max-w-md text-ink-muted">
          The page you are looking for doesn&apos;t exist or may have moved.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Back to home
        </Link>
      </main>
    </MarketingShell>
  );
}
