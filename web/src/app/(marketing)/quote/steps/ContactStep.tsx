"use client";

import { motion } from "framer-motion";
import { inputClasses, type QuoteFormData } from "../quoteOptions";

export default function ContactStep({
  formData,
  onChange,
  fieldErrors,
}: {
  formData: QuoteFormData;
  onChange: <K extends keyof QuoteFormData>(
    field: K,
    value: QuoteFormData[K],
  ) => void;
  fieldErrors?: Record<string, string>;
}) {
  const fieldError = (name: string) => fieldErrors?.[name];
  const describedBy = (name: string) =>
    fieldError(name) ? `quote-${name}-error` : undefined;

  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div>
        <h2 className="mb-6 font-display text-2xl text-ink">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="quote-name"
              className="mb-2 block text-sm font-medium text-ink-muted"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="quote-name"
              required
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={inputClasses}
              placeholder="John Doe"
              aria-invalid={Boolean(fieldError("name"))}
              aria-describedby={describedBy("name")}
            />
            {fieldError("name") ? (
              <p id="quote-name-error" className="mt-1 text-sm text-red-300">
                {fieldError("name")}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="quote-email"
              className="mb-2 block text-sm font-medium text-ink-muted"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="quote-email"
              required
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              className={inputClasses}
              placeholder="john@example.com"
              aria-invalid={Boolean(fieldError("email"))}
              aria-describedby={describedBy("email")}
            />
            {fieldError("email") ? (
              <p id="quote-email-error" className="mt-1 text-sm text-red-300">
                {fieldError("email")}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="quote-company"
              className="mb-2 block text-sm font-medium text-ink-muted"
            >
              Company Name
            </label>
            <input
              type="text"
              id="quote-company"
              value={formData.company}
              onChange={(e) => onChange("company", e.target.value)}
              className={inputClasses}
              placeholder="Your Company"
              aria-invalid={Boolean(fieldError("company"))}
              aria-describedby={describedBy("company")}
            />
            {fieldError("company") ? (
              <p id="quote-company-error" className="mt-1 text-sm text-red-300">
                {fieldError("company")}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="quote-phone"
              className="mb-2 block text-sm font-medium text-ink-muted"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="quote-phone"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className={inputClasses}
              placeholder="+1 (555) 123-4567"
              aria-invalid={Boolean(fieldError("phone"))}
              aria-describedby={describedBy("phone")}
            />
            {fieldError("phone") ? (
              <p id="quote-phone-error" className="mt-1 text-sm text-red-300">
                {fieldError("phone")}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
