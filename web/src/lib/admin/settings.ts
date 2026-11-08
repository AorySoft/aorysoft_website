// Validation for the site_settings JSONB payload (owner-only area).
// Pure functions — covered by vitest. Conservative caps prevent unbounded
// rows and keep rendered content sane.
import type { SiteSettingsData } from "@/lib/types";

export type SettingsValidation =
  | { ok: true; value: SiteSettingsData }
  | { ok: false; error: string };

const MAX_LIST = 30;

function cleanString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length > max) return null;
  return trimmed;
}

function validatePairs(
  value: unknown,
  keyA: string,
  keyB: string,
): { title: string; description: string }[] | { name: string; category: string }[] | null {
  if (!Array.isArray(value) || value.length > MAX_LIST) return null;
  const out: Record<string, string>[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const record = item as Record<string, unknown>;
    const a = cleanString(record[keyA], 200);
    const b = cleanString(record[keyB], 400);
    if (a === null || b === null) return null;
    out.push({ [keyA]: a, [keyB]: b });
  }
  return out as never;
}

export function validateSettings(input: unknown): SettingsValidation {
  if (typeof input !== "object" || input === null)
    return { ok: false, error: "Settings payload must be an object." };

  const raw = input as Record<string, unknown>;
  const value: SiteSettingsData = {};

  const scalars: [keyof SiteSettingsData, number][] = [
    ["heroBadge", 120],
    ["heroTitleLine1", 200],
    ["heroTitleLine2", 200],
    ["heroSubtitle", 600],
    ["aboutHeading", 200],
    ["aboutText", 2000],
    ["ctaTitle", 200],
    ["ctaText", 600],
    ["footerEmail", 254],
    ["footerPhone", 40],
    ["footerAddress", 300],
  ];

  for (const [key, max] of scalars) {
    if (raw[key] === undefined) continue;
    const cleaned = cleanString(raw[key], max);
    if (cleaned === null)
      return { ok: false, error: `"${key}" must be text of at most ${max} characters.` };
    (value as Record<string, unknown>)[key as string] = cleaned;
  }

  if (raw.industries !== undefined) {
    const industries = validatePairs(raw.industries, "title", "description");
    if (industries === null)
      return {
        ok: false,
        error:
          '"industries" must be a list of up to 30 {title, description} entries with short text values.',
      };
    value.industries = industries as SiteSettingsData["industries"];
  }

  if (raw.technologies !== undefined) {
    const technologies = validatePairs(raw.technologies, "name", "category");
    if (technologies === null)
      return {
        ok: false,
        error:
          '"technologies" must be a list of up to 30 {name, category} entries with short text values.',
      };
    value.technologies = technologies as SiteSettingsData["technologies"];
  }

  if (raw.socialLinks !== undefined) {
    if (!Array.isArray(raw.socialLinks) || raw.socialLinks.length > 10)
      return { ok: false, error: '"socialLinks" must be a list of up to 10 entries.' };
    const links: { label: string; url: string }[] = [];
    for (const item of raw.socialLinks) {
      if (typeof item !== "object" || item === null)
        return { ok: false, error: "Each social link must be an object." };
      const record = item as Record<string, unknown>;
      const label = cleanString(record.label, 60);
      const url = cleanString(record.url, 500);
      if (!label || !url || !/^https?:\/\//i.test(url))
        return {
          ok: false,
          error: "Each social link needs a label and an http(s) URL.",
        };
      links.push({ label, url });
    }
    value.socialLinks = links;
  }

  return { ok: true, value };
}
