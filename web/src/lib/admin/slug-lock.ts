import {
  isServiceDetailPublished,
  normalizeDeliverables,
} from "@/lib/services-publish";
import type { ResourceKey } from "./resource-types";

/**
 * Slug lock rule (decision: "locked once the page has been published").
 *
 * Only services and case studies have locked slugs. A slug locks the first
 * time the row meets its public threshold and stays locked even if the row is
 * later unpublished, so a URL crawlers have seen never changes:
 *   - services: active + slug + overview + ≥4 deliverables (detail page live)
 *   - cases:    status = published (+ slug)
 * The DB records the moment in `slug_locked_at` (migration 0016 trigger); the
 * threshold check also covers rows saved before that migration is applied.
 * Posts and categories stay editable.
 */
export const SLUG_LOCK_RESOURCES: ReadonlySet<ResourceKey> = new Set([
  "services",
  "cases",
]);

export const SLUG_LOCKED_MESSAGE =
  "This slug is locked because the page has been published. Public URLs do not change.";

export function meetsPublishThreshold(
  key: ResourceKey,
  row: Record<string, unknown>,
): boolean {
  const slug = typeof row.slug === "string" ? row.slug.trim() : "";
  if (!slug) return false;
  if (key === "services") {
    return isServiceDetailPublished({
      active: row.active === true,
      slug,
      description: typeof row.description === "string" ? row.description : null,
      deliverables: normalizeDeliverables(row.deliverables),
    });
  }
  if (key === "cases") return row.status === "published";
  return false;
}

/** Is the stored row's slug locked? (Pass the row as it is in the DB.) */
export function isSlugLocked(
  key: ResourceKey,
  row: Record<string, unknown> | null | undefined,
): boolean {
  if (!row || !SLUG_LOCK_RESOURCES.has(key)) return false;
  if (row.slug_locked_at) return true;
  return meetsPublishThreshold(key, row);
}

type DbError = { code?: string; message?: string; details?: string };

/**
 * Map known save errors to a friendly field error instead of the raw DB
 * message: duplicate slugs (unique violation) and the 0016 lock trigger.
 * Returns null for anything else.
 */
export function friendlySlugError(
  error: DbError | null | undefined,
  singular: string,
): Record<string, string> | null {
  if (!error) return null;
  const text = `${error.message ?? ""} ${error.details ?? ""}`;
  if (error.code === "23505" && /slug/i.test(text)) {
    return {
      slug: `That slug is already used by another ${singular.toLowerCase()}. Choose a different one.`,
    };
  }
  if (/slug_locked/i.test(text)) {
    return { slug: SLUG_LOCKED_MESSAGE };
  }
  return null;
}
