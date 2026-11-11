// Resource metadata: catalog + input validation for admin CRUD.
export {
  ICON_CHOICES,
  COLOR_CHOICES,
  RESOURCE_KEYS,
  REVIEW_SOURCES,
  REVIEW_STATUSES,
  resolveResourceKey,
} from "./resource-types";
export type {
  FieldKind,
  FieldDef,
  ResourceKey,
  ResourceDef,
} from "./resource-types";
export { resources } from "./resource-catalog";
export { validateResourceInput, initialForResourceForm } from "./resource-input";
