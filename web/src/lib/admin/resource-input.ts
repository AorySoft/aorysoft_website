// Validate + normalize form payloads for admin resources.
import {
  validateBoolean,
  validateEnum,
  validateInteger,
  validateOptionalDate,
  validateOptionalText,
  validateOptionalUuid,
  validateRequiredText,
  validateOptionalSlug,
  validateSlug,
  validateStringList,
  type ValidationResult,
} from "./validate";
import {
  faqsToLines,
  parseFaqLines,
  parseProcessStepLines,
  processStepsToLines,
} from "@/lib/services-publish";
import type { ServiceFaq, ServiceProcessStep } from "@/lib/types";
import { resources } from "./resource-catalog";
import type { ResourceKey } from "./resource-types";

/**
 * Validate + normalize an incoming form payload for a resource.
 * Returns the clean row payload or a field->error map.
 */
export function validateResourceInput(
  key: ResourceKey,
  input: Record<string, unknown>,
): { ok: true; value: Record<string, unknown> } | { ok: false; errors: Record<string, string> } {
  const def = resources[key];
  const errors: Record<string, string> = {};
  const value: Record<string, unknown> = {};

  for (const field of def.fields) {
    const raw = input[field.name];
    let result: ValidationResult;

    switch (field.kind) {
      case "slug":
        result =
          key === "services" ? validateOptionalSlug(raw) : validateSlug(raw);
        break;
      case "checkbox":
        result = validateBoolean(raw);
        break;
      case "select":
        result = field.required
          ? validateEnum(raw, field.options ?? [])
          : raw === null || raw === undefined || raw === ""
            ? { ok: true, value: null }
            : validateEnum(raw, field.options ?? []);
        break;
      case "stringList":
        result = validateStringList(raw, 30, 300, field.label);
        break;
      case "number":
        result = validateInteger(raw);
        break;
      case "date":
        result = validateOptionalDate(raw);
        break;
      case "categoryRef":
      case "mediaRef":
        result = validateOptionalUuid(raw);
        break;
      case "textarea":
      case "text":
        result = field.required
          ? validateRequiredText(raw, field.maxLength ?? 10000, field.label)
          : validateOptionalText(raw, field.maxLength ?? 10000, field.label);
        break;
    }

    if (!result.ok) {
      errors[field.name] = result.error;
    } else {
      value[field.name] = result.value;
    }
  }

  if (key === "reviews") {
    const rating = value.rating;
    if (typeof rating === "number" && (rating < 1 || rating > 5)) {
      errors.rating = "Rating must be between 1 and 5.";
    }
    if (value.status === "published" && value.permission_confirmed !== true) {
      errors.permission_confirmed =
        "Confirm display permission before publishing a review.";
    }
  }

  if (key === "services" && Object.keys(errors).length === 0) {
    const processLines = Array.isArray(value.process_steps)
      ? (value.process_steps as string[])
      : [];
    const faqLines = Array.isArray(value.faqs) ? (value.faqs as string[]) : [];
    value.process_steps = parseProcessStepLines(processLines);
    value.faqs = parseFaqLines(faqLines);
    if (!Array.isArray(value.deliverables)) value.deliverables = [];
    if (!Array.isArray(value.technologies)) value.technologies = [];
  }

  if (key === "cases" && Object.keys(errors).length === 0) {
    if (value.status === "published" && !value.published_at) {
      value.published_at = new Date().toISOString().slice(0, 10);
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value };
}

/** Shape DB rows for ResourceForm stringList fields. */
export function initialForResourceForm(
  key: ResourceKey,
  row: Record<string, unknown>,
): Record<string, unknown> {
  if (key !== "services") return row;
  return {
    ...row,
    process_steps: processStepsToLines(
      (row.process_steps as ServiceProcessStep[]) ?? [],
    ),
    faqs: faqsToLines((row.faqs as ServiceFaq[]) ?? []),
  };
}
