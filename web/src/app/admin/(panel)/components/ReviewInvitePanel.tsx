"use client";

import { useState, useTransition } from "react";
import { createReviewInvite } from "@/lib/admin/review-invites";

export default function ReviewInvitePanel() {
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    setCopied(false);
    setUrl(null);
    startTransition(async () => {
      const result = await createReviewInvite({
        label: String(formData.get("label") ?? ""),
        clientName: String(formData.get("clientName") ?? ""),
        clientEmail: String(formData.get("clientEmail") ?? ""),
        projectOrService: String(formData.get("projectOrService") ?? ""),
        daysValid: Number(formData.get("daysValid") ?? 30),
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setUrl(result.url);
    });
  }

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-atelier-lg border border-line bg-surface-raised p-5">
      <h2 className="text-base font-semibold text-ink">Client feedback invite</h2>
      <p className="mt-2 text-sm text-ink-muted">
        After a project wraps, create a private link and send it to the client.
        There is no public feedback form on the website.
      </p>

      <form
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
      >
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-ink-muted" htmlFor="invite-label">
            Internal label
          </label>
          <input
            id="invite-label"
            name="label"
            placeholder="Acme — website rebuild"
            maxLength={200}
            className="field-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted" htmlFor="invite-name">
            Client name (prefill)
          </label>
          <input id="invite-name" name="clientName" maxLength={120} className="field-input" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted" htmlFor="invite-email">
            Client email (prefill)
          </label>
          <input
            id="invite-email"
            name="clientEmail"
            type="email"
            maxLength={254}
            className="field-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted" htmlFor="invite-project">
            Project / service (prefill)
          </label>
          <input
            id="invite-project"
            name="projectOrService"
            maxLength={200}
            className="field-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted" htmlFor="invite-days">
            Valid for (days)
          </label>
          <input
            id="invite-days"
            name="daysValid"
            type="number"
            min={1}
            max={90}
            defaultValue={30}
            className="field-input"
          />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={pending} aria-busy={pending}>
            {pending ? "Creating…" : "Create invite link"}
          </button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {url ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-ink-muted">Share this one-time link with the client:</p>
          <code className="block break-all rounded-atelier border border-line bg-canvas px-3 py-2 text-xs text-ink">
            {url}
          </code>
          <button type="button" className="btn-secondary" onClick={copyLink}>
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
