import type { QuoteFormData } from "./quoteOptions";

/**
 * Copies React-controlled wizard values into FormData. Honeypot + Turnstile
 * must already be present on `form` (DOM fields inside the <form>).
 */
export function buildQuotePayload(
  form: HTMLFormElement,
  formData: QuoteFormData,
): FormData {
  const payload = new FormData(form);
  for (const field of [
    "name",
    "email",
    "company",
    "phone",
    "projectType",
    "budget",
    "timeline",
    "description",
    "scalability",
    "additionalNotes",
  ] as const) {
    payload.set(field, formData[field] ?? "");
  }
  for (const value of formData.technologies) payload.append("technologies", value);
  for (const value of formData.integrations) payload.append("integrations", value);
  return payload;
}
