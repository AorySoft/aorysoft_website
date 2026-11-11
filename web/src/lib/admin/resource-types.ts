// Admin resource types and whitelist constants.
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

export type ResourceKey =
  | "posts"
  | "categories"
  | "services"
  | "jobs"
  | "reviews"
  | "cases";

export const RESOURCE_KEYS: readonly ResourceKey[] = [
  "posts",
  "categories",
  "services",
  "jobs",
  "reviews",
  "cases",
];

export const REVIEW_SOURCES = [
  "fiverr",
  "google",
  "linkedin",
  "website",
  "email",
  "other",
] as const;

export const REVIEW_STATUSES = [
  "draft",
  "pending",
  "published",
  "archived",
] as const;

/** Whitelist resolver for the /admin/[resource] dynamic segment. */
export function resolveResourceKey(raw: string): ResourceKey | null {
  return (RESOURCE_KEYS as readonly string[]).includes(raw)
    ? (raw as ResourceKey)
    : null;
}

export type ResourceDef = {
  key: ResourceKey;
  table:
    | "posts"
    | "categories"
    | "services"
    | "jobs"
    | "reviews"
    | "case_studies";
  title: string;
  singular: string;
  fields: FieldDef[];
  listColumns: string[];
  searchColumns: string[];
  /** Public routes to revalidate after a save (ISR, plan §8). */
  revalidate: string[];
};

