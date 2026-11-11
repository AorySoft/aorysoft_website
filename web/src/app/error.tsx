"use client";

import { useEffect } from "react";
import MarketingChromeClient from "@/components/MarketingChromeClient";

/** Global error fallback — wraps chrome because root layout has none. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page-error]", error);
  }, [error]);

  return (
    <MarketingChromeClient>
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
        <p className="font-display text-6xl text-signal">!</p>
        <h1 className="mt-6 font-display text-3xl text-ink">Something went wrong</h1>
        <p className="mt-3 max-w-md text-ink-muted">
          Something went wrong loading this page. Try again, or email
          info@aorysoft.com if it keeps happening.
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-8">
          Try again
        </button>
      </main>
    </MarketingChromeClient>
  );
}
