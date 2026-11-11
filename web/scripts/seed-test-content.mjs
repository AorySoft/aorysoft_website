// Temporary TEST content for design review (Batch 8). Inserts new rows only —
// never updates or deletes existing rows — and records every id in a manifest.
//
//   node --env-file=.env.local scripts/seed-test-content.mjs           # seed
//   node --env-file=.env.local scripts/seed-test-content.mjs --remove --dry-run  # read-only preview
//   node --env-file=.env.local scripts/seed-test-content.mjs --remove  # delete only what the manifest lists
//
// Honesty: every title says "(test)", every body starts with "Test content",
// reviewers are "Test Reviewer …", no real companies, logos, or figures.
// Newsletter rows use example.com / .invalid and are inserted directly, so no
// confirmation email is ever sent (sending only happens in the subscribe action).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const MANIFEST = join(dirname(fileURLToPath(import.meta.url)), "test-content-manifest.json");
const BUCKET = "media";
const STORAGE_PREFIX = "test-seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (.env.local).");
  process.exit(2);
}
const db = createClient(url, key, { auth: { persistSession: false } });

// ── manifest ────────────────────────────────────────────────────────────
const TABLES = ["posts", "reviews", "case_studies", "jobs", "services", "newsletter_subscribers", "categories", "media"];
const empty = () => ({ createdAt: new Date().toISOString(), storage: [], ...Object.fromEntries(TABLES.map((t) => [t, []])) });
const loadManifest = () => (existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null);
const saveManifest = (m) => writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n");

// ── tiny PNG encoder (no dependencies) ──────────────────────────────────
const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function png(w, h, pixel) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b] = pixel(x, y);
      const i = y * (w * 3 + 1) + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const DEEP = [37, 99, 235];
const SIGNAL = [6, 182, 212];

/** Abstract brand-colour composition: dark field, soft glow, a grid of nodes, and signal lines. */
function artwork(w, h, seed) {
  const gx = 0.25 + 0.5 * ((seed * 0.37) % 1);
  const gy = 0.3 + 0.4 * ((seed * 0.61) % 1);
  const step = Math.round(w / (8 + (seed % 4)));
  const slope = 0.35 + (seed % 3) * 0.2;
  return png(w, h, (x, y) => {
    const u = x / w;
    const v = y / h;
    const d = Math.hypot((u - gx) * 1.6, v - gy);
    const glow = Math.max(0, 1 - d * 1.5) ** 2;
    let c = mix([3, 5, 9], mix(DEEP, SIGNAL, u), glow * 0.55);
    // node grid
    const nx = x % step;
    const ny = y % step;
    if (nx < 3 && ny < 3) c = mix(c, [120, 150, 190], 0.35);
    // signal lines rising like the mark's strokes
    const line = Math.abs(((x - y * slope - seed * 40) % (step * 3) + step * 3) % (step * 3));
    if (line < 1.6) c = mix(c, mix(DEEP, SIGNAL, v), 0.8 * (1 - v * 0.4));
    return c.map(clamp);
  });
}

