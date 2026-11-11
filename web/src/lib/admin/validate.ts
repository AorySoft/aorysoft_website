// Server-side validation mirroring the DB CHECK constraints in
// supabase/0001_schema.sql (second validation layer beneath RLS, §5.5).
// Pure functions — covered by vitest.

export type ValidationResult =
  | { ok: true; value: string | number | boolean | string[] | null }
  | { ok: false; error: string };

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Same shape as the DB email CHECK, plus a length cap.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateRequiredText(
  raw: unknown,
  maxLength: number,
  label = "This field",
): ValidationResult {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return { ok: false, error: `${label} is required.` };
  if (value.length > maxLength)
    return {
      ok: false,
      error: `${label} must be at most ${maxLength} characters.`,
    };
  return { ok: true, value };
}

export function validateOptionalText(
  raw: unknown,
  maxLength: number,
  label = "This field",
): ValidationResult {
  if (raw === null || raw === undefined || raw === "")
    return { ok: true, value: null };
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value.length > maxLength)
    return {
      ok: false,
      error: `${label} must be at most ${maxLength} characters.`,
    };
  return { ok: true, value };
}

export function validateSlug(raw: unknown): ValidationResult {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!value) return { ok: false, error: "Slug is required." };
  if (value.length > 200)
    return { ok: false, error: "Slug must be at most 200 characters." };
  if (!SLUG_RE.test(value))
    return {
      ok: false,
      error: "Slug may contain only lowercase letters, numbers and hyphens.",
    };
  return { ok: true, value };
}

/** Optional slug — empty becomes null (service cards without a detail page). */
export function validateOptionalSlug(raw: unknown): ValidationResult {
  if (raw === null || raw === undefined || raw === "")
    return { ok: true, value: null };
  return validateSlug(raw);
}

export function validateEmail(raw: unknown): ValidationResult {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return { ok: false, error: "Email is required." };
  if (value.length > 254 || !EMAIL_RE.test(value))
    return { ok: false, error: "Enter a valid email address." };
  return { ok: true, value };
}

export function validateEnum<T extends string>(
  raw: unknown,
  allowed: readonly T[],
): ValidationResult {
  if (typeof raw === "string" && (allowed as readonly string[]).includes(raw))
    return { ok: true, value: raw };
  return { ok: false, error: `Value must be one of: ${allowed.join(", ")}.` };
}

export function validateBoolean(raw: unknown): ValidationResult {
  // HTML checkboxes submit "on"; forms may also send "true"/"false".
  return {
    ok: true,
    value: raw === true || raw === "true" || raw === "on",
  };
}

export function validateInteger(raw: unknown): ValidationResult {
  if (raw === null || raw === undefined || raw === "")
    return { ok: true, value: 0 };
  const value = Number(raw);
  if (!Number.isInteger(value))
    return { ok: false, error: "Must be a whole number." };
  return { ok: true, value };
}

/** A list of short strings (e.g. service features, job requirements). */
export function validateStringList(
  raw: unknown,
  maxItems: number,
  maxItemLength: number,
  label = "This list",
): ValidationResult {
  let items: unknown[] = [];
  if (Array.isArray(raw)) items = raw;
  else if (typeof raw === "string")
    items = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  else return { ok: false, error: `${label} must be a list of items.` };

  if (items.length > maxItems)
    return { ok: false, error: `${label} may have at most ${maxItems} items.` };

  const cleaned: string[] = [];
  for (const item of items) {
    if (typeof item !== "string")
      return { ok: false, error: `${label} may only contain text items.` };
    const value = item.trim();
    if (!value) continue;
    if (value.length > maxItemLength)
      return {
        ok: false,
        error: `Each ${label.toLowerCase()} item may be at most ${maxItemLength} characters.`,
      };
    cleaned.push(value);
  }
  return { ok: true, value: cleaned };
}

/** Optional uuid reference (e.g. category_id, cover_image_id). */
export function validateOptionalUuid(raw: unknown): ValidationResult {
  if (raw === null || raw === undefined || raw === "") return { ok: true, value: null };
  const value = String(raw);
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(value)) return { ok: false, error: "Invalid reference." };
  return { ok: true, value };
}

/** Optional ISO date (YYYY-MM-DD), matching the DB `date` column. */
export function validateOptionalDate(raw: unknown): ValidationResult {
  if (raw === null || raw === undefined || raw === "") return { ok: true, value: null };
  const value = String(raw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)))
    return { ok: false, error: "Use the format YYYY-MM-DD." };
  return { ok: true, value };
}
