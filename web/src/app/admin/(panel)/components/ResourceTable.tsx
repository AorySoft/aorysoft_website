"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import type { ResourceDef } from "@/lib/admin/resources";
import { deleteResource, type ActionState } from "@/lib/admin/actions";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  AdminEmptyState,
  AdminTableBody,
  AdminTableHead,
  AdminTableShell,
} from "./AdminTableShell";

type Row = Record<string, unknown>;

const PAGE_SIZE = 20;

function cellText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return `${value.length} item(s)`;
  return String(value);
}

export default function ResourceTable({
  def,
  rows,
  canEdit,
  canDelete,
}: {
  def: ResourceDef;
  rows: Row[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string>(def.listColumns[0]);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const matched = needle
      ? rows.filter((row) =>
          def.searchColumns.some((column) =>
            String(row[column] ?? "").toLowerCase().includes(needle),
          ),
        )
      : rows;

    return [...matched].sort((a, b) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }, [rows, search, sortColumn, sortAsc, def]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (column: string) => {
    if (column === sortColumn) setSortAsc(!sortAsc);
    else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const row = pendingDelete;
    setDeletingId(String(row.id));
    setDeleteError(null);
    const result: ActionState = await deleteResource(def.key, String(row.id));
    setDeletingId(null);
    if (!result.ok) {
      setDeleteError(result.error ?? "Delete failed.");
      return;
    }
    setPendingDelete(null);
    router.refresh();
  };

  const pendingLabel = pendingDelete
    ? String(pendingDelete.title ?? pendingDelete.name ?? pendingDelete.slug ?? "this item")
    : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder={`Search ${def.title.toLowerCase()}…`}
            aria-label={`Search ${def.title}`}
            className="w-full rounded-atelier border border-line bg-surface-raised py-2 pl-9 pr-3 text-sm text-ink placeholder-ink-subtle focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20"
          />
        </div>
        <p className="text-xs text-ink-subtle">
          {filtered.length} of {rows.length}
        </p>
      </div>

      {deleteError && (
        <p
          role="alert"
          className="rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {deleteError}
        </p>
      )}

      {rows.length === 0 ? (
        <AdminEmptyState
          title={`No ${def.title.toLowerCase()} yet`}
          description={
            canEdit
              ? `Create the first ${def.singular}.`
              : "Nothing has been added yet."
          }
        />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title="No matches"
          description="Try a different search term."
        />
      ) : (
        <AdminTableShell>
          <AdminTableHead>
            <tr>
              {def.listColumns.map((column) => (
                <th key={column} scope="col" className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort(column)}
                    className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink"
                  >
                    {column.replace(/_/g, " ")}
                    {sortColumn === column && (
                      <span aria-hidden="true">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </button>
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {visible.map((row) => (
              <tr key={String(row.id)} className="hover:bg-surface/80">
                {def.listColumns.map((column) => (
                  <td key={column} className="max-w-xs truncate px-4 py-3 text-ink-muted">
                    {cellText(row[column])}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-3">
                    {canEdit && (
                      <Link
                        href={`/admin/${def.key}/${String(row.id)}`}
                        className="text-signal transition-colors duration-200 hover:text-signal"
                      >
                        Edit
                      </Link>
                    )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setPendingDelete(row)}
                          disabled={deletingId === String(row.id)}
                          aria-label={`Delete ${String(row.title ?? row.name ?? "item")}`}
                          className="text-ink-subtle transition-colors duration-200 hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </AdminTableBody>
        </AdminTableShell>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-subtle">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-atelier border border-line px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
            disabled={page >= pageCount - 1}
            className="rounded-atelier border border-line px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Confirm delete"
        message={`Delete "${pendingLabel}"? This cannot be undone.`}
        confirmLabel="Delete"
        pending={deletingId !== null}
        onCancel={() => {
          if (deletingId === null) setPendingDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
