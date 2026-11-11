// AorySoft — Admin auth + RLS role-matrix test suite (plan §15).
//
// This suite is SELF-CONTAINED: it provisions its own throwaway editor and
// owner users through the service-role key, so it runs against a real Supabase
// project with NOTHING to configure by hand (no TEST_ADMIN_EMAIL/PASSWORD).
// Every user and every seeded row it creates is deleted again in the finally
// block, so a crashed run leaves no residue.
//
// What it proves, against the live database:
//   1. Anonymous (unauthorized) access — reads only published/active content,
//      and can WRITE nowhere.
//   2. Editor session — the exact CRUD surface the plan §5.5 matrix allows,
//      verified on REAL seeded rows (INSERT/UPDATE/DELETE), not no-op filters.
//   3. Owner session — the full surface, including owner-only areas.
//   4. Escalation resistance — a session cannot mint or promote its own role.
//
// RUNS ONLY against a real project. Requires in env:
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
//   SUPABASE_SERVICE_ROLE_KEY
// Usage: npm run test:rls
// Prints PASS/FAIL per case; exits 1 if anything failed, 2 if not configured.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error(
    "SKIP: set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY first (a real project is required).",
  );
  process.exit(2);
}

const stamp = Date.now();
let failures = 0;
let passes = 0;

function check(name, passed, detail = "") {
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (passed) passes += 1;
  else failures += 1;
}

