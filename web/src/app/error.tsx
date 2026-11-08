"use client";

// Global error boundary for the public pages. A render failure shows an honest
// message with a retry, instead of the framework's blank crash screen. Admin
// routes have their own handling and are not affected by this file.
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for local debugging; a real deployment can wire this to
    // an error reporter. The digest is the server-side correlation id.
    console.error("[page-error]", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        !
      </p>
      <h1 className="mt-6 text-3xl font-bold text-white">Something went wrong</h1>
      <p className="mt-3 max-w-md text-gray-400">
        We hit an unexpected error loading this page. Please try again — if it
        keeps happening, contact us at info@aorysoft.com.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
      >
        Try again
      </button>
    </main>
  );
}
