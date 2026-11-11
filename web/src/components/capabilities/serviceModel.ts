import type { ServiceRow } from "@/lib/types";

export type VignetteKind =
  | "chat"
  | "agent"
  | "workflow"
  | "insight"
  | "deploy"
  | "build"
  | "schema";

export type Capability = {
  /** Unique per list; titles from the CMS are not guaranteed unique. */
  id: string;
  iconKey: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
};

/** Admin icon choice → the illustrative vignette shown in the switchboard. */
const VIGNETTES: Record<string, VignetteKind> = {
  bot: "chat",
  brain: "agent",
  zap: "workflow",
  "bar-chart": "insight",
  cloud: "deploy",
  shield: "deploy",
  code: "build",
  database: "schema",
};

export function vignetteFor(iconKey: string): VignetteKind {
  return VIGNETTES[iconKey] ?? "build";
}

export function toCapability(row: ServiceRow): Capability {
  return {
    id: row.id,
    iconKey: row.icon ?? "bot",
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    features: Array.isArray(row.features) ? row.features.map(String) : [],
  };
}

/**
 * Maps CMS service rows to UI capabilities.
 *
 * Empty/null CMS results yield an empty list — never silent placeholder
 * catalog copy (FRONTEND_AUDIT F02 / PRODUCT trust rules). Tests may pass
 * `{ placeholders }` to exercise the switchboard without a CMS.
 */
export function toCapabilities(
  rows?: ServiceRow[] | null,
  options?: { placeholders?: Capability[] },
): Capability[] {
  if (rows && rows.length > 0) return rows.map(toCapability);
  return options?.placeholders ?? [];
}

/** First capability whose icon matches the requested keys, in key priority order. */
export function findCapabilityIndex(list: Capability[], keys: readonly string[]): number {
  for (const key of keys) {
    const index = list.findIndex((item) => item.iconKey === key);
    if (index !== -1) return index;
  }
  return -1;
}

export const CAPABILITY_EVENT = "aory:capability";

/** Lets other sections (the hero nodes) open a capability in the switchboard. */
export function requestCapability(keys: readonly string[]) {
  window.dispatchEvent(new CustomEvent(CAPABILITY_EVENT, { detail: { keys } }));
}
