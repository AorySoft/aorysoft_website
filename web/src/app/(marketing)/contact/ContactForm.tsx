"use client";

import { useActionState, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import TurnstileField from "@/components/TurnstileField";
import HoneypotField from "@/components/HoneypotField";
import { submitContact } from "@/lib/public-forms/actions";
import { idleFormState } from "@/lib/public-forms/state";

type FormData = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
};

/** Client island: contact form only (Turnstile + controlled fields). */
export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [state, formAction, pending] = useActionState(
    submitContact,
    idleFormState,
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const turnstileConfigured = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
  const turnstileMissing = turnstileConfigured && !turnstileToken;
  const fieldError = (name: string) => state.fieldErrors?.[name];
  const describedBy = (name: string) =>
    fieldError(name) ? `${name}-error` : undefined;

  return (
    <div className="surface-panel p-6 md:p-8">
      <h2 className="font-display text-2xl text-ink md:text-3xl">
        Send a message
      </h2>
      <form action={formAction} className="relative mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-ink-muted"
            >
              Full name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="field-input"
              placeholder="Your name"
              aria-invalid={Boolean(fieldError("name"))}
              aria-describedby={describedBy("name")}
            />
            {fieldError("name") ? (
              <p id="name-error" className="mt-1 text-sm text-red-300">
                {fieldError("name")}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-ink-muted"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="field-input"
              placeholder="you@company.com"
              aria-invalid={Boolean(fieldError("email"))}
              aria-describedby={describedBy("email")}
            />
            {fieldError("email") ? (
              <p id="email-error" className="mt-1 text-sm text-red-300">
                {fieldError("email")}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="company"
            className="mb-2 block text-sm font-medium text-ink-muted"
          >
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="field-input"
            placeholder="Your company"
            aria-invalid={Boolean(fieldError("company"))}
            aria-describedby={describedBy("company")}
          />
          {fieldError("company") ? (
            <p id="company-error" className="mt-1 text-sm text-red-300">
              {fieldError("company")}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="subject"
            className="mb-2 block text-sm font-medium text-ink-muted"
          >
            Subject *
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleInputChange}
            className="field-input"
            aria-invalid={Boolean(fieldError("subject"))}
            aria-describedby={describedBy("subject")}
          >
            <option value="">Select a subject</option>
            <option value="general">General inquiry</option>
            <option value="project">Project discussion</option>
            <option value="partnership">Partnership</option>
            <option value="support">Support</option>
            <option value="careers">Careers</option>
          </select>
          {fieldError("subject") ? (
            <p id="subject-error" className="mt-1 text-sm text-red-300">
              {fieldError("subject")}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-ink-muted"
          >
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            className="field-input resize-none"
            placeholder="Tell us about your project…"
            aria-invalid={Boolean(fieldError("message"))}
            aria-describedby={describedBy("message")}
          />
          {fieldError("message") ? (
            <p id="message-error" className="mt-1 text-sm text-red-300">
              {fieldError("message")}
            </p>
          ) : null}
        </div>

        <TurnstileField onTokenChange={setTurnstileToken} />
        <HoneypotField id="contact-website" />

        <button
          type="submit"
          disabled={pending || turnstileMissing}
          aria-busy={pending}
          className="btn-primary w-full"
        >
          {pending ? (
            <>
              <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              <span>Sending…</span>
            </>
          ) : (
            <>
              <Send size={18} aria-hidden="true" />
              <span>Send message</span>
            </>
          )}
        </button>

        {turnstileMissing ? (
          <p className="text-sm text-amber-300">
            Completing the security check is required before sending.
          </p>
        ) : null}

        {state.status === "error" ? (
          <div
            role="alert"
            className="space-y-1 rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            <p>{state.message}</p>
            {state.fieldErrors ? (
              <ul className="list-inside list-disc space-y-1">
                {Object.entries(state.fieldErrors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {state.status === "success" ? (
          <p
            role="status"
            className="rounded-atelier-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
