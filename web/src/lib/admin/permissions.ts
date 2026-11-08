// Permission matrix from plan §5.5, enforced here for UX + defense-in-depth.
// RLS in the database is the REAL enforcement — these helpers give honest
// error messages and hide actions the caller could not perform anyway.
//
// Conservative reading of the matrix:
//   owner  = everything, including all deletions, users/roles, site settings,
//            newsletter subscriber management.
//   editor = create/edit on content areas (posts, categories, services, jobs,
//            media) plus submission status transitions; NO deletions, NO
//            users/roles, NO site settings, NO newsletter subscriber access.
// (Loosening "editor can delete content" is an owner decision on request.)

export type Role = "owner" | "editor";

export type Area =
  | "posts"
  | "categories"
  | "services"
  | "jobs"
  | "media"
  | "submissions"
  | "newsletter"
  | "settings"
  | "users";

const EDITOR_AREAS: ReadonlySet<Area> = new Set([
  "posts",
  "categories",
  "services",
  "jobs",
  "media",
  "submissions",
]);

/** Can the role see this area at all? */
export function canView(role: Role | null, area: Area): boolean {
  if (!role) return false;
  if (role === "owner") return true;
  return EDITOR_AREAS.has(area);
}

/** Can the role create/update rows in this area? */
export function canEdit(role: Role | null, area: Area): boolean {
  if (!role) return false;
  if (role === "owner") return true;
  return EDITOR_AREAS.has(area);
}

/** Can the role delete rows/files in this area? Owner-only, everywhere. */
export function canDelete(role: Role | null, area: Area): boolean {
  void area; // reserved for per-area delete policy; today owner-only everywhere
  return role === "owner";
}
