"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Send, Loader2 } from "lucide-react";
import TurnstileField from "@/components/TurnstileField";
import { submitContact } from "@/lib/public-forms/actions";
import { idleFormState } from "@/lib/public-forms/state";

type FormData = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
};

const ContactContent = () => {
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

  return (
    <div>
      <section className="section-y border-b border-line bg-surface">
        <div className="shell max-w-3xl">
          <h1 className="display-title">Contact</h1>
          <p className="body-lead mt-5">
            Tell us about your project or question. We respond through{" "}
            <a
              href="mailto:info@aorysoft.com"
              className="text-signal underline decoration-signal/60 underline-offset-4 hover:decoration-signal"
            >
              info@aorysoft.com
            </a>
            .
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
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
                  />
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
                  />
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
                />
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
                >
                  <option value="">Select a subject</option>
                  <option value="general">General inquiry</option>
                  <option value="project">Project discussion</option>
                  <option value="partnership">Partnership</option>
                  <option value="support">Support</option>
                  <option value="careers">Careers</option>
                </select>
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
                />
              </div>

              <TurnstileField onTokenChange={setTurnstileToken} />

              <div
                aria-hidden="true"
                className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
              >
                <label htmlFor="contact-website">Website</label>
                <input
                  type="text"
                  id="contact-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>

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
                      {Object.entries(state.fieldErrors).map(
                        ([field, message]) => (
                          <li key={field}>{message}</li>
                        ),
                      )}
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

          <aside className="space-y-6">
            <div className="surface-panel p-6 md:p-8">
              <h2 className="font-display text-2xl text-ink">Email</h2>
              <p className="mt-2 text-ink-muted">
                Prefer to write directly? Reach us at{" "}
                <a
                  href="mailto:info@aorysoft.com"
                  className="text-signal underline decoration-signal/60 underline-offset-4 hover:decoration-signal"
                >
                  info@aorysoft.com
                </a>
                . Phone and address will be published once verified.
              </p>
            </div>

            <div className="surface-panel p-6 md:p-8">
              <h2 className="font-display text-2xl text-ink">Need a proposal?</h2>
              <p className="mt-2 text-ink-muted">
                Use the quote form for project type, timeline, and requirements.
              </p>
              <Link href="/quote" className="btn-primary mt-6">
                Get a Quote
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ContactContent;
