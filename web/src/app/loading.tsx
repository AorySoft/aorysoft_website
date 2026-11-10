export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center px-4 py-20"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-signal"
          aria-hidden="true"
        />
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    </div>
  );
}
