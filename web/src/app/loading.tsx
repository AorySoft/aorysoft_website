// Route-level loading UI for the public pages (App Router suspense fallback).
// Shown while server components stream their data (blog list, careers, etc.).
export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center px-4 py-20"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-cyan-400"
          aria-hidden="true"
        />
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    </div>
  );
}
