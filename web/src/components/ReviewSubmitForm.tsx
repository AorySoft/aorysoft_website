"use client";

import { useActionState, useState } from "react";
import TurnstileField from "@/components/TurnstileField";
import HoneypotField from "@/components/HoneypotField";
import { submitReview } from "@/lib/public-forms/actions";
import { idleFormState } from "@/lib/public-forms/state";

type Prefill = {
  displayName?: string;
  email?: string;
  projectOrService?: string;
};

/** Invite-only feedback form. Requires a signed invite token (no public homepage entry). */
export default function ReviewSubmitForm({
  inviteToken,
  prefill,
}: {
  inviteToken: string;
  prefill?: Prefill;
}) {
  const [state, formAction, pending] = useActionState(
    submitReview,
    idleFormState,
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileConfigured = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
  const turnstileMissing = turnstileConfigured && !turnstileToken;
  const fieldError = (name: string) => state.fieldErrors?.[name];
  const describedBy = (name: string) =>
    fieldError(name) ? `review-${name}-error` : undefined;

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="rounded-atelier-lg border border-line bg-surface-raised p-4 text-sm text-ink-muted"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="relative space-y-4">
      <input type="hidden" name="inviteToken" value={inviteToken} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="review-name" className="mb-2 block text-sm text-ink-muted">
            Display name *
          </label>
          <input
            id="review-name"
            name="displayName"
            required
            maxLength={120}
            defaultValue={prefill?.displayName ?? ""}
            className="field-input"
            autoComplete="nickname"
            aria-invalid={Boolean(fieldError("displayName"))}
            aria-describedby={describedBy("displayName")}
          />
          {fieldError("displayName") ? (
            <p id="review-displayName-error" className="mt-1 text-xs text-red-300">
              {fieldError("displayName")}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="review-email" className="mb-2 block text-sm text-ink-muted">
            Email *
          </label>
          <input
            id="review-email"
            name="email"
            type="email"
            required
            maxLength={254}
            defaultValue={prefill?.email ?? ""}
            className="field-input"
            autoComplete="email"
            aria-invalid={Boolean(fieldError("email"))}
            aria-describedby={describedBy("email")}
          />
          {fieldError("email") ? (
            <p id="review-email-error" className="mt-1 text-xs text-red-300">
              {fieldError("email")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="review-rating" className="mb-2 block text-sm text-ink-muted">
            Rating *
          </label>
          <select
            id="review-rating"
            name="rating"
            required
            defaultValue="5"
            className="field-input"
            aria-invalid={Boolean(fieldError("rating"))}
            aria-describedby={describedBy("rating")}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} / 5
              </option>
            ))}
          </select>
          {fieldError("rating") ? (
            <p id="review-rating-error" className="mt-1 text-xs text-red-300">
              {fieldError("rating")}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="review-service" className="mb-2 block text-sm text-ink-muted">
            Project or service
          </label>
          <input
            id="review-service"
            name="projectOrService"
            maxLength={200}
            defaultValue={prefill?.projectOrService ?? ""}
            className="field-input"
            aria-invalid={Boolean(fieldError("projectOrService"))}
            aria-describedby={describedBy("projectOrService")}
          />
          {fieldError("projectOrService") ? (
            <p
              id="review-projectOrService-error"
              className="mt-1 text-xs text-red-300"
            >
              {fieldError("projectOrService")}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="review-text" className="mb-2 block text-sm text-ink-muted">
          Your review *
        </label>
        <textarea
          id="review-text"
          name="reviewText"
          required
          rows={5}
          maxLength={4000}
          className="field-input resize-none"
          aria-invalid={Boolean(fieldError("reviewText"))}
          aria-describedby={describedBy("reviewText")}
        />
        {fieldError("reviewText") ? (
          <p id="review-reviewText-error" className="mt-1 text-xs text-red-300">
            {fieldError("reviewText")}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-muted">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          required
          className="mt-1 rounded-atelier border-line-strong bg-surface-raised text-signal focus:ring-signal"
          aria-invalid={Boolean(fieldError("consent"))}
          aria-describedby={describedBy("consent")}
        />
        <span>
          I consent to AorySoft publishing this review on the website after
          moderation. *
        </span>
      </label>
      {fieldError("consent") ? (
        <p id="review-consent-error" className="text-xs text-red-300">
          {fieldError("consent")}
        </p>
      ) : null}

      <HoneypotField id="review-website" />
      <TurnstileField onTokenChange={setTurnstileToken} />

      {state.status === "error" ? (
        <p role="alert" className="text-sm text-red-300">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || turnstileMissing}
        className="btn-primary"
        aria-busy={pending}
      >
        {pending ? "Sending…" : "Submit review"}
      </button>
      {turnstileMissing ? (
        <p className="text-xs text-ink-muted">Complete the security check to continue.</p>
      ) : null}
    </form>
  );
}
