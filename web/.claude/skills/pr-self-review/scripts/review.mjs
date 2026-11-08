#!/usr/bin/env node
/**
 * Mechanical PR scan for AorySoft web/.
 * Usage (from web/ or repo root):
 *   node web/.claude/skills/pr-self-review/scripts/review.mjs [git-range]
 * Default range: origin/main...HEAD (falls back to HEAD~1...HEAD)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rangeArg = process.argv[2];
const cwd = process.cwd();

function sh(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    cwd: opts.cwd || cwd,
  }).trim();
}

function tryRange(range) {
  try {
    sh(`git rev-parse ${range}`);
    return range;
  } catch {
    return null;
  }
}

const gitRoot = sh("git rev-parse --show-toplevel");
const prefix = sh("git rev-parse --show-prefix"); // e.g. "web/" when cwd is web/

const range =
  (rangeArg && tryRange(rangeArg)) ||
  tryRange("origin/main...HEAD") ||
  tryRange("main...HEAD") ||
  tryRange("HEAD~1...HEAD") ||
  "HEAD";

console.log(`## pr-self-review mechanical pass`);
console.log(`range: ${range}`);
console.log(`cwd: ${cwd}`);
console.log(`gitRoot: ${gitRoot}`);
console.log(`prefix: ${prefix || "(repo root)"}\n`);

let names = "";
try {
  names = sh(`git diff --name-only ${range}`);
} catch {
  console.error("Could not read git diff. Are you in a git repo?");
  process.exit(1);
}

const files = names.split(/\r?\n/).filter(Boolean);
if (files.length === 0) {
  console.log("No changed files in range.");
  process.exit(0);
}

/** Map git path → absolute filesystem path. */
function absFor(gitPath) {
  return path.join(gitRoot, gitPath);
}

/** Only scan app files under web/ when present. */
function inScope(gitPath) {
  if (!prefix) return gitPath.startsWith("web/") || !gitPath.includes("/");
  return gitPath.startsWith(prefix) || gitPath.startsWith("web/");
}

const findings = [];

for (const file of files) {
  if (!inScope(file) && file.endsWith(".sql") === false) {
    // still list everything; only deep-scan web sources
  }

  const abs = absFor(file);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;

  const ext = path.extname(file);
  if (![".ts", ".tsx", ".js", ".jsx", ".mjs", ".sql", ".css"].includes(ext)) {
    continue;
  }

  // Prefer scanning web/ application sources
  if (!(file.includes("web/") || prefix)) {
    /* allow */
  }

  let text = "";
  try {
    text = fs.readFileSync(abs, "utf8");
  } catch {
    continue;
  }
  const lines = text.split(/\r?\n/).length;

  if (lines > 450) {
    findings.push({
      level: "RED",
      file,
      msg: `file has ${lines} lines (>450). Split before growing further.`,
    });
  } else if (lines > 300) {
    findings.push({
      level: "YELLOW",
      file,
      msg: `file has ${lines} lines (warn >300).`,
    });
  }

  if (/from\s+["']@\/lib\/supabase\/admin["']/.test(text) && /["']use client["']/.test(text)) {
    findings.push({
      level: "RED",
      file,
      msg: `possible service-role admin import in a client module.`,
    });
  }

  if (/dangerouslySetInnerHTML/.test(text) && !/sanitize|SafeHtml/.test(text)) {
    findings.push({
      level: "YELLOW",
      file,
      msg: `dangerouslySetInnerHTML without nearby sanitize/SafeHtml mention — verify XSS path.`,
    });
  }

  if (/NEXT_PUBLIC_[A-Z0-9_]*SERVICE_ROLE/.test(text)) {
    findings.push({
      level: "RED",
      file,
      msg: `SERVICE_ROLE appears tied to NEXT_PUBLIC_ — forbidden.`,
    });
  }
}

console.log("### Changed files");
for (const f of files) console.log(`- ${f}`);
console.log("");

if (findings.length === 0) {
  console.log("### Mechanical findings\n🟢 none");
} else {
  console.log("### Mechanical findings");
  for (const f of findings) {
    const icon = f.level === "RED" ? "🔴" : "🟡";
    console.log(`${icon} ${f.file}: ${f.msg}`);
  }
}

console.log(
  `\nNext: walk references/checklist.md and write the claims / blast-radius report.`,
);
