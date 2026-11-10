// One-shot CMS cleanup: remove RLS-test residue and hide placeholder careers.
// Requires .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
// Usage: node --env-file=.env.local scripts/cms-cleanup.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "SKIP: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.",
  );
  process.exit(2);
}

const svc = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TEST_SERVICE_TITLES = new Set(["editor service", "x"]);
const TEST_JOB_TITLES = new Set(["editor job", "x"]);
const TEST_POST_TITLE_PREFIXES = ["editor post", "owner post", "Matrix post", "x"];
const TEST_CATEGORY_NAMES = new Set(["editor cat"]);
const TEST_CATEGORY_NAME_PREFIX = "Matrix ";

function isTestPostTitle(title) {
  return TEST_POST_TITLE_PREFIXES.some(
    (p) => title === p || title.startsWith(p) || title.startsWith("Matrix post "),
  );
}

async function list(table, columns) {
  const { data, error } = await svc.from(table).select(columns);
  if (error) throw new Error(`${table} list failed: ${error.message}`);
  return data ?? [];
}

console.log("── before ──");
const servicesBefore = await list("services", "id, title, active");
const jobsBefore = await list("jobs", "id, title, active");
const postsBefore = await list("posts", "id, title, status, slug");
const categoriesBefore = await list("categories", "id, name, slug");
console.log(
  `services: ${servicesBefore.length} (${servicesBefore.filter((r) => r.active).length} active)`,
);
console.log(
  `jobs: ${jobsBefore.length} (${jobsBefore.filter((r) => r.active).length} active)`,
);
console.log(`posts: ${postsBefore.length}`);
console.log(`categories: ${categoriesBefore.length}`);

const serviceIds = servicesBefore
  .filter((r) => TEST_SERVICE_TITLES.has(r.title) || r.title.startsWith("Matrix service "))
  .map((r) => r.id);
const jobTestIds = jobsBefore
  .filter((r) => TEST_JOB_TITLES.has(r.title) || r.title.startsWith("Matrix job "))
  .map((r) => r.id);
const postIds = postsBefore
  .filter((r) => isTestPostTitle(r.title) || (r.slug ?? "").startsWith("ed-post-") || (r.slug ?? "").startsWith("ow-post-") || (r.slug ?? "").startsWith("matrix-post-") || (r.slug ?? "").startsWith("anon-x-"))
  .map((r) => r.id);
const categoryIds = categoriesBefore
  .filter(
    (r) =>
      TEST_CATEGORY_NAMES.has(r.name) ||
      r.name.startsWith(TEST_CATEGORY_NAME_PREFIX) ||
      (r.slug ?? "").startsWith("matrix-") ||
      (r.slug ?? "").startsWith("ed-cat-") ||
      (r.slug ?? "").startsWith("anon-x-"),
  )
  .map((r) => r.id);

if (serviceIds.length) {
  const { error } = await svc.from("services").delete().in("id", serviceIds);
  if (error) throw new Error(`delete services: ${error.message}`);
  console.log(`deleted ${serviceIds.length} test service row(s)`);
}

if (jobTestIds.length) {
  const { error } = await svc.from("jobs").delete().in("id", jobTestIds);
  if (error) throw new Error(`delete jobs: ${error.message}`);
  console.log(`deleted ${jobTestIds.length} test job row(s)`);
}

if (postIds.length) {
  const { error } = await svc.from("posts").delete().in("id", postIds);
  if (error) throw new Error(`delete posts: ${error.message}`);
  console.log(`deleted ${postIds.length} test post row(s)`);
}

if (categoryIds.length) {
  const { error } = await svc.from("categories").delete().in("id", categoryIds);
  if (error) throw new Error(`delete categories: ${error.message}`);
  console.log(`deleted ${categoryIds.length} test category row(s)`);
}

// Placeholder careers from 0004_seed are not real openings — hide them.
const { data: deactivatedJobs, error: jobDeactErr } = await svc
  .from("jobs")
  .update({ active: false })
  .eq("active", true)
  .select("id, title");
if (jobDeactErr) throw new Error(`deactivate jobs: ${jobDeactErr.message}`);
console.log(
  `deactivated ${(deactivatedJobs ?? []).length} remaining active job(s)`,
  (deactivatedJobs ?? []).map((r) => r.title),
);

// Strip unverified phone/address from site_settings (PRODUCT.md).
const { data: settings, error: settingsReadErr } = await svc
  .from("site_settings")
  .select("data")
  .eq("id", true)
  .maybeSingle();
if (settingsReadErr) throw new Error(`read settings: ${settingsReadErr.message}`);

if (settings?.data) {
  const next = { ...settings.data };
  let changed = false;
  for (const key of ["footerPhone", "footerAddress"]) {
    if (next[key]) {
      next[key] = "";
      changed = true;
    }
  }
  if (changed) {
    const { error } = await svc
      .from("site_settings")
      .update({ data: next })
      .eq("id", true);
    if (error) throw new Error(`update settings: ${error.message}`);
    console.log("cleared footerPhone / footerAddress from site_settings");
  } else {
    console.log("site_settings phone/address already empty");
  }
} else {
  console.log("no site_settings row to patch");
}

console.log("\n── after (public-visible) ──");
const { data: activeServices } = await svc
  .from("services")
  .select("id, title")
  .eq("active", true)
  .order("sort_order");
const { data: activeJobs } = await svc
  .from("jobs")
  .select("id, title")
  .eq("active", true);
console.log(
  "active services:",
  (activeServices ?? []).map((r) => r.title),
);
console.log("active jobs:", (activeJobs ?? []).map((r) => r.title));
console.log("\nCMS cleanup complete.");
