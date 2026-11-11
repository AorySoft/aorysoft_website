"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MediaRow } from "@/lib/types";
import { canDelete, canEdit, type Role } from "@/lib/admin/permissions";
import ConfirmDialog from "@/components/ConfirmDialog";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // matches Supabase free-tier 50 MB cap, tighter default

export default function MediaManager({
  items,
  role,
}: {
  items: MediaRow[];
  role: Role | null;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MediaRow | null>(null);

  const editable = canEdit(role, "media");
  const deletable = canDelete(role, "media");

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const file = fileInput.current?.files?.[0];
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("File is larger than 10 MB.");
      return;
    }

    const supabase = createClient();
    setBusy(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(path);

      // RLS (media_manage policy) gates this insert to admins.
      const { error: insertError } = await supabase.from("media").insert({
        storage_path: path,
        url: publicUrl,
        alt: "",
        width: null,
        height: null,
      });
      if (insertError) throw new Error(insertError.message);

      setMessage(`Uploaded ${file.name}. Add alt text below.`);
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const saveAlt = async (item: MediaRow) => {
    setError(null);
    setMessage(null);
    setBusy(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("media")
      .update({ alt: (altDrafts[item.id] ?? item.alt).slice(0, 300) })
      .eq("id", item.id);
    setBusy(false);
    if (updateError) {
      setError(`Could not save alt text: ${updateError.message}`);
      return;
    }
    setMessage("Alt text saved.");
    router.refresh();
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setMessage("URL copied to clipboard.");
  };

  const removeItem = async () => {
    if (!pendingDelete) return;
    const item = pendingDelete;
    setError(null);
    setBusy(true);
    const supabase = createClient();

    const { error: rowError } = await supabase
      .from("media")
      .delete()
      .eq("id", item.id);
    if (rowError) {
      setBusy(false);
      setError(`Could not delete record: ${rowError.message}`);
      return;
    }

    // Best-effort file removal; a leftover object is harmless and re-uploadable.
    await supabase.storage.from("media").remove([item.storage_path]);
    setBusy(false);
    setPendingDelete(null);
    setMessage("Deleted.");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {editable && (
        <form
          onSubmit={handleUpload}
          className="space-y-3 rounded-atelier-lg border border-line bg-surface/80 p-6"
        >
          <label
            htmlFor="media-file"
            className="block text-sm font-medium text-ink-muted"
          >
            Upload image
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInput}
              id="media-file"
              type="file"
              accept="image/*"
              className="text-sm text-ink-subtle file:mr-4 file:rounded-atelier file:border-0 file:bg-surface-raised file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-atelier-lg bg-signal px-5 py-2 text-sm font-semibold text-canvas transition-all duration-200 hover:shadow-lg hover:shadow-signal disabled:opacity-60"
            >
              {busy ? "Working…" : "Upload"}
            </button>
          </div>
          <p className="text-xs text-ink-subtle">
            Images only, max 10 MB. Uploads go directly to Supabase Storage
            under your session — storage policies only allow admin writes.
          </p>
        </form>
      )}

      {message && (
        <p role="status" className="rounded-atelier-lg border border-signal/30 bg-signal/10 p-3 text-sm text-signal">
          {message}
        </p>
      )}
      {error && !pendingDelete && (
        <p role="alert" className="rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-atelier-lg border border-line bg-surface/80 p-10 text-center">
          <p className="font-medium text-ink">Media library is empty</p>
          <p className="mt-1 text-sm text-ink-subtle">
            Uploaded images appear here and can be attached to posts as cover
            images.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-atelier-lg border border-line bg-surface/80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.alt || "Uploaded media"}
                loading="lazy"
                className="h-40 w-full object-cover"
              />
              <div className="space-y-3 p-4">
                <p className="truncate text-xs text-ink-subtle">
                  {item.storage_path}
                </p>
                {editable && (
                  <div className="space-y-2">
                    <label
                      htmlFor={`alt-${item.id}`}
                      className="text-xs font-medium text-ink-subtle"
                    >
                      Alt text
                    </label>
                    <input
                      id={`alt-${item.id}`}
                      type="text"
                      defaultValue={item.alt}
                      maxLength={300}
                      onChange={(event) =>
                        setAltDrafts({
                          ...altDrafts,
                          [item.id]: event.target.value,
                        })
                      }
                      className="w-full rounded-atelier border border-line bg-surface-raised px-3 py-1.5 text-sm text-ink focus:border-signal focus:outline-none"
                      placeholder="Describe the image"
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {editable && (
                    <button
                      type="button"
                      onClick={() => saveAlt(item)}
                      disabled={busy}
                      className="rounded-atelier bg-surface-raised px-3 py-1.5 text-xs text-ink-muted transition-colors duration-200 hover:bg-surface-raised disabled:opacity-50"
                    >
                      Save alt
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => copyUrl(item.url)}
                    className="rounded-atelier bg-surface-raised px-3 py-1.5 text-xs text-ink-muted transition-colors duration-200 hover:bg-surface-raised"
                  >
                    Copy URL
                  </button>
                  {deletable && (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setPendingDelete(item);
                      }}
                      disabled={busy}
                      aria-label={`Delete ${item.storage_path}`}
                      className="rounded-atelier border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors duration-200 hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Confirm delete"
        message={
          pendingDelete
            ? `Delete ${pendingDelete.storage_path}? Items still referenced by posts will keep a broken reference (on delete set null).`
            : ""
        }
        confirmLabel="Delete"
        pending={busy}
        error={pendingDelete ? error : null}
        onCancel={() => {
          if (!busy) setPendingDelete(null);
        }}
        onConfirm={removeItem}
      />
    </div>
  );
}
