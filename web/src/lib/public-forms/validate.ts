// Server-side validation for the PUBLIC form pipeline (plan §7).
// Mirrors the DB CHECK constraints in supabase/0001_schema.sql so bad input
// is rejected before it ever reaches Postgres (the CHECKs are the second
// layer beneath this). Pure functions — no I/O — covered by vitest.
//
// Distinct from lib/admin/validate.ts: that module backs the authenticated
// admin CRUD. These are the untrusted, anonymous-visitor entry points, so the
// caps here are deliberately tight and every value is trimmed and normalised.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type FieldError = { field: string; message: string };
export type ValidResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: FieldError[] };

function fail(field: string, message: string): { ok: false; errors: FieldError[] } {
  return { ok: false, errors: [{ field, message }] };
}

/**
 * Reads the value of a result known to have succeeded.
 *
 * Both validators collect EVERY failure first and only assemble the value
 * after `errors.length === 0`, so the throw is unreachable. It exists because
 * push-then-check cannot narrow a union the way an early return can, and an
 * early return per field would abandon the collect-all-errors behaviour the UI
 * depends on.
 */
function valueOf<T>(
  result: { ok: true; value: T } | { ok: false },
  field: string,
): T {
  if (!result.ok) throw new Error(`unexpected invalid field: ${field}`);
  return result.value;
}

/** Required text, trimmed, with a hard length cap. */
export function requiredText(
  raw: unknown,
  maxLength: number,
  field: string,
  label = "This field",
): { ok: true; value: string } | { ok: false; errors: FieldError[] } {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return fail(field, `${label} is required.`);
  if (value.length > maxLength)
    return fail(field, `${label} must be at most ${maxLength} characters.`);
  return { ok: true, value };
}

/** Optional text, trimmed; empty becomes null. */
export function optionalText(
  raw: unknown,
  maxLength: number,
  field: string,
  label = "This field",
): { ok: true; value: string | null } | { ok: false; errors: FieldError[] } {
  if (raw === null || raw === undefined) return { ok: true, value: null };
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return { ok: true, value: null };
  if (value.length > maxLength)
    return fail(field, `${label} must be at most ${maxLength} characters.`);
  return { ok: true, value };
}

/** Email, trimmed + lowercased, matching the DB email CHECK shape. */
export function validEmail(
  raw: unknown,
  field = "email",
): { ok: true; value: string } | { ok: false; errors: FieldError[] } {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!value) return fail(field, "Email is required.");
  if (value.length > 254 || !EMAIL_RE.test(value))
    return fail(field, "Enter a valid email address.");
  return { ok: true, value };
}

/** Value must be one of a fixed set (mirrors the DB enum CHECK). */
export function oneOf<T extends string>(
  raw: unknown,
  allowed: readonly T[],
  field: string,
): { ok: true; value: T } | { ok: false; errors: FieldError[] } {
  if (typeof raw === "string" && (allowed as readonly string[]).includes(raw))
    return { ok: true, value: raw as T };
  return fail(field, `Value must be one of: ${allowed.join(", ")}.`);
}

export const CONTACT_SUBJECTS = [
  "general",
  "project",
  "partnership",
  "support",
  "careers",
] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const QUOTE_SCALABILITY = ["low", "medium", "high", "not_sure"] as const;

export type ContactInput = {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
};

export type ValidContact = {
  type: "contact";
  name: string;
  email: string;
  company: string | null;
  service: string;
  message: string;
};

/**
 * Validates the contact form. Collects EVERY error so the UI can highlight
 * all bad fields at once rather than making the visitor resubmit repeatedly.
 */
export function validateContactForm(
  input: unknown,
): ValidResult<ValidContact> {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: FieldError[] = [];

  const name = requiredText(raw.name, 120, "name", "Full name");
  if (!name.ok) errors.push(...name.errors);

  const email = validEmail(raw.email);
  if (!email.ok) errors.push(...email.errors);

  const company = optionalText(raw.company, 120, "company", "Company name");
  if (!company.ok) errors.push(...company.errors);

  const subject = oneOf(raw.subject, CONTACT_SUBJECTS, "subject");
  if (!subject.ok) errors.push(...subject.errors);

  // Message is the free-text body — capped far below the DB's 10 000 so an
  // oversized paste fails fast in the app layer with a friendly message.
  const message = requiredText(raw.message, 5000, "message", "Message");
  if (!message.ok) errors.push(...message.errors);

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      type: "contact",
      name: valueOf(name, "name"),
      email: valueOf(email, "email"),
      company: valueOf(company, "company"),
      service: valueOf(subject, "subject"),
      message: valueOf(message, "message"),
    },
  };
}

export type QuoteInput = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
  technologies?: string[];
  integrations?: string[];
  scalability?: string;
  additionalNotes?: string;
};

export type ValidQuote = {
  type: "quote";
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service: string;
  message: string;
  details: {
    projectType: string;
    budget: string;
    timeline: string;
    description: string;
    technologies: string[];
    integrations: string[];
    scalability: string | null;
    additionalNotes: string | null;
  };
};

const MAX_LIST_ITEMS = 20;
const MAX_LIST_ITEM = 60;

