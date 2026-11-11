import type { ReactNode } from "react";

/**
 * Shared chrome for admin data tables (resources, submissions, newsletter, users).
 * Keeps border/radius/token classes consistent (FRONTEND_AUDIT F37).
 */
export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-atelier-lg border border-line">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-surface text-xs uppercase text-ink-subtle">{children}</thead>
  );
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-line bg-canvas/50">{children}</tbody>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-atelier-lg border border-line bg-surface/80 p-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-subtle">{description}</p>
    </div>
  );
}