// ── content ─────────────────────────────────────────────────────────────
const T = "Test content for design review.";
const SERVICES = [
  {
    slug: "test-ai-chatbots",
    icon: "bot",
    title: "AI Chatbots (test)",
    subtitle: "Answers on your site and in your inbox, grounded in your own content",
    description: `${T} A chatbot that answers customer questions from your documentation, routes what it cannot answer to a person, and keeps a reviewable log of every conversation.`,
    features: ["Website and WhatsApp chat", "Answers grounded in your documents", "Hand-off to a human", "Conversation review dashboard"],
    deliverables: ["Chat widget for your site", "Knowledge base ingestion from your docs", "Human hand-off rules", "Admin view of conversations", "Launch checklist and monitoring"],
    process_steps: [
      { title: "Collect", text: "Gather the questions customers already ask and the documents that answer them." },
      { title: "Ground", text: "Index your content so answers cite your own material." },
      { title: "Guard", text: "Set hand-off rules for anything sensitive or uncertain." },
      { title: "Launch", text: "Ship to one channel first, review conversations, then widen." },
    ],
    technologies: ["Next.js", "OpenAI API", "PostgreSQL", "n8n"],
    faqs: [
      { question: "Can it answer from our own documents?", answer: `${T} Yes: answers are retrieved from the documents you provide.` },
      { question: "What happens when it does not know?", answer: `${T} It says so and hands the conversation to a person.` },
      { question: "Can we review what it said?", answer: `${T} Every conversation is logged for review.` },
    ],
  },
  {
    slug: "test-ai-agents",
    icon: "brain",
    title: "AI Agents (test)",
    subtitle: "Software that reads, decides, and acts inside your tools, with a person in the loop",
    description: `${T} An agent that takes a request, gathers context from your systems, proposes an action, and waits for approval where the stakes are high.`,
    features: ["Multi-step task handling", "Tool and API access", "Approval checkpoints", "Audit trail"],
    deliverables: ["Agent workflow design", "Tool integrations", "Approval and escalation rules", "Audit log", "Runbook for your team"],
    process_steps: [
      { title: "Map", text: "Pick one repetitive task and map every decision in it." },
      { title: "Connect", text: "Give the agent read and write access only where it needs it." },
      { title: "Supervise", text: "Add approval steps for actions that change data or reach customers." },
      { title: "Expand", text: "Extend to the next task once the first runs reliably." },
    ],
    technologies: ["Python", "OpenAI API", "Node.js", "PostgreSQL"],
    faqs: [
      { question: "Does an agent act without approval?", answer: `${T} Only for actions you mark as safe; others wait for a person.` },
      { question: "Which tools can it use?", answer: `${T} Any system with an API, connected one at a time.` },
    ],
  },
  {
    slug: "test-workflow-automation",
    icon: "zap",
    title: "Workflow Automation (test)",
    subtitle: "Move data between the tools you already use, without copy and paste",
    description: `${T} Automations that connect forms, inboxes, spreadsheets, and CRMs so routine hand-offs happen on their own and errors surface instead of hiding.`,
    features: ["Form to CRM pipelines", "Document intake", "Scheduled reports", "Error alerts"],
    deliverables: ["Process map of the current workflow", "Automations built in n8n or code", "Error handling and alerts", "Documentation", "Hand-over session"],
    process_steps: [
      { title: "Trace", text: "Follow one piece of work from start to finish." },
      { title: "Automate", text: "Replace the manual hand-offs, keeping a person where judgement is needed." },
      { title: "Alert", text: "Make failures visible the moment they happen." },
      { title: "Hand over", text: "Document it so your team can change it later." },
    ],
    technologies: ["n8n", "Node.js", "PostgreSQL"],
    faqs: [
      { question: "Do we need to change our tools?", answer: `${T} No. Automations connect the tools you already use.` },
      { question: "Who maintains it?", answer: `${T} Your team, with documentation, or us on a support plan.` },
    ],
  },
  {
    slug: "test-web-development",
    icon: "code",
    title: "Web Development (test)",
    subtitle: "Fast, maintainable websites and web apps built to grow",
    description: `${T} Marketing sites, customer portals, and internal tools built with a modern stack, a CMS your team can use, and clean hand-over.`,
    features: ["Marketing websites", "Customer portals", "Admin panels and CMS", "Performance and SEO"],
    deliverables: ["Design and build", "CMS your team can edit", "SEO and performance baseline", "Hosting and deployment setup", "Hand-over documentation"],
    process_steps: [
      { title: "Shape", text: "Agree pages, flows, and content before any code." },
      { title: "Build", text: "Ship in small, reviewable increments." },
      { title: "Tune", text: "Check speed, accessibility, and search basics." },
      { title: "Launch", text: "Deploy, monitor, and hand over." },
    ],
    technologies: ["React & Next.js", "TypeScript", "PostgreSQL", "Vercel"],
    faqs: [
      { question: "Can we edit content ourselves?", answer: `${T} Yes, through the admin panel.` },
      { question: "Do you handle hosting?", answer: `${T} We set it up in your account so you keep ownership.` },
    ],
  },
];

const CATEGORIES = [
  { name: "AI in practice (test)", slug: "test-ai-in-practice", description: `${T} Notes on shipping AI features.` },
  { name: "Automation (test)", slug: "test-automation", description: `${T} Workflow and integration notes.` },
];

