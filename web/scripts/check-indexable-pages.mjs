// Pre-deploy SEO gate: `npm run build && npm run check:seo` (not part of the
// Vercel build — run it yourself before deploying; FRONTEND_AUDIT N10).
//
// Starts `next start` on the existing production build and, for every URL in
// /sitemap.xml, checks (see scripts/seo-check-lib.mjs):
//   - <title> present and not the site default (home page exempt)
//   - meta description present and not the site default (home page exempt)
//   - canonical present and its path equals the URL path
//   - not noindex (meta robots or X-Robots-Tag)
//   - <h1> and JSON-LD present
// plus llms.txt/llms-full.txt consistency with the sitemap.
//
// Exit codes:
//   0 = all checks passed
//   1 = CONTENT failures (fix the pages)
//   2 = ENVIRONMENT error — could not check (no build, server did not start,
//       network/Supabase unreachable, HTTP 5xx). Not a verdict on content.
//
// Env: SEO_CHECK_PORT (default 3457). Reads Supabase env like the app does.
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import {
  checkPageContent,
  isEnvironmentError,
  normalizePath,
  readSiteDefaults,
} from "./seo-check-lib.mjs";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

// Load .env files exactly like `next start` (production precedence), so the
// Supabase preflight sees the same configuration as the server under test.
require("@next/env").loadEnvConfig(process.cwd(), false);

const PORT = process.env.SEO_CHECK_PORT || "3457";
const BASE = `http://127.0.0.1:${PORT}`;
const FETCH_TIMEOUT_MS = 20_000;

class EnvironmentError extends Error {}

async function fetchPage(urlPath) {
  let response;
  try {
    response = await fetch(`${BASE}${urlPath}`, {
      redirect: "follow",
      headers: { Accept: "text/html,text/plain,*/*" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    throw new EnvironmentError(
      `Could not fetch ${urlPath}: ${error?.cause?.code ?? error?.message ?? error}`,
    );
  }
  if (response.status >= 500) {
    throw new EnvironmentError(
      `${urlPath} returned HTTP ${response.status} (server/data error, not a content verdict)`,
    );
  }
  return {
    status: response.status,
    text: await response.text(),
    xRobotsTag: response.headers.get("x-robots-tag"),
  };
}

function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

function absolutePathsIn(text) {
  return [...text.matchAll(/https?:\/\/[^\s)\]>"']+/g)].map((m) => normalizePath(m[0]));
}

/** Read-only reachability probe so a Supabase outage is not misread as "no content". */
async function checkSupabaseReachable() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return "Supabase env not set — gated pages (blog, services, work, reviews) are checked as empty.";
  }
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: anonKey },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new EnvironmentError(`Supabase health check returned HTTP ${response.status}.`);
    }
  } catch (error) {
    if (error instanceof EnvironmentError) throw error;
    throw new EnvironmentError(
      `Supabase is unreachable (${error?.cause?.code ?? error?.message ?? error}). Content-driven pages would be missing from the sitemap, so the check cannot give a verdict.`,
    );
  }
  return null;
}

