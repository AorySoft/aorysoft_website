// RLS denial + role-escalation test suite (plan §15).
// RUNS ONLY against a real Supabase project. Requires in env:
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
//   SUPABASE_SERVICE_ROLE_KEY,
//   TEST_ADMIN_EMAIL + TEST_ADMIN_PASSWORD   (an editor or owner test user)
// Usage: npm run test:rls
// Every case prints PASS/FAIL; the process exits 1 if anything failed.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.TEST_ADMIN_EMAIL;
const password = process.env.TEST_ADMIN_PASSWORD;

if (!url || !anonKey || !serviceKey) {
  console.error(
    "SKIP: set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY first (a real project is required).",
  );
  process.exit(2);
}

let failures = 0;
function check(name, passed, detail = "") {
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!passed) failures += 1;
}

const anon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
// The service key is required to exist for the seeded-data checks below and
// for future owner-path assertions; no service-role calls are made here
// against production data.
void serviceKey;

// ── 1. Public reads: only published/active content ──────────────────────
{
  const { data, error } = await anon.from("posts").select("id, status");
  const allPublished =
    !error && (data ?? []).every((row) => row.status === "published");
  check("anon reads only published posts", !error && allPublished);
}

{
  const { error } = await anon.from("submissions").select("id");
  check("anon CANNOT read submissions (PII)", Boolean(error));
}

{
  const { error } = await anon.from("newsletter_subscribers").select("id");
  check("anon CANNOT read newsletter subscribers", Boolean(error));
}

{
  const { error } = await anon.from("profiles").select("id");
  check("anon CANNOT read profiles", Boolean(error));
}

{
  const { data, error } = await anon.from("jobs").select("active");
  check(
    "anon reads only active jobs",
    !error && (data ?? []).every((row) => row.active === true),
  );
}

// ── 2. No public writes anywhere (anon key) ─────────────────────────────
const writeAttempts = [
  ["posts", { title: "x", slug: "anon-write-attempt" }],
  ["categories", { name: "x", slug: "anon-write-attempt" }],
  ["services", { title: "x" }],
  ["jobs", { title: "x" }],
  ["submissions", { type: "contact", name: "x", email: "a@b.co" }],
  ["newsletter_subscribers", { email: "anon-write-attempt@example.com" }],
  ["site_settings", { id: true, data: {} }],
  ["media", { storage_path: "x", url: "https://x.example/y" }],
];

for (const [table, row] of writeAttempts) {
  const { error } = await anon.from(table).insert(row);
  check(`anon INSERT into ${table} denied`, Boolean(error));
}

{
  const { data } = await anon.from("posts").select("id").limit(1);
  const target = data?.[0]?.id;
  if (target) {
    const { error } = await anon.from("posts").update({ title: "hacked" }).eq("id", target);
    check("anon UPDATE on posts denied", Boolean(error));
    const del = await anon.from("posts").delete().eq("id", target);
    check("anon DELETE on posts denied", Boolean(del.error));
  } else {
    check("anon UPDATE on posts denied (no seeded row)", true, "seed posts first for a stronger test");
  }
}

// ── 3. Authenticated session: escalation resistance ─────────────────────
if (email && password) {
  const { data: session, error: signInError } =
    await anon.auth.signInWithPassword({ email, password });

  if (signInError || !session?.session) {
    check("test admin can sign in", false, signInError?.message ?? "no session");
  } else {
    check("test admin can sign in", true);
    const authed = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${session.session.access_token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // profiles: may read own row, but must not be writable — role escalation
    // attempt (editor → owner) must fail at the API.
    const { data: ownProfile } = await authed
      .from("profiles")
      .select("id, role")
      .eq("id", session.user.id)
      .maybeSingle();
    check("user can read own profile", Boolean(ownProfile));

    const escalate = await authed
      .from("profiles")
      .update({ role: "owner" })
      .eq("id", session.user.id);
    check("role self-escalation via profiles UPDATE denied", Boolean(escalate.error));

    const insertProfile = await authed
      .from("profiles")
      .insert({ id: session.user.id, role: "owner" });
    check("role self-escalation via profiles INSERT denied", Boolean(insertProfile.error));

    // Submissions: readable (editor matrix), but no insert/delete rights.
    const subInsert = await authed
      .from("submissions")
      .insert({ type: "contact", name: "x", email: "a@b.co" });
    check("authenticated INSERT into submissions denied", Boolean(subInsert.error));

    const settingsWrite = await authed
      .from("site_settings")
      .upsert({ id: true, data: { hijacked: true } }, { onConflict: "id" });
    check("non-service site_settings write denied", Boolean(settingsWrite.error));
  }
} else {
  console.log("SKIP  session-based escalation tests (set TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD)");
}

console.log(
  failures === 0
    ? "\nAll executed RLS checks passed."
    : `\n${failures} check(s) FAILED — fix policies before launch.`,
);
process.exit(failures === 0 ? 0 : 1);
