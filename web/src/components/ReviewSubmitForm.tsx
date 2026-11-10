"use client";

import { useActionState, useState } from "react";
import TurnstileField from "@/components/TurnstileField";
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
          />
          {state.fieldErrors?.displayName ? (
            <p className="mt-1 text-xs text-red-300">{state.fieldErrors.displayName}</p>
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
          />
          {state.fieldErrors?.email ? (
            <p className="mt-1 text-xs text-red-300">{state.fieldErrors.email}</p>
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
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} / 5
              </option>
            ))}
          </select>
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
          />
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
        />
        {state.fieldErrors?.reviewText ? (
          <p className="mt-1 text-xs text-red-300">{state.fieldErrors.reviewText}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-muted">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          required
          className="mt-1 rounded-atelier border-line-strong bg-surface-raised text-signal focus:ring-signal"
        />
        <span>
          I consent to AorySoft publishing this review on the website after
          moderation. *
        </span>
      </label>
      {state.fieldErrors?.consent ? (
        <p className="text-xs text-red-300">{state.fieldErrors.consent}</p>
      ) : null}

      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="review-website">Website</label>
        <input
          id="review-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

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