async function waitForServer(child, getStderr, attempts = 75) {
  for (let i = 0; i < attempts; i += 1) {
    // A busy port would make us test some OTHER server — never accept that.
    if (/EADDRINUSE/.test(getStderr())) {
      throw new EnvironmentError(
        `Port ${PORT} is already in use. Stop that process or set SEO_CHECK_PORT.`,
      );
    }
    if (child.exitCode !== null) {
      throw new EnvironmentError(`next start exited early with code ${child.exitCode}.`);
    }
    try {
      const res = await fetch(`${BASE}/robots.txt`);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await delay(400);
  }
  throw new EnvironmentError(`Timed out waiting for next start on port ${PORT}.`);
}

async function runChecks(failures, notes) {
  const defaults = readSiteDefaults(
    readFileSync(path.join(process.cwd(), "src/lib/site.ts"), "utf8"),
  );
  if (!defaults.defaultTitle || !defaults.defaultDescription) {
    throw new EnvironmentError(
      "Could not read SITE_DEFAULT_TITLE / SITE_DESCRIPTION from src/lib/site.ts (keep them plain string literals).",
    );
  }

  const sitemap = await fetchPage("/sitemap.xml");
  if (sitemap.status !== 200) {
    failures.push(`sitemap.xml returned HTTP ${sitemap.status}`);
    return;
  }
  const urls = parseSitemapUrls(sitemap.text);
  if (urls.length === 0) failures.push("sitemap.xml has no <loc> entries");
  const sitemapPaths = new Set(urls.map(normalizePath));

  const llms = await fetchPage("/llms.txt");
  const llmsFull = await fetchPage("/llms-full.txt");
  if (llms.status !== 200) failures.push(`llms.txt returned HTTP ${llms.status}`);
  if (llmsFull.status !== 200) failures.push(`llms-full.txt returned HTTP ${llmsFull.status}`);

  const llmsPathsShort = new Set(absolutePathsIn(llms.text));
  for (const required of ["/", "/about", "/contact", "/quote"]) {
    if (!llmsPathsShort.has(required)) failures.push(`llms.txt is missing core page ${required}`);
  }

  for (const url of urls) {
    const urlPath = normalizePath(url);
    const page = await fetchPage(urlPath);
    if (page.status >= 400) {
      failures.push(`${urlPath}: listed in the sitemap but returned HTTP ${page.status}`);
      continue;
    }
    failures.push(
      ...checkPageContent({
        path: urlPath,
        html: page.text,
        xRobotsTag: page.xRobotsTag,
        defaults,
      }),
    );
  }

  const llmsPaths = new Set([...llmsPathsShort, ...absolutePathsIn(llmsFull.text)]);
  for (const gated of ["/work", "/reviews", "/blog"]) {
    if (!sitemapPaths.has(gated) && llmsPaths.has(gated)) {
      failures.push(`${gated} is not in the sitemap but is linked in llms output`);
    }
  }
  for (const llmsPath of llmsPaths) {
    if (llmsPath.startsWith("/services/") && !sitemapPaths.has(llmsPath)) {
      failures.push(`llms lists ${llmsPath} but the sitemap does not (unpublished detail?)`);
    }
  }

  notes.push(`checked ${urls.length} sitemap URL(s)`);
}

async function main() {
  const failures = [];
  const notes = [];
  let environmentError = null;
  let child = null;
  let stderr = "";

  try {
    if (!existsSync(path.join(process.cwd(), ".next", "BUILD_ID"))) {
      throw new EnvironmentError("No production build found. Run `npm run build` first.");
    }

    const supabaseNote = await checkSupabaseReachable();
    if (supabaseNote) notes.push(supabaseNote);

    child = spawn(process.execPath, [nextBin, "start", "-p", PORT], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PORT },
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    // Let a bind failure surface on stderr before trusting the port.
    await delay(1500);
    await waitForServer(child, () => stderr);
    await runChecks(failures, notes);
  } catch (error) {
    if (error instanceof EnvironmentError || isEnvironmentError(error)) {
      environmentError = error instanceof Error ? error.message : String(error);
    } else {
      // Unexpected bug in the checker itself — never report it as content.
      environmentError = `Checker crashed: ${error instanceof Error ? error.stack : String(error)}`;
    }
  } finally {
    if (child) {
      child.kill("SIGTERM");
      await delay(400);
      if (child.exitCode === null) child.kill("SIGKILL");
    }
  }

  for (const note of notes) console.log(`note: ${note}`);

  if (environmentError) {
    console.error("check:seo ENVIRONMENT ERROR — could not complete the check (not a content verdict):");
    console.error(` - ${environmentError}`);
    if (stderr.trim()) console.error(` - next start stderr (tail): ${stderr.trim().slice(-800)}`);
    process.exit(2);
  }

  if (failures.length > 0) {
    console.error(`check:seo CONTENT FAILURES (${failures.length}):`);
    for (const failure of failures) console.error(` - ${failure}`);
    process.exit(1);
  }

  console.log("check:seo OK");
}

main();
