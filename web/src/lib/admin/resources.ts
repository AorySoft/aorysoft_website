// Resource metadata: the single source of truth driving the generic admin
// CRUD UI (forms, list columns, search) and the server-action validation.
// Field definitions mirror the DB schema (0001_schema.sql); validators in
// validate.ts enforce the same constraints before any query runs.
import {
  validateBoolean,
  validateEnum,
  validateInteger,
  validateOptionalDate,
  validateOptionalText,
  validateOptionalUuid,
  validateRequiredText,
  validateSlug,
  validateStringList,
  type ValidationResult,
} from "./validate";

export const ICON_CHOICES = [
  "bot",
  "zap",
  "bar-chart",
  "cloud",
  "brain",
  "code",
  "database",
  "shield",
] as const;

// Tailwind gradient pairs that exist in the compiled CSS (they also appear
// literally in the public components' fallback data). Arbitrary admin input
// can never inject unknown classes this way.
export const COLOR_CHOICES = [
  "from-blue-600 to-cyan-500",
  "from-purple-600 to-pink-500",
  "from-green-600 to-teal-500",
  "from-orange-600 to-red-500",
  "from-red-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-indigo-500",
  "from-orange-500 to-yellow-500",
  "from-gray-600 to-gray-700",
] as const;

export type FieldKind =
  | "text"
  | "textarea"
  | "slug"
  | "checkbox"
  | "select"
  | "stringList"
  | "date"
  | "number"
  | "categoryRef"
  | "mediaRef";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  maxLength?: number;
  options?: readonly string[];
  help?: string;
  fieldset?: string;
};

export type ResourceKey = "posts" | "categories" | "services" | "jobs";

export const RESOURCE_KEYS: readonly ResourceKey[] = [
  "posts",
  "categories",
  "services",
  "jobs",
];

/** Whitelist resolver for the /admin/[resource] dynamic segment. */
export function resolveResourceKey(raw: string): ResourceKey | null {
  return (RESOURCE_KEYS as readonly string[]).includes(raw)
    ? (raw as ResourceKey)
    : null;
}

export type ResourceDef = {
  key: ResourceKey;
  table: "posts" | "categories" | "services" | "jobs";
  title: string;
  singular: string;
  fields: FieldDef[];
  listColumns: string[];
  searchColumns: string[];
  /** Public routes to revalidate after a save (ISR, plan §8). */
  revalidate: string[];
};

export const resources: Record<ResourceKey, ResourceDef> = {
  categories: {
    key: "categories",
    table: "categories",
    title: "Categories",
    singular: "category",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true, maxLength: 80 },
      { name: "slug", label: "Slug", kind: "slug", required: true },
      {
        name: "description",
        label: "Description",
        kind: "textarea",
        maxLength: 500,
      },
    ],
    listColumns: ["name", "slug", "description"],
    searchColumns: ["name", "slug"],
    revalidate: ["/blog"],
  },
  posts: {
    key: "posts",
    table: "posts",
    title: "Blog Posts",
    singular: "post",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, maxLength: 200, fieldset: "Content" },
      { name: "slug", label: "Slug", kind: "slug", required: true, fieldset: "Content" },
      {
        name: "excerpt",
        label: "Excerpt",
        kind: "textarea",
        maxLength: 500,
        fieldset: "Content",
        help: "Short summary shown in lists (max 500 chars).",
      },
      {
        name: "body_html",
        label: "Body",
        kind: "textarea",
        fieldset: "Content",
        help: "HTML allowed but sanitized on render with a strict allowlist (scripts/event handlers stripped).",
      },
      { name: "author", label: "Author", kind: "text", maxLength: 120, fieldset: "Content" },
      { name: "publish_date", label: "Publish date", kind: "date", fieldset: "Publishing" },
      {
        name: "status",
        label: "Status",
        kind: "select",
        options: ["draft", "published"],
        required: true,
        fieldset: "Publishing",
      },
      { name: "featured", label: "Featured article", kind: "checkbox", fieldset: "Publishing" },
      { name: "category_id", label: "Category", kind: "categoryRef", fieldset: "Publishing" },
      { name: "cover_image_id", label: "Cover image (media library)", kind: "mediaRef", fieldset: "Publishing" },
      { name: "seo_title", label: "SEO title", kind: "text", maxLength: 70, fieldset: "SEO" },
      {
        name: "seo_description",
        label: "SEO description",
        kind: "textarea",
        maxLength: 160,
        fieldset: "SEO",
      },
      { name: "seo_og_image_url", label: "OG image URL", kind: "text", fieldset: "SEO" },
    ],
    listColumns: ["title", "slug", "status", "publish_date"],
    searchColumns: ["title", "slug", "author"],
    revalidate: ["/", "/blog"],
  },
  services: {
    key: "services",
    table: "services",
    title: "Services",
    singular: "service",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
      { name: "subtitle", label: "Subtitle", kind: "text", maxLength: 200 },
      { name: "description", label: "Description", kind: "textarea", maxLength: 4000 },
      {
        name: "features",
        label: "Features",
        kind: "stringList",
        help: "One feature per line.",
      },
      { name: "icon", label: "Icon", kind: "select", options: ICON_CHOICES },
      { name: "color", label: "Color", kind: "select", options: COLOR_CHOICES },
      { name: "sort_order", label: "Sort order", kind: "number" },
      { name: "active", label: "Active (visible on site)", kind: "checkbox" },
    ],
    listColumns: ["title", "subtitle", "sort_order", "active"],
    searchColumns: ["title", "subtitle"],
    revalidate: ["/"],
  },
  jobs: {
    key: "jobs",
    table: "jobs",
    title: "Jobs",
    singular: "job",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
      { name: "department", label: "Department", kind: "text", maxLength: 80 },
      { name: "location", label: "Location", kind: "text", maxLength: 120 },
      {
        name: "type",
        label: "Type",
        kind: "select",
        options: ["full-time", "part-time", "contract", "internship"],
      },
      { name: "experience", label: "Experience", kind: "text", maxLength: 80 },
      { name: "description", label: "Description", kind: "textarea", maxLength: 4000 },
      { name: "requirements", label: "Requirements", kind: "stringList", help: "One requirement per line." },
      {
        name: "responsibilities",
        label: "Responsibilities",
        kind: "stringList",
        help: "One responsibility per line.",
      },
      { name: "active", label: "Active (visible on site)", kind: "checkbox" },
    ],
    listColumns: ["title", "department", "location", "type", "active"],
    searchColumns: ["title", "department", "location"],
    revalidate: ["/", "/careers"],
  },
};

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
        result = validateSlug(raw);
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

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value };
}