const POSTS = [
  { slug: "test-grounding-a-support-chatbot", title: "Grounding a support chatbot in your own docs (test)", cat: 0, featured: true },
  { slug: "test-human-in-the-loop-agents", title: "Where a human belongs in an AI agent loop (test)", cat: 0, featured: false },
  { slug: "test-automating-lead-intake", title: "Automating lead intake without losing context (test)", cat: 1, featured: false },
];

const JOBS = [
  { title: "Full-stack Developer (test)", department: "Engineering", location: "Remote", type: "full-time", experience: "3+ years" },
  { title: "AI Automation Engineer (test)", department: "Engineering", location: "Remote", type: "contract", experience: "2+ years" },
];

const CASES = [
  { slug: "test-support-assistant", title: "Support assistant for a service team (test)", summary: `${T} A grounded chatbot that answers routine questions and hands off the rest.` },
  { slug: "test-intake-automation", title: "Document intake automation (test)", summary: `${T} Forms and email attachments routed into a CRM with error alerts.` },
];

const REVIEWS = [
  { display_name: "Test Reviewer A", rating: 5, project_or_service: "AI Chatbots (test)", featured: true },
  { display_name: "Test Reviewer B", rating: 5, project_or_service: "Workflow Automation (test)", featured: false },
  { display_name: "Test Reviewer C", rating: 4, project_or_service: "Web Development (test)", featured: false },
];

const SUBSCRIBERS = [
  { email: "test-subscriber-1@example.com", status: "confirmed" },
  { email: "test-subscriber-2@example.com", status: "pending" },
  { email: "test-subscriber-3@aorysoft.invalid", status: "unsubscribed" },
];

// ── seed ────────────────────────────────────────────────────────────────
async function insert(manifest, table, row) {
  const { data, error } = await db.from(table).insert(row).select("id").single();
  if (error) throw new Error(`${table}: ${error.message}`);
  manifest[table].push(data.id);
  saveManifest(manifest);
  return data.id;
}

async function uploadImage(manifest, name, w, h, seed, alt) {
  const path = `${STORAGE_PREFIX}/${name}.png`;
  const { error } = await db.storage.from(BUCKET).upload(path, artwork(w, h, seed), { contentType: "image/png", upsert: false });
  if (error) throw new Error(`storage ${path}: ${error.message}`);
  manifest.storage.push(path);
  saveManifest(manifest);
  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return insert(manifest, "media", { storage_path: path, url: data.publicUrl, alt, width: w, height: h });
}

