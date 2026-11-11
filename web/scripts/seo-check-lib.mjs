// Pure helpers for scripts/check-indexable-pages.mjs (unit-tested in
// src/lib/seo/seo-check-lib.test.ts). No I/O here.

/** @param {string} html @param {RegExp} pattern */
export function extract(html, pattern) {
  const match = html.match(pattern);
  return match?.[1]?.trim() || "";
}

/** Decode the few entities Next emits in <title>/<meta content>. */
export function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Normalize a URL or path to a comparable pathname ("" → "/", no trailing slash). */
export function normalizePath(urlOrPath) {
  let path = urlOrPath;
  try {
    path = new URL(urlOrPath, "http://placeholder.local").pathname;
  } catch {
    // keep as-is
  }
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

/**
 * Read plain string-literal constants from src/lib/site.ts source text.
 * @param {string} source
 * @returns {{ defaultTitle: string, defaultDescription: string }}
 */
export function readSiteDefaults(source) {
  const read = (name) => {
    const match = source.match(
      new RegExp(`export const ${name}\\s*=\\s*\\n?\\s*"([^"]+)"`),
    );
    return match?.[1] ?? "";
  };
  return {
    defaultTitle: read("SITE_DEFAULT_TITLE"),
    defaultDescription: read("SITE_DESCRIPTION"),
  };
}

/**
 * Content checks for one sitemap URL's HTML response.
 * @param {{ path: string, html: string, xRobotsTag?: string | null,
 *           defaults: { defaultTitle: string, defaultDescription: string } }} input
 * @returns {string[]} failure messages (empty = pass)
 */
export function checkPageContent({ path, html, xRobotsTag, defaults }) {
  const failures = [];
  const title = decodeEntities(extract(html, /<title[^>]*>([^<]*)<\/title>/i));
  const description = decodeEntities(
    extract(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      extract(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i),
  );
  const canonical =
    extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) ||
    extract(html, /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
  const robotsMetas = [
    ...html.matchAll(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/gi),
  ].map((m) => m[1].toLowerCase());
  const h1 = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "").trim();
  const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);

  if (!title) failures.push(`${path}: missing <title>`);
  else if (path !== "/" && defaults.defaultTitle && title === defaults.defaultTitle) {
    failures.push(`${path}: <title> is the site default — set a page title`);
  }

  if (!description) failures.push(`${path}: missing meta description`);
  else if (defaults.defaultDescription && description === defaults.defaultDescription && path !== "/") {
    failures.push(`${path}: meta description is the site default — set a page description`);
  }

  if (!canonical) failures.push(`${path}: missing canonical`);
  else if (normalizePath(canonical) !== normalizePath(path)) {
    failures.push(
      `${path}: canonical points to ${normalizePath(canonical)}, expected ${normalizePath(path)}`,
    );
  }

  if (robotsMetas.some((content) => content.includes("noindex"))) {
    failures.push(`${path}: page is noindex (meta robots) but listed in the sitemap`);
  }
  if (xRobotsTag && /noindex/i.test(xRobotsTag)) {
    failures.push(`${path}: page is noindex (X-Robots-Tag) but listed in the sitemap`);
  }

  if (!h1) failures.push(`${path}: missing <h1>`);
  if (!hasJsonLd) failures.push(`${path}: missing JSON-LD`);
  return failures;
}

/** Errors that mean "could not check" (server/network/DB), not bad content. */
export function isEnvironmentError(error) {
  const text = String(error?.cause?.code ?? error?.code ?? error?.message ?? error);
  return /ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|UND_ERR|fetch failed|timed out|socket/i.test(
    text,
  );
}