/** Normalises a string[] pick-list: trims, drops empties, caps both counts. */
function cleanList(
  raw: unknown,
  field: string,
): { ok: true; value: string[] } | { ok: false; errors: FieldError[] } {
  if (raw === null || raw === undefined) return { ok: true, value: [] };
  if (!Array.isArray(raw))
    return fail(field, "Selections must be a list of options.");
  if (raw.length > MAX_LIST_ITEMS)
    return fail(field, `Choose at most ${MAX_LIST_ITEMS} options.`);

  const cleaned: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string")
      return fail(field, "Selections may only contain text options.");
    const value = item.trim();
    if (!value) continue;
    if (value.length > MAX_LIST_ITEM)
      return fail(field, `Each option may be at most ${MAX_LIST_ITEM} characters.`);
    cleaned.push(value);
  }
  return { ok: true, value: cleaned };
}

export type ValidReview = {
  displayName: string;
  email: string;
  reviewText: string;
  rating: number;
  projectOrService: string | null;
  consent: true;
};

/** Public review submission (lands as pending until admin publishes). */
export function validateReviewForm(input: unknown): ValidResult<ValidReview> {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: FieldError[] = [];

  const displayName = requiredText(
    raw.displayName,
    120,
    "displayName",
    "Display name",
  );
  if (!displayName.ok) errors.push(...displayName.errors);

  const email = validEmail(raw.email);
  if (!email.ok) errors.push(...email.errors);

  const reviewText = requiredText(
    raw.reviewText,
    4000,
    "reviewText",
    "Review",
  );
  if (!reviewText.ok) errors.push(...reviewText.errors);

  const projectOrService = optionalText(
    raw.projectOrService,
    200,
    "projectOrService",
    "Project or service",
  );
  if (!projectOrService.ok) errors.push(...projectOrService.errors);

  const ratingRaw =
    typeof raw.rating === "string" || typeof raw.rating === "number"
      ? Number(raw.rating)
      : NaN;
  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    errors.push({ field: "rating", message: "Choose a rating from 1 to 5." });
  }

  const consent =
    raw.consent === "yes" || raw.consent === "on" || raw.consent === true;
  if (!consent) {
    errors.push({
      field: "consent",
      message: "Consent to publish is required.",
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      displayName: valueOf(displayName, "displayName"),
      email: valueOf(email, "email"),
      reviewText: valueOf(reviewText, "reviewText"),
      rating: ratingRaw,
      projectOrService: valueOf(projectOrService, "projectOrService"),
      consent: true,
    },
  };
}

export function validateQuoteForm(input: unknown): ValidResult<ValidQuote> {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: FieldError[] = [];

  const name = requiredText(raw.name, 120, "name", "Full name");
  if (!name.ok) errors.push(...name.errors);

  const email = validEmail(raw.email);
  if (!email.ok) errors.push(...email.errors);

  const company = optionalText(raw.company, 120, "company", "Company name");
  if (!company.ok) errors.push(...company.errors);

  const phone = optionalText(raw.phone, 40, "phone", "Phone number");
  if (!phone.ok) errors.push(...phone.errors);

  const projectType = requiredText(
    raw.projectType,
    120,
    "projectType",
    "Project type",
  );
  if (!projectType.ok) errors.push(...projectType.errors);

  const budget = requiredText(raw.budget, 120, "budget", "Budget");
  if (!budget.ok) errors.push(...budget.errors);

  const timeline = requiredText(raw.timeline, 120, "timeline", "Timeline");
  if (!timeline.ok) errors.push(...timeline.errors);

  const description = requiredText(
    raw.description,
    5000,
    "description",
    "Project description",
  );
  if (!description.ok) errors.push(...description.errors);

  const technologies = cleanList(raw.technologies, "technologies");
  if (!technologies.ok) errors.push(...technologies.errors);

  const integrations = cleanList(raw.integrations, "integrations");
  if (!integrations.ok) errors.push(...integrations.errors);

  let scalability: string | null = null;
  if (raw.scalability !== undefined && raw.scalability !== null && raw.scalability !== "") {
    const parsed = oneOf(raw.scalability, QUOTE_SCALABILITY, "scalability");
    if (!parsed.ok) errors.push(...parsed.errors);
    else scalability = parsed.value;
  }

  const additionalNotes = optionalText(
    raw.additionalNotes,
    5000,
    "additionalNotes",
    "Additional notes",
  );
  if (!additionalNotes.ok) errors.push(...additionalNotes.errors);

  if (errors.length > 0) return { ok: false, errors };

  // The quote becomes a submission whose `service` is the project type, so the
  // admin inbox can filter quote requests the same way as contact subjects.
  return {
    ok: true,
    value: {
      type: "quote",
      name: valueOf(name, "name"),
      email: valueOf(email, "email"),
      company: valueOf(company, "company"),
      phone: valueOf(phone, "phone"),
      service: valueOf(projectType, "projectType"),
      message: valueOf(description, "description"),
      details: {
        projectType: valueOf(projectType, "projectType"),
        budget: valueOf(budget, "budget"),
        timeline: valueOf(timeline, "timeline"),
        description: valueOf(description, "description"),
        technologies: valueOf(technologies, "technologies"),
        integrations: valueOf(integrations, "integrations"),
        scalability,
        additionalNotes: valueOf(additionalNotes, "additionalNotes"),
      },
    },
  };
}