async function seed() {
  const previous = loadManifest();
  if (previous && !previous.removedAt) {
    console.error(`Manifest already lists seeded rows (${MANIFEST}). Run --remove first; refusing to seed twice.`);
    process.exit(1);
  }
  const m = empty();
  saveManifest(m);
  const today = new Date();
  const day = (n) => new Date(today.getTime() - n * 864e5).toISOString().slice(0, 10);

  const covers = [];
  for (const [i, p] of POSTS.entries()) {
    covers.push(await uploadImage(m, `cover-${i + 1}`, 1600, 900, i + 2, `Abstract signal-line artwork for: ${p.title}`));
  }
  const avatars = [];
  for (const [i] of REVIEWS.entries()) avatars.push(await uploadImage(m, `avatar-${i + 1}`, 256, 256, i + 7, ""));

  const cats = [];
  for (const c of CATEGORIES) cats.push(await insert(m, "categories", c));

  for (const [i, p] of POSTS.entries()) {
    await insert(m, "posts", {
      title: p.title,
      slug: p.slug,
      excerpt: `${T} A short note on ${p.title.replace(" (test)", "").toLowerCase()}.`,
      body_html: `<p><strong>${T}</strong> This post exists only to preview the blog layout and will be removed.</p><h2>Why it matters</h2><p>Placeholder paragraph describing the problem in plain language.</p><ul><li>First point</li><li>Second point</li><li>Third point</li></ul><h2>How we approach it</h2><p>Placeholder paragraph describing an approach. No client, figure, or result is implied.</p><blockquote>A short pull quote for layout testing.</blockquote>`,
      cover_image_id: covers[i],
      author: "AorySoft Team (test)",
      publish_date: day(i * 6 + 1),
      featured: p.featured,
      status: "published",
      category_id: cats[p.cat],
    });
  }

  for (const [i, s] of SERVICES.entries()) await insert(m, "services", { ...s, active: true, sort_order: 100 + i });

  for (const j of JOBS) {
    await insert(m, "jobs", {
      ...j,
      description: `${T} This listing previews the careers layout and is not an open role.`,
      requirements: ["Placeholder requirement one", "Placeholder requirement two", "Placeholder requirement three"],
      responsibilities: ["Placeholder responsibility one", "Placeholder responsibility two"],
      active: true,
    });
  }

  for (const c of CASES) {
    await insert(m, "case_studies", {
      ...c,
      body: `${T} This case study previews the layout only. It describes no real client, figures, or results.\n\nContext: placeholder paragraph.\n\nApproach: placeholder paragraph.\n\nOutcome: placeholder paragraph without metrics.`,
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  for (const [i, r] of REVIEWS.entries()) {
    await insert(m, "reviews", {
      ...r,
      review_text: `${T} Placeholder feedback used to preview the reviews layout. Not a real client review.`,
      source: "other",
      attribution: "Test attribution",
      profile_image_id: avatars[i],
      permission_confirmed: true,
      status: "published",
      sort_order: 100 + i,
      submitter_email: null,
    });
  }

  for (const s of SUBSCRIBERS) {
    await insert(m, "newsletter_subscribers", {
      ...s,
      consent_at: s.status === "confirmed" ? new Date().toISOString() : null,
    });
  }

  console.log("Seeded. Manifest:", MANIFEST);
  for (const t of [...TABLES, "storage"]) console.log(`  ${t}: ${m[t].length}`);
}

// ── remove ──────────────────────────────────────────────────────────────
async function remove() {
  const m = loadManifest();
  if (!m) {
    console.error("No manifest; nothing to remove.");
    process.exit(1);
  }
  if (process.argv.includes("--dry-run")) {
    // Read-only: report what --remove would delete, and how many rows still exist.
    console.log(`DRY RUN — nothing will be deleted. Manifest: ${MANIFEST}${m.removedAt ? ` (already removed ${m.removedAt})` : ""}`);
    for (const table of TABLES) {
      const ids = m[table] ?? [];
      if (ids.length === 0) continue;
      const { count, error } = await db.from(table).select("id", { count: "exact", head: true }).in("id", ids);
      if (error) throw new Error(`dry-run ${table}: ${error.message}`);
      console.log(`  ${table}: would delete ${count ?? 0} of ${ids.length} listed`);
    }
    console.log(`  storage: would remove ${m.storage.length} file(s): ${m.storage.join(", ") || "none"}`);
    return;
  }
  // Dependents first, media last (posts/reviews reference media).
  for (const table of TABLES) {
    const ids = m[table] ?? [];
    if (ids.length === 0) continue;
    const { error, count } = await db.from(table).delete({ count: "exact" }).in("id", ids);
    if (error) throw new Error(`remove ${table}: ${error.message}`);
    console.log(`  ${table}: deleted ${count}/${ids.length}`);
    m[table] = [];
    saveManifest(m);
  }
  if (m.storage.length) {
    const { error } = await db.storage.from(BUCKET).remove(m.storage);
    if (error) throw new Error(`remove storage: ${error.message}`);
    console.log(`  storage: removed ${m.storage.length}`);
    m.storage = [];
  }
  saveManifest({ ...m, removedAt: new Date().toISOString() });
  console.log("Removed everything listed in the manifest.");
}

// --preview <dir>: write the generated artwork locally (no database access).
async function preview() {
  const dir = process.argv[process.argv.indexOf("--preview") + 1];
  writeFileSync(join(dir, "seed-cover.png"), artwork(1600, 900, 2));
  writeFileSync(join(dir, "seed-avatar.png"), artwork(256, 256, 7));
  console.log("Wrote previews to", dir);
}

const run = process.argv.includes("--preview") ? preview : process.argv.includes("--remove") ? remove : seed;
run().catch((error) => {
  console.error("FAILED:", error.message, "\nPartial ids are in the manifest; --remove deletes them.");
  process.exit(1);
});
