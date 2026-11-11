"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import TurnstileField from "@/components/TurnstileField";
import HoneypotField from "@/components/HoneypotField";
import Eyebrow from "@/components/patterns/Eyebrow";
import { useRevealOnView } from "@/components/useRevealOnView";
import { subscribeNewsletter } from "@/lib/public-forms/actions";
import { idleFormState } from "@/lib/public-forms/state";

/** Client island: newsletter subscribe form. */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(
    subscribeNewsletter,
    idleFormState,
  );
  const turnstileConfigured = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileMissing = turnstileConfigured && !turnstileToken;
  const revealRef = useRevealOnView<HTMLDivElement>();

  return (
    <section aria-labelledby="newsletter-title" className="section-y border-t border-line bg-surface">
      <div
        ref={revealRef}
        className="atelier-fade-up shell grid gap-[clamp(1.25rem,4svh,2rem)] lg:grid-cols-12 lg:items-end lg:gap-12"
      >
        <div className="lg:col-span-5">
          <Eyebrow className="mb-[clamp(0.75rem,2svh,1.25rem)]">Newsletter</Eyebrow>
          <h2 id="newsletter-title" className="display-title">
            Notes from the build
          </h2>
          <p className="body-lead mt-[clamp(0.75rem,2.5svh,1.25rem)]">
            Occasional notes on AI, automation, and shipping software. No spam.
          </p>
        </div>
        <div className="space-y-4 lg:col-span-7">
          <form className="flex max-w-xl flex-col gap-4 sm:flex-row" action={formAction}>
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              className="flex-1 rounded-atelier border border-line-strong bg-surface-raised px-6 py-3 text-ink placeholder-ink-subtle focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20"
              aria-invalid={Boolean(state.fieldErrors?.email)}
              aria-describedby={
                state.fieldErrors?.email ? "newsletter-email-error" : undefined
              }
            />
            <button
              type="submit"
              disabled={pending || turnstileMissing}
              aria-busy={pending}
              className={`rounded-atelier bg-signal px-8 py-3 font-semibold text-canvas transition-all duration-300 ${
                pending || turnstileMissing
                  ? "cursor-not-allowed opacity-60"
                  : "hover:shadow-signal"
              }`}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader2
                    className="animate-spin"
                    size={16}
                    aria-hidden="true"
                  />
                  Joining…
                </span>
              ) : (
                "Subscribe"
              )}
            </button>

            <HoneypotField id="newsletter-website" />
            <TurnstileField onTokenChange={setTurnstileToken} />
          </form>

          {state.fieldErrors?.email ? (
            <p
              id="newsletter-email-error"
              className="text-left text-sm text-red-300"
            >
              {state.fieldErrors.email}
            </p>
          ) : null}
          {state.status === "error" && (
            <div
              role="alert"
              className="space-y-1 text-left text-sm text-red-300"
            >
              <p>{state.message}</p>
              {state.fieldErrors &&
                Object.entries(state.fieldErrors)
                  .filter(([field]) => field !== "email")
                  .map(([field, message]) => (
                    <p key={field}>{message}</p>
                  ))}
            </div>
          )}
          {state.status === "success" && (
            <p role="status" className="text-sm text-signal">
              {state.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