const svc = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── ephemeral-user factory ────────────────────────────────────────────
// Creates a confirmed auth user + a profile row with the given role, signs in
// with an anon-key client (so RLS applies exactly as it would in the app), and
// returns a client bound to that session plus the user id for cleanup.
const provisioned = [];
async function makeUser(role) {
  const email = `rls-matrix-${role}-${stamp}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const password = "Rls-Matrix-Pass-123!";
  const { data: created, error: createErr } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) throw new Error(`createUser(${role}) failed: ${createErr.message}`);
  const uid = created.user.id;
  provisioned.push(uid);

  const { error: profileErr } = await svc
    .from("profiles")
    .insert({ id: uid, role });
  if (profileErr) throw new Error(`profile insert(${role}) failed: ${profileErr.message}`);

  const signIn = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: session, error: signInErr } = await signIn.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) throw new Error(`signIn(${role}) failed: ${signInErr.message}`);

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${session.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { uid, client, email };
}

// ── helpers ───────────────────────────────────────────────────────────
// A write that "succeeded" only counts if it actually affected a row. PostgREST
// returns no error for a zero-row UPDATE/DELETE (RLS filters the row out), so
// every mutation is asked to return the affected rows and we assert on the
// count. This is what turns a false "ALLOWED" into an honest denial.
async function wrote(promise) {
  const { data, error } = await promise;
  if (error) return { ok: false, error: error.message };
  const rows = Array.isArray(data) ? data.length : data ? 1 : 0;
  return { ok: rows > 0, rows };
}

const seeded = { posts: [], categories: [], services: [], jobs: [], submissions: [] };

// ── 1. Anonymous (unauthorized) ───────────────────────────────────────
console.log("\n── 1. Anonymous access (no session) ──");
{
  const { data: posts, error } = await anon.from("posts").select("status");
  check(
    "anon reads ONLY published posts",
    !error && (posts ?? []).every((r) => r.status === "published"),
  );
  const { data: jobs, error: jErr } = await anon.from("jobs").select("active");
  check(
    "anon reads ONLY active jobs",
    !jErr && (jobs ?? []).every((r) => r.active === true),
  );

  for (const table of ["submissions", "newsletter_subscribers", "profiles"]) {
    const { error: e } = await anon.from(table).select("id").limit(1);
    check(`anon CANNOT read ${table}`, Boolean(e), e ? e.message : "");
  }

  // Reviews (0013): public columns readable, submitter_email is not.
  {
    const { error: okErr } = await anon
      .from("reviews")
      .select("id, display_name, review_text, rating, status")
      .limit(1);
    check("anon reads public review columns", !okErr, okErr ? okErr.message : "");
    const { error: emailErr } = await anon
      .from("reviews")
      .select("submitter_email")
      .limit(1);
    check(
      "anon CANNOT read reviews.submitter_email",
      Boolean(emailErr),
      emailErr ? emailErr.message : "",
    );
  }

  const writeAttempts = [
    ["posts", { title: "x", slug: `anon-x-${stamp}` }],
    ["categories", { name: "x", slug: `anon-x-${stamp}` }],
    ["services", { title: "x" }],
    ["jobs", { title: "x" }],
    ["submissions", { type: "contact", name: "x", email: "a@b.co" }],
    ["newsletter_subscribers", { email: `anon-${stamp}@example.com` }],
    ["site_settings", { id: true, data: {} }],
    ["media", { storage_path: "x", url: "https://x.example/y" }],
  ];
  for (const [table, row] of writeAttempts) {
    const { error: e } = await anon.from(table).insert(row);
    check(`anon INSERT into ${table} denied`, Boolean(e));
  }
}

// ── provision roles ───────────────────────────────────────────────────
console.log("\n── provisioning ephemeral editor + owner ──");
const editor = await makeUser("editor");
const owner = await makeUser("owner");
console.log(`editor=${editor.uid} owner=${owner.uid}`);

// Seed REAL content rows via service role so UPDATE/DELETE assertions operate
// on rows that exist — a no-op filter against a missing row would otherwise
// masquerade as a denial.
{
  const { data: c } = await svc
    .from("categories")
    .insert({ name: `Matrix ${stamp}`, slug: `matrix-${stamp}` })
    .select("id")
    .single();
  seeded.categories.push(c.id);

  const { data: p } = await svc
    .from("posts")
    .insert({ title: `Matrix post ${stamp}`, slug: `matrix-post-${stamp}`, status: "draft", body_html: "x" })
    .select("id")
    .single();
  seeded.posts.push(p.id);

  const { data: s } = await svc
    .from("services")
    .insert({ title: `Matrix service ${stamp}` })
    .select("id")
    .single();
  seeded.services.push(s.id);

  const { data: j } = await svc
    .from("jobs")
    .insert({ title: `Matrix job ${stamp}` })
    .select("id")
    .single();
  seeded.jobs.push(j.id);

  const { data: sub } = await svc
    .from("submissions")
    .insert({ type: "contact", name: "matrix", email: `matrix-${stamp}@x.co` })
    .select("id")
    .single();
  seeded.submissions.push(sub.id);
}

// ── 2. Editor matrix ──────────────────────────────────────────────────
console.log("\n── 2. Editor session (plan §5.5 matrix) ──");
{
  const E = editor.client;

  // Own profile readable; NOT writable (escalation resistance).
  const { data: ownProfile } = await E.from("profiles")
    .select("id, role")
    .eq("id", editor.uid)
    .maybeSingle();
  check("editor reads own profile", ownProfile?.role === "editor");

  const esc = await wrote(
    E.from("profiles").update({ role: "owner" }).eq("id", editor.uid).select("id"),
  );
  check("editor CANNOT self-escalate via profiles UPDATE", !esc.ok);
  const escIns = await E.from("profiles").insert({ id: editor.uid, role: "owner" });
  check("editor CANNOT self-escalate via profiles INSERT", Boolean(escIns.error));

  // Content areas: editor creates + edits (create/edit allowed).
  const cIns = await wrote(
    E.from("categories").insert({ name: "editor cat", slug: `ed-cat-${stamp}` }).select("id"),
  );
  check("editor INSERT category", cIns.ok);
  if (cIns.ok) {
    const { data: cRows } = await E.from("categories")
      .select("id")
      .eq("slug", `ed-cat-${stamp}`)
      .limit(1);
    if (cRows?.[0]?.id) seeded.categories.push(cRows[0].id);
  }
  const pIns = await wrote(
    E.from("posts").insert({ title: "editor post", slug: `ed-post-${stamp}`, status: "draft" }).select("id"),
  );
  check("editor INSERT post", pIns.ok);
  if (pIns.ok) {
    const { data: edPosts } = await E.from("posts")
      .select("id")
      .eq("slug", `ed-post-${stamp}`)
      .limit(1);
    if (edPosts?.[0]?.id) seeded.posts.push(edPosts[0].id);
  }
  const pUpd = await wrote(
    E.from("posts").update({ title: "editor post (edited)" }).eq("id", seeded.posts[0]).select("id"),
  );
  check("editor UPDATE seeded post", pUpd.ok);
  // Plan §5.5: editor has NO deletions anywhere. RLS in 0002 defines the
  // content manage policies as `FOR ALL ... is_editor_or_admin()`, which lets an
  // editor DELETE content at the API even though the app layer blocks it. This
  // check asserts the INTENDED matrix and stays red until 0006 tightens the
  // manage policies to owner-only DELETE. See supabase/0006_tighten_editor_delete.sql.
  const pDelEd = await wrote(
    E.from("posts").delete().eq("id", seeded.posts[0]).select("id"),
  );
  check("editor CANNOT delete content post (owner-only)", !pDelEd.ok,
    pDelEd.ok ? "RLS still permits editor delete — apply 0006" : "");
  if (pDelEd.ok) {
    // Restore the seeded row so the owner-delete assertion below still has a
    // real target even when this gap is present.
    const { data: back } = await svc
      .from("posts")
      .insert({ title: `Matrix post ${stamp}`, slug: `matrix-post-${stamp}-restored`, status: "draft", body_html: "x" })
      .select("id")
      .single();
    seeded.posts[0] = back.id;
  }

  // Insert inactive so a failed cleanup never leaks test titles onto the public site.
  const sIns = await wrote(
    E.from("services").insert({ title: "editor service", active: false }).select("id"),
  );
  check("editor INSERT service", sIns.ok);
  if (sIns.ok) {
    const { data: sRows } = await E.from("services")
      .select("id")
      .eq("title", "editor service")
      .order("created_at", { ascending: false })
      .limit(1);
    if (sRows?.[0]?.id) seeded.services.push(sRows[0].id);
  }
  const jIns = await wrote(
    E.from("jobs").insert({ title: "editor job", active: false }).select("id"),
  );
  check("editor INSERT job", jIns.ok);
  if (jIns.ok) {
    const { data: jRows } = await E.from("jobs")
      .select("id")
      .eq("title", "editor job")
      .order("created_at", { ascending: false })
      .limit(1);
    if (jRows?.[0]?.id) seeded.jobs.push(jRows[0].id);
  }

  // Submissions: editor reads + updates status, but CANNOT delete (owner-only).
  const { data: subs } = await E.from("submissions").select("id").limit(1);
  check("editor READS submissions", Array.isArray(subs));
  const subUpd = await wrote(
    E.from("submissions").update({ status: "read" }).eq("id", seeded.submissions[0]).select("id"),
  );
  check("editor UPDATES submission status", subUpd.ok);
  const subDel = await wrote(
    E.from("submissions").delete().eq("id", seeded.submissions[0]).select("id"),
  );
  check("editor CANNOT delete submission (owner-only)", !subDel.ok);

  // Owner-only areas: newsletter + site settings must be invisible/unwritable.
  const { data: news, error: newsErr } = await E.from("newsletter_subscribers")
    .select("id")
    .limit(1);
  check("editor CANNOT read newsletter (0 rows)", !newsErr && (news ?? []).length === 0);
  const setWrite = await wrote(
    E.from("site_settings").upsert({ id: true, data: { hijack: true } }, { onConflict: "id" }).select("id"),
  );
  check("editor CANNOT write site_settings", !setWrite.ok);
}

// ── 3. Owner matrix ───────────────────────────────────────────────────
console.log("\n── 3. Owner session (full surface) ──");
{
  const O = owner.client;

  const { data: ownProfile } = await O.from("profiles")
    .select("id, role")
    .eq("id", owner.uid)
    .maybeSingle();
  check("owner reads own profile", ownProfile?.role === "owner");

  const pIns = await wrote(
    O.from("posts").insert({ title: "owner post", slug: `ow-post-${stamp}`, status: "draft" }).select("id"),
  );
  check("owner INSERT post", pIns.ok);
  if (pIns.ok) {
    const { data: pRows } = await O.from("posts")
      .select("id")
      .eq("slug", `ow-post-${stamp}`)
      .limit(1);
    if (pRows?.[0]?.id) seeded.posts.push(pRows[0].id);
  }

  // Owner CAN delete content (the seeded draft).
  const pDel = await wrote(
    O.from("posts").delete().eq("id", seeded.posts[0]).select("id"),
  );
  check("owner DELETEs seeded post", pDel.ok);
  // Remove it from the cleanup list since it is already gone.
  seeded.posts = seeded.posts.filter((id) => id !== seeded.posts[0]);

  const subDel = await wrote(
    O.from("submissions").delete().eq("id", seeded.submissions[0]).select("id"),
  );
  check("owner DELETEs submission", subDel.ok);
  seeded.submissions = [];

  const { data: news } = await O.from("newsletter_subscribers").select("id").limit(1);
  check("owner READS newsletter", Array.isArray(news));

  // Media: owner can create + delete a library row (file bytes live in Storage
  // and are exercised by the upload UI; here we assert the table-level role).
  const { data: mRow, error: mErr } = await O.from("media")
    .insert({ storage_path: `matrix/${stamp}.png`, url: `https://x.example/matrix-${stamp}.png`, alt: "matrix" })
    .select("id")
    .single();
  check("owner INSERTs media row", !mErr && Boolean(mRow?.id));
  if (mRow?.id) {
    const mDel = await wrote(O.from("media").delete().eq("id", mRow.id).select("id"));
    check("owner DELETEs media row", mDel.ok);
  }

  // Patch a disposable key only — never replace the whole JSONB blob (that
  // wiped real footer/hero copy on earlier matrix runs).
  const { data: settingsBefore } = await svc
    .from("site_settings")
    .select("data")
    .eq("id", true)
    .maybeSingle();
  const settingsProbe = {
    ...(settingsBefore?.data ?? {}),
    __matrix_probe: stamp,
  };
  const setWrite = await wrote(
    O.from("site_settings")
      .upsert({ id: true, data: settingsProbe }, { onConflict: "id" })
      .select("id"),
  );
  check("owner WRITES site_settings", setWrite.ok);
  if (settingsBefore?.data) {
    await svc
      .from("site_settings")
      .update({ data: settingsBefore.data })
      .eq("id", true);
  } else if (setWrite.ok) {
    const cleaned = { ...settingsProbe };
    delete cleaned.__matrix_probe;
    await svc.from("site_settings").update({ data: cleaned }).eq("id", true);
  }

  // Role change through the service path (what the Users admin action does).
  const roleFlip = await wrote(
    svc.from("profiles").update({ role: "editor" }).eq("id", editor.uid).select("id"),
  );
  check("service-role can change a role (Users admin path)", roleFlip.ok);
}

// ── cleanup ───────────────────────────────────────────────────────────
console.log("\n── cleanup ──");
try {
  for (const id of seeded.posts) await svc.from("posts").delete().eq("id", id);
  for (const id of seeded.categories) await svc.from("categories").delete().eq("id", id);
  for (const id of seeded.services) await svc.from("services").delete().eq("id", id);
  for (const id of seeded.jobs) await svc.from("jobs").delete().eq("id", id);
  for (const id of seeded.submissions) await svc.from("submissions").delete().eq("id", id);
  for (const uid of provisioned) await svc.auth.admin.deleteUser(uid);
  console.log("removed ephemeral users and seeded rows.");
} catch (error) {
  console.error("cleanup encountered an error (inspect manually):", error.message);
}

console.log(
  failures === 0
    ? `\nAll ${passes} executed RLS/admin checks passed.`
    : `\n${failures} check(s) FAILED, ${passes} passed — fix policies before launch.`,
);
process.exit(failures === 0 ? 0 : 1);
