// Apply reviews schema + seed social links into the live Supabase project.
// Usage: node --env-file=.env.local scripts/apply-reviews-and-social.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing Supabase env.");
  process.exit(2);
}

const svc = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const socialLinks = [
  { label: "LinkedIn", url: "https://www.linkedin.com/company/aorysoft" },
  {
    label: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61554433847153",
  },
  { label: "Instagram", url: "https://www.instagram.com/aorysoft/" },
];

// Schema apply: prefer SQL editor; here we probe the table and insert via RPC if available.
const { error: probeErr } = await svc.from("reviews").select("id").limit(1);
if (probeErr) {
  console.error(
    "reviews table missing or inaccessible. Apply web/supabase/0009_reviews.sql in the Supabase SQL editor, then re-run this script.",
  );
  console.error(probeErr.message);
} else {
  console.log("reviews table OK");
}

const { data: settings, error: settingsErr } = await svc
  .from("site_settings")
  .select("data")
  .eq("id", true)
  .maybeSingle();
if (settingsErr) {
  console.error("site_settings read failed:", settingsErr.message);
  process.exit(1);
}

const next = { ...(settings?.data ?? {}), socialLinks };
const { error: writeErr } = await svc
  .from("site_settings")
  .upsert({ id: true, data: next }, { onConflict: "id" });
if (writeErr) {
  console.error("site_settings update failed:", writeErr.message);
  process.exit(1);
}
console.log("socialLinks written to site_settings");

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = resolve(__dirname, "../supabase/0009_reviews.sql");
console.log("SQL file for manual apply if needed:", sqlPath);
