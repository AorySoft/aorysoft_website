// Post-build gate (Batch 6): every URL in the live sitemap must expose
// title, description, canonical, h1, and JSON-LD. Gated paths omitted from
// the sitemap must not appear as absolute URLs in llms.txt / llms-full.txt.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const PORT = process.env.SEO_CHECK_PORT || "3457";
const BASE = `http://127.0.0.1:${PORT}`;

function extract(html, pattern) {
  const match = html.match(pattern);
  return match?.[1]?.trim() || "";
}

function hasJsonLd(html) {
  return /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
}

async function fetchText(path) {
  const response = await fetch(`${BASE}${path}`, {
    redirect: "follow",
    headers: { Accept: "text/html,text/plain,*/*" },
  });
  return { status: response.status, text: await response.text() };
}

function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

function pathFromUrl(url) {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}

function absolutePathsIn(text) {
  return [...text.matchAll(/https?:\/\/[^\s)\]>"']+/g)].map((m) =>
    pathFromUrl(m[0]),
  );
}

async function waitForServer(child, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    if (child.exitCode !== null) {
      throw new Error(`next start exited early with code ${child.exitCode}`);
    }
    try {
      const res = await fetch(`${BASE}/robots.txt`);
      if (res.ok) return;
    } catch {
      // not ready
    }
    await delay(400);
  }
  throw new Error("Timed out waiting for next start");
}

async function main() {
  const child = spawn(process.execPath, [nextBin, "start", "-p", PORT], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT },
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const failures = [];
  try {
    await waitForServer(child);

    const sitemap = await fetchText("/sitemap.xml");
    if (sitemap.status !== 200) {
      throw new Error(`sitemap.xml returned ${sitemap.status}`);
    }
    const urls = parseSitemapUrls(sitemap.text);
    if (urls.length === 0) failures.push("sitemap.xml has no <loc> entries");

    const llms = await fetchText("/llms.txt");
    const llmsFull = await fetchText("/llms-full.txt");
    if (llms.status !== 200) failures.push(`llms.txt returned ${llms.status}`);
    if (llmsFull.status !== 200) {
      failures.push(`llms-full.txt returned ${llmsFull.status}`);
    }

    for (const required of ["/about", "/contact", "/quote", "/"]) {
      const inLlms =
        absolutePathsIn(llms.text).includes(required) ||
        llms.text.includes(`](${required}`) ||
        (required !== "/" && llms.text.includes(required));
      if (!inLlms) failures.push(`llms.txt missing core page ${required}`);
    }

    const sitemapPaths = new Set(urls.map(pathFromUrl));

    for (const url of urls) {
      const path = pathFromUrl(url);
      const page = await fetchText(path);
      if (page.status >= 400) {
        failures.push(`${path} returned HTTP ${page.status}`);
        continue;
      }

      const title = extract(page.text, /<title[^>]*>([^<]*)<\/title>/i);
      const description =
        extract(
          page.text,
          /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
        ) ||
        extract(
          page.text,
          /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
        );
      const canonical =
        extract(
          page.text,
          /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i,
        ) ||
        extract(
          page.text,
          /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i,
        );
      const h1 = extract(page.text, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(
        /<[^>]+>/g,
        "",
      );

      if (!title) failures.push(`${path}: missing <title>`);
      if (!description) failures.push(`${path}: missing meta description`);
      if (!canonical) failures.push(`${path}: missing canonical`);
      if (!h1) failures.push(`${path}: missing <h1>`);
      if (!hasJsonLd(page.text)) failures.push(`${path}: missing JSON-LD`);
    }

    const llmsPaths = new Set([
      ...absolutePathsIn(llms.text),
      ...absolutePathsIn(llmsFull.text),
    ]);
    for (const gated of ["/work", "/reviews", "/blog"]) {
      if (sitemapPaths.has(gated)) continue;
      if (llmsPaths.has(gated)) {
        failures.push(
          `${gated} is not in sitemap but is linked in llms output`,
        );
      }
    }

    for (const path of llmsPaths) {
      if (path.startsWith("/services/") && !sitemapPaths.has(path)) {
        failures.push(
          `llms lists ${path} but sitemap does not (unpublished detail?)`,
        );
      }
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
    if (stderr.trim()) failures.push(stderr.trim().slice(-800));
  } finally {
    child.kill("SIGTERM");
    await delay(400);
    if (child.exitCode === null) child.kill("SIGKILL");
  }

  if (failures.length > 0) {
    console.error("check-indexable-pages FAILED:");
    for (const failure of failures) console.error(" -", failure);
    process.exit(1);
  }

  console.log("check-indexable-pages OK");
}

main();
