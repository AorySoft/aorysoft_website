# AorySoft Website — Master Implementation Plan (v3.1)

**Status:** Planning only. **No code changes, no installs, no database creation, no deployment.** Awaiting explicit approval of this plan.
**Date:** October 21, 2026. **v3.1 — hardening review of v3**: same scope and decisions; adds verified Vercel limits/pricing, Resend-as-custom-SMTP for Supabase Auth, default-deny RLS around public forms, admin role-escalation controls, honest keep-alive/rate-limit limitations, newsletter double opt-in + unsubscribe, and consistent admin area counts.

---

## 1. Decisions received (v3)

| # | Decision | Consequence for the plan |
|---|---|---|
| 1 | **Database + auth + storage: Supabase Free** as the preferred starting option (PostgreSQL, authentication, potentially file storage) | Sections 4–5: entire data layer moves to Supabase (Postgres + Auth + Storage), with the **inactivity-pause risk documented and mitigated** |
| 2 | **One secure admin panel** managing blogs, categories, services, careers, site content, media, form submissions. **Prefer Supabase Auth** for admin auth if a custom panel is built; if Payload CMS is still recommended, explain how its auth would work with Supabase — **otherwise remove it**; avoid duplicate auth systems | Section 6 documents the full re-review. **Outcome: Payload CMS is removed** (decision matrix in §4.3, design in §6). New design: **custom Next.js `/admin` panel using Supabase Auth — one auth system, one vendor** |
| 3 | **Email: keep Resend** for contact, quote, and newsletter notifications; **store submissions in Supabase**, manageable from the admin panel | Section 7: route handler → insert into Supabase `submissions` → Resend email → admin inbox UI |
| 4 | **Hosting: Vercel Hobby for initial development/testing** if terms allow; clearly document whether production requires Pro | Section 9 now carries an explicit **compliance determination**: Hobby = non-commercial only → production requires Vercel Pro (or another host) |
| 5 | Carry-overs: migration in separate **`web/`** folder, `frontend/` unchanged, **Exa Search removed**, **Team section removed**, **SEO-friendly blog**, **Cloudflare Web Analytics**, **GSC verification prepared** | Sections 4, 10–13 — unchanged from v2 |

---

## 2. Governing skills & rules (unchanged from v1)

Work follows, in priority order: **Superpowers** workflow (github.com/obra/superpowers, MIT — plan → small steps → test → verify), **Ponytail** (github.com/DietrichGebert/ponytail, MIT — least code, never cut validation/tests/a11y/security), **YAGNI** (Fowler — build only confirmed needs), **Vercel `web-design-guidelines`** + **`react-best-practices`** (MIT, `npx skills add vercel-labs/agent-skills`), **Addy Osmani `web-quality-skills`** (`seo`, `performance`, `core-web-vitals`, MIT — measure first, then re-measure), **Anthropic `webapp-testing`** (Apache-2.0 — Playwright verification). Installing these into the project/agent is an approval-gated implementation step (not yet done).

---

## 3. Current-state findings (verified in v1 audits — all still apply to the reference project)

P0: forms don't submit (`console.log` only); placeholder contact data (555 phone, fake address, `#` social links, Vite-logo favicon); zero SEO (same title on all routes, no description/OG/canonical/sitemap/JSON-LD, SPA empty-shell HTML); dead CTAs (case study, portfolio, service CTA, blog Read More, job cards); inconsistent stats (50+/50+/59+, 24/2 vs business hours); stock photo presented as founder; **mobile navigation completely broken** (no hamburger — verified at 390 px: header renders only the logo); no scroll-to-top on route change; no 404.
P1: `npm run typecheck` = **23 errors**, `npm run lint` = **5 errors** (no green baseline); blog category filter empty-state bug; stale content (2023–24 posts, © 2025); no analytics; Quote form no step validation + fake file-upload control.
P2: newsletter inputs label-less; no spam protection plan; backdrop-blur/perf debt; generic template design; missing trust sections.

**Every one of these is fixed during the port (Phase 2–7) — never in `frontend/`.**

---

## 4. Target architecture

### 4.1 Folder layout (existing project untouched)

```
aorysoft-website/
├── frontend/            ← FROZEN reference (Vite app; uncommitted Exa changes stay as-is — verified still present)
├── web/                 ← NEW Next.js App Router app (all future work happens here)
├── PROJECT_PLAN.md      ← this plan
└── .env.example/.gitignore  ← repo-level files added by sponsored task; leave untouched
```

### 4.2 Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** in `web/` | Per-route metadata, prerendered HTML, sitemap/robots/OG, route handlers, server actions, one deployable |
| Database | **Supabase Postgres** (Free tier) | Decision 1: real PostgreSQL + RLS + dashboard; same DB holds all CMS content, submissions, settings |
| Admin auth | **Supabase Auth** (Free) | Decision 2: the *only* auth system in the app; session cookies via `@supabase/ssr`; RLS integrates auth directly into data access |
| Admin panel | **Custom `/admin` built into the Next app** | Decision 2 outcome (§6): covers all nine manageable areas (§4.4) with Supabase Auth; no Payload, no second auth system |
| Media storage | **Supabase Storage** (`media` bucket) | Same vendor, admin-managed, RLS-gated writes; browser uploads direct from client (no Vercel function size limit) |
| Form email | **Resend** (free tier) | Decision 3: submission stored in Supabase → notify inbox via `RESEND_API_KEY` |
| Spam protection | **Cloudflare Turnstile** + honeypot + per-IP/per-email DB rate window (salted IP hashes) | Free, invisible CAPTCHA alternative; no extra vendor |
| Analytics | **Cloudflare Web Analytics** (recommended) | Cookie-free beacon, free, no consent-banner friction; GA4 optional later |
| Hosting | **Vercel** (per decision) | §9: Hobby for dev/testing, **Pro required for production** (compliance) |

### 4.3 Alternatives considered — including the Payload CMS re-review (decision 2)

**Re-review outcome: Payload CMS is removed from the plan.** The four architectures that could still host the panel were evaluated against your two hard constraints — *Supabase Auth for admin authentication* and *no unnecessary duplicate authentication systems* — alongside the two alternatives carried over from v2:

| Option | Auth story with Supabase | Admin capability | Verdict |
|---|---|---|---|
| **A. Custom `/admin` + Supabase Auth** ⭐ | **Native Supabase Auth — exactly one auth system**; RLS policies call `auth.uid()` directly | All nine areas of §4.4 built by us (conventional CRUD + rich text + media) | ✅ **Chosen** — see §6 for the design |
| **B. Payload + its built-in auth** | Payload stores its **own users** in its own `users` table and issues **its own JWT session cookies** (`PAYLOAD_SECRET`, 2 h default expiry, [auth docs](https://payloadcms.com/docs/authentication/overview)). Supabase Auth would sit unused → a parallel auth system and no Supabase Auth — conflicts with both your preference and the no-duplication rule. **There is no official Payload↔Supabase Auth adapter** (verified Oct 2026 — Payload docs cover only built-in + custom strategies) | Rich CMS free: drafts, versions, live preview, access control | ❌ Removed |
| **C. Payload + community Supabase bridge** (`@dombestein-data/payload-supabase-auth`) | Verifies Supabase tokens and exchanges a Supabase browser session for a Payload session cookie — works in principle, but: v1.2.0, **first release Aug 2026**, requires Payload ^3.87.0, its own README warns you must still write Payload access rules; two session mechanisms remain underneath | Rich CMS free | ❌ Immature dependency carrying the auth-critical path of a production site |
| **D. Payload custom strategy (hand-rolled Supabase verifier)** | Advanced Payload extension point we'd own and maintain ourselves | Rich CMS free | ❌ Custom security code + Payload maintenance anyway |
| E. Hosted CMS (Sanity/Hygraph) | separate roles/auth | good editors | ❌ (v1/v2) no form-submissions inbox; quotas/lock-in (Hygraph free 1k entries, then Growth $199/mo) |
| F. Git-based (Decap/Keystatic/Tina) | git permissions | no inbox | ❌ (v1/v2) content-as-commits, poor fit for nontechnical owner |

**Additional factors in removing Payload:** a stream of admin/auth security advisories requiring vigilant patching (CVE-2025-4643 logout bypass → 3.44.0; CVE-2026-25574 → 3.74.0; CVE-2026-34748 stored XSS → 3.78.0; CVE-2026-34751 password-recovery takeover → 3.79.1), heavier Vercel serverless builds, and a config/schema layer we'd maintain beside our own. What Payload offered for free (admin UI, drafts, media, roles) is replaced by a **focused custom admin** over plain Supabase tables — which stays portable (content can migrate to any CMS later) and gives the Supabase Auth + RLS security model you asked for.

**Rejected previously (unchanged):** hosted headless CMSes, git-based CMSes, Directus/Strapi (separate service to host; MSCL license review), Vercel Blob (Supabase Storage chosen instead), Neon (superseded by decision 1).

### 4.4 Admin panel: what is manageable vs static

**Manageable in `/admin` — nine areas, no code changes:**

| Area | Supabase table(s) | Fields (essence) |
|---|---|---|
| Blog articles | `posts` | title, slug, excerpt, **rich-text body** (Tiptap WYSIWYG, sanitized on render), cover image (from media library), author, publish date, featured flag, **status: draft/published**, **per-post SEO** (meta title/description/OG image) |
| Blog categories | `categories` | name, slug, description |
| Form submissions | `submissions` (type: contact \| quote) | name, email, phone, service, message, quote details (JSONB), **status: new/read/replied/archived**, created date; admin list/search/detail/status/export/delete |
| Newsletter | `newsletter_subscribers` | email (unique), **status: pending/confirmed/unsubscribed**, consent timestamp + hashed IP, signed confirmation/unsubscribe tokens; admin list/export/delete |
| Services | `services` | title, subtitle, description, features[], icon/color, sort order, active toggle |
| Careers | `jobs` | title, department, location, type, experience, description, requirements[], responsibilities[], active toggle |
| Site content | `site_settings` (single row, JSONB) | hero copy + badge, **verified** stats, about text (founder block removed — owner decision), footer contact + social URLs, industries, tech list, testimonials (when sourced), CTA copy |
| Media | `media` table + `media` Storage bucket | upload, alt text, dimensions; public reads, admin-only writes (RLS) |
| Admin users | Supabase Auth + `profiles` (role) | owner/editor roles (permission matrix §5.5); created in Supabase dashboard with **Auto Confirm User** (public signups disabled); password reset via Resend SMTP + free TOTP MFA |

**Static (code, changes only via deploy):** layout/design system/animations, routing & navigation structure, security logic (Turnstile, rate limits, auth middleware, RLS policies), newsletter confirm/unsubscribe **token routes**, sitemap/robots/metadata rules, analytics wiring, legal pages (privacy/terms), redirects. **Team content: removed entirely — no collection, no page, no card, no stats.** **No Exa Search.**

**Deliberately deferred (YAGNI, revisit on request):** document version history/revisions, live preview, scheduled publishing — a draft/publish toggle plus admin-only draft preview covers the confirmed need.

---

## 5. Supabase — database, auth, storage (decision 1)

### 5.1 Why Supabase fits (given your decision)

Postgres (portable, right data model for CMS content) + Auth (admin sign-in, one system) + Storage (media) in **one vendor, one dashboard, one free tier**. Row Level Security ties it together: data-access rules live in the database and apply whether a request comes from the admin UI or a direct API call. For a low-traffic site (~500 MB max DB, 1–2 admin users, a few hundred images) the Free tier is comfortably sufficient **if the pause risk below is managed**.

### 5.2 Free-tier limits (verified Oct 2026 — [pricing](https://supabase.com/pricing), [billing quotas](https://supabase.com/docs/guides/platform/billing-on-supabase), [pausing](https://supabase.com/docs/guides/platform/free-project-pausing))

| Area | Free limit | Notes for this project |
|---|---|---|
| Projects | **2 active** (paused don't count) | 1 project used |
| **Inactivity pause** | Project paused after **~7 days of low activity** (few user DB queries) | ⚠️ the main risk — see §5.3 |
| Database | **500 MB** Postgres disk | Content + submissions ≪ 50 MB realistically |
| Auth | **50,000 MAU**; basic TOTP MFA included (advanced phone MFA & SAML SSO paid) | only 1–2 admin users — trivial |
| Storage | **1 GB** files, **5 GB uncached + 5 GB cached egress/mo**, **50 MB max file**, S3-compatible (subset) | media is the quota to watch; optimize images |
| Pooling | Supavisor **transaction pooler, port 6543, free** — recommended for serverless/Vercel; disable prepared statements in client | used for migrations/psql; runtime access goes through supabase-js (HTTP), not direct SQL |
| Unused | Edge Functions 500k/mo, Realtime — not used | — |
| **Overage behavior** | **No automatic billing**: quota-exceeded → notification → Fair Use restrictions may follow (pause, read-only DB, or 402 API responses) | monitor emails/alerts; stay in quota |

**If usage exceeds free tier:** **Supabase Pro = $25/mo** (first project; includes $10 compute credits; 8 GB disk, 100 GB storage; **removes inactivity pausing**). For this site that is the only realistically expected paid step.

### 5.3 Inactivity-pause risk & mitigation (documented per decision 1)

A paused project makes the whole site error until resumed (data survives — restore within 1 year returns everything). A quiet production site with ISR-cached pages can genuinely go days without a DB query. Mitigations, layered:

1. **Daily keep-alive** — a tiny server-only endpoint (a few public-content `SELECT`s through the anon key) called by **Vercel cron**. Supabase's stated guidance is "a few user database queries daily during the week". The endpoint requires Vercel's `Authorization: Bearer ${CRON_SECRET}` header — never public — and its responses are logged so we can prove it ran.
2. **Warning-email monitoring** — Supabase emails before pausing; treat any such email as urgent (resume from dashboard or generate activity).
3. **Natural activity** — admin logins and content edits count; visits to uncached/ISR-revalidated pages count.
4. **Guaranteed fix:** upgrade to **Pro $25/mo** the moment availability matters more than the workaround — recommendation point for go-live if the keep-alive proves unreliable.

**Keep-alive limitations, stated honestly:** Supabase's exact pause threshold is **unpublished and discretionary** — the cron is a best-effort heuristic, not a guarantee, and a Free project can still be paused. On Hobby the cron runs **once per day, in production deployments only**, at an imprecise time within the scheduled hour, and a failed invocation fails silently — hence the logged responses and the warning-email watch. If the site launches on the Free tier, treat a pause as *when*, not *if*, and budget Supabase Pro accordingly.

*Development/testing on Free is low-risk regardless: the site isn't serving production traffic yet and any pause is a dashboard click away.*

### 5.4 Environment variables (new app `.env.example`; secrets server-side only)

| Var | Purpose | Sensitivity |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | public by design |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key — safe in browser **because RLS governs it** | public by design |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only: public-form insert path, seeding/ops, role changes | 🔒 **secret — never `NEXT_PUBLIC_`, never shipped to client; rotate if ever exposed** |
| `DATABASE_URL` (optional) | Supabase **pooler** URL (port 6543) for schema migrations/psql only — not used at runtime | 🔒 secret |
| `CRON_SECRET` | Vercel-injected secret protecting the keep-alive cron endpoint (§5.3) | 🔒 secret |
| `RESEND_API_KEY` | Form/newsletter emails | 🔒 secret |
| `TO_EMAIL` / `FROM_EMAIL` | Inbox destination + verified sender domain | semi-public |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Spam protection | public/secret pair |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (metadata/sitemap) | public |
| `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | Web Analytics beacon | public by design |
| `GOOGLE_SITE_VERIFICATION` | GSC meta-tag method (if used instead of DNS) | public |
| ~~`PAYLOAD_SECRET`~~ · ~~`BLOB_READ_WRITE_TOKEN`~~ · ~~`EXA_API_KEY`~~ | **Removed** — no Payload, Supabase Storage instead of Blob, Exa removed (decision 5) | — |

### 5.5 Security considerations

- **RLS on every table — default-deny, the core control.** The anon role gets exactly one capability: `SELECT` on *published* content (`posts`/`services`/`jobs` with `status='published'`, public settings, public media) — enough to render the public site server-side. **There are deliberately no public `INSERT`/`UPDATE`/`DELETE` policies anywhere, including on the form tables:** every write — public form submissions included — happens inside a Next.js route handler that uses the **service-role key after Turnstile + honeypot + rate check + validation** (§7), so anyone holding the public anon key can never write to the database directly. DB `CHECK` constraints (length caps, email format, enum values) are a second layer beneath application validation. Content/PII reads, updates and deletes require the hardened helpers below. Direct-API tests must prove anon-key requests are denied everywhere except published-content reads.
- **Admin roles & escalation resistance:** roles are `owner`/`editor` in `profiles`, read by `SECURITY DEFINER` helpers `is_admin()`/`is_editor()`. **`profiles` has no client-side `INSERT`/`UPDATE` policy at all** — a user may only `SELECT` their own row — so an editor cannot self-promote by patching `profiles`, and role values sent from the client are never trusted. Role changes occur only through a service-role-key path (owner-verified server action or dashboard SQL). **Permission matrix:** *owner* = everything (users, roles, site settings, deletions); *editor* = posts, categories, services, jobs, media, submission status transitions — **not** user/role management, site settings, or subscriber management. Enforcement lives in RLS policies (hiding UI buttons is cosmetic); escalation attempts via direct API are part of the denial-test suite.
- **Service role key bypasses RLS** — server-only: the public-form insert path, seeding, ops, role changes; audit at build time that it never reaches a client bundle; rotate immediately if exposed.
- **Auth:** Supabase Auth email+password for admins; session cookies HTTP-only via `@supabase/ssr`, refreshed in `middleware.ts` which guards `/admin/*`; **public signups disabled** — admins are created in the Supabase dashboard with **Auto Confirm User** (no confirmation email needed); free **TOTP MFA** on the owner account. **Email delivery: Supabase's built-in sender is not used** — it is capped at **2 emails/hour**, best-effort with **no SLA**, and **refuses delivery to addresses outside the Supabase organization** ([SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp), [rate limits](https://supabase.com/docs/guides/auth/rate-limits)). Instead, **Resend is configured as Supabase's custom SMTP from day one** (`smtp.resend.com`, port 465, username `resend`, password = the existing Resend API key — [Resend's Supabase guide](https://resend.com/docs/send-with-supabase-smtp); default 30 emails/hour, adjustable) — no new vendor and no new app env vars, since the credentials live in Supabase's dashboard settings. The password-reset UI surfaces `429`/`over_email_send_rate_limit` errors honestly instead of claiming an email was sent.
- **One auth system only** (decision 2): Supabase Auth is used everywhere; there is no second user table, no separate session JWT library.
- **Forms:** Turnstile verified **before any database write** + honeypot + per-IP **and per-email** rate check (DB window table of **salted IP hashes**, pruned by cron — serverless-safe, no extra vendor) + server-side validation mirroring client; email via Resend's structured API (no raw header injection). Rate limiting is defense-in-depth, not a hard guarantee — if spam escalates, the documented upgrade path is Cloudflare or Upstash rate limiting (scope change requiring your approval).
- **PII:** submissions admin-only (RLS), never listed publicly; export/delete workflow; privacy-policy mention.
- **Stored-XSS defense for admin-authored content:** rich text sanitized on render (sanitize-html/isomorphic DOMPurify) + CSP headers (`next.config`), plus HSTS/X-Content-Type-Options/Referrer-Policy; dependency audit in CI; upload type/size validation.
- **Secrets:** `.env` gitignored (repo root already ignores `.env*` with `!.env.example`); `.env.example` committed with empty values only.

### 5.6 Costs beyond free (verify at signup — prices change)

| Service | Free | First paid step |
|---|---|---|
| Supabase | 500 MB / 1 GB storage / pause risk | **Pro $25/mo** (removes pause, 8 GB disk, 100 GB storage) |
| Resend | ≈3,000 emails/mo, 100/day, 1 domain | paid ≈ $20/mo |
| Vercel | Hobby: hard usage **caps** — the affected service pauses until reset and extra usage cannot be bought (§9) | **Pro $20/mo** platform fee (includes the first seat **and** a $20/mo usage credit; extra seats +$20/mo) — **required for production (§9)** |
| Turnstile / Cloudflare Web Analytics | free | — |

**Realistic production cost: ≈$20/mo (Vercel Pro) + $0 Supabase/Resend. Comfortable tier ≈$45/mo (+ Supabase Pro if the pause workaround proves insufficient).**

---

## 6. Admin panel & authentication design (decision 2)

### 6.1 Choice

**Custom `/admin` panel inside the Next app, authenticated exclusively by Supabase Auth** — Payload CMS removed for the reasons in §4.3. One app, one deploy, one auth system, one vendor.

### 6.2 Auth flow (end to end)

1. **Visit `/admin`** → `middleware.ts` reads the Supabase session cookie (`@supabase/ssr`), refreshes it if expired; no session → redirect `/admin/login`.
2. **Sign in** → Supabase Auth email+password → HTTP-only session cookies (`sb-*`); no token in `localStorage`.
3. **Authorization** → `profiles.role` (`owner`/`editor`) gates UI + routes per the **permission matrix in §5.5**; **RLS is the real enforcement** — every query/mutation runs under the caller's JWT, so a bypassed UI still cannot read or write what policy forbids, and `profiles` is never client-writable (no role self-promotion).
4. **Bootstrap** → owner creates the first admin in the Supabase dashboard + sets role via SQL provided in Phase 1; public signups stay disabled; later editors can be invited the same way.
5. **Recovery/MFA** → Supabase password-reset email delivered via **Resend custom SMTP** (§5.5; the UI surfaces 429 rate-limit errors instead of faking success); TOTP MFA on the owner account.

### 6.3 Admin panel build (what we're actually building)

Route group `app/(admin)/admin/**` with a shared authenticated layout (sidebar: **Dashboard** overview plus the nine §4.4 areas — Posts, Categories, Services, Jobs, Submissions, Newsletter, Media, Site Settings, Users) using a standard component stack (shadcn/ui-style components + TanStack Table + **Tiptap** editor) — conventional CRUD, not a bespoke CMS:

- **Dashboard:** counts (new submissions, published posts, subscribers).
- **Posts/Categories/Services/Jobs:** list (search/sort/paginate) + editor forms; autosave off, explicit Save; on content save call `revalidatePath`/`revalidateTag` for affected public routes so ISR re-renders.
- **Submissions inbox:** filter by type/status, detail view, status transitions, CSV export, delete.
- **Media:** grid + upload (browser → Supabase Storage directly with the user's session; RLS allows write only for admins), alt text, copy URL, delete with orphan check.
- **Site Settings:** one typed form bound to `site_settings` JSONB (owner-only per §5.5); editors have no access.
- **Draft preview:** admin-only route reads drafts by session (public sees only `status='published'`).

**Effort note (honest trade-off):** this is more first-party code than Payload's free UI — nine CRUD areas plus the dashboard overview. In exchange: Supabase Auth as requested, no second auth system, no Payload advisory treadmill, RLS defense-in-depth, lighter builds, full design control, portable schema. Mitigations for the extra code: conservative component stack, shared form/table primitives, tests on the mutation paths, and a security review pass (Phase 3 gate).

---

## 7. Forms → email inbox (decision 3)

**Flow:** browser → Next route handler (**Turnstile verified before any DB write** → honeypot → per-IP/per-email rate check → server validation) → **insert into Supabase `submissions` via the service-role key** (admin inbox; no public INSERT policies exist — §5.5) → **Resend sends the notification email** to `TO_EMAIL` → honest on-site success/error states (no fake success).

- **Contact form** → `type='contact'` + email to inbox.
- **Quote multi-step form** → `type='quote'` with per-step validation, summary rendered as HTML email; fake file-upload control dropped per YAGNI unless you need attachments.
- **Newsletter (double opt-in + one-click unsubscribe)** → public form creates a `pending` row (service-role path) → **Resend sends a confirmation email with a signed token link** → status flips to `confirmed` only on click; **no newsletter email is ever sent to an unconfirmed address**. Every newsletter email carries an **unsubscribe link** (signed token route, no login required, plus a `List-Unsubscribe` header) → status becomes `unsubscribed`; consent timestamp + hashed IP stored for compliance; subscriber list exportable from admin.
- **Admin manageability** (decision 3): every submission is visible/editable (status) in `/admin` — never code changes.
- **Verification:** Vitest+MSW unit tests (validation, rate-limit, error paths), Playwright end-to-end with mocked API including **newsletter confirm + unsubscribe token flows**, then **one real staging email proving inbox delivery** and **one real Supabase password-reset email via the Resend SMTP path** (requires Resend account + verified domain DNS — owner step at implementation).

---

## 8. Blog with proper SEO (carry-over decision)

- `posts`/`categories` tables; public routes `/blog` (server-side category filter **with empty state** — fixes the v1 bug) and `/blog/[slug]` prerendered with ISR; publish toggles revalidate the route.
- Per-post `generateMetadata` (unique title/description/canonical/OG+Twitter image), `BlogPosting` + `BreadcrumbList` JSON-LD, `app/sitemap.ts` including all published posts; RSS skipped unless requested (YAGNI).
- Rich text from the admin editor, **sanitized on render**; only real, authored articles ship — the six hardcoded 2023–24 posts are not imported unless you approve them as genuine (v1 finding #10).

---

## 9. Hosting on Vercel (decision 4) — compliance determination

**Determination (documented per your instruction):**

- **Vercel Hobby** ([plans](https://vercel.com/docs/plans/hobby), [fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)) is restricted to **non-commercial personal use**; commercial use requires Pro/Enterprise.
- **AorySoft's production website is a commercial asset** — an agency site whose purpose is winning clients and generating business inquiries. Therefore: **production hosting on Hobby would not comply with Vercel's terms.**
- **Conclusion:** Hobby is acceptable for **initial development and testing** (local work, private previews, iteration — the standard use case while the site is not serving commercial production traffic). **The production launch requires Vercel Pro — $20/mo platform fee, including the first deploying seat and a $20/mo usage credit (additional Owner/Member seats +$20/mo each; Viewers free) — or a different host.** Alternative hosts (Cloudflare Workers via OpenNext, Netlify) exist but add tooling; recommendation: **budget Vercel Pro for go-live** — decision recorded in Phase 0.

**Hobby technical limits (dev/testing; verified Oct 2026 — [Hobby plan](https://vercel.com/docs/plans/hobby), [limits](https://vercel.com/docs/limits), [image-optimization pricing](https://vercel.com/docs/image-optimization/limits-and-pricing)):** 100 GB Fast Data Transfer/mo · 1M CDN requests · 1M function invocations · 300 s max function duration · builds ≤45 min each on included basic machines · cron **once/day** with imprecise timing (feeds the Supabase keep-alive, §5.3) · 50 custom domains · **5,000 image transformations/mo** (+300k image-cache reads + 100k cache writes; beyond the cap new image URLs return 402 while already-cached images keep working). **Hobby has no overage billing at all — exceeding a cap pauses that service until the ~30-day reset, and extra usage cannot be purchased.**
**Pro technical terms ([Pro plan](https://vercel.com/docs/plans/pro-plan), [pricing](https://vercel.com/pricing)):** Flat Rate CDN **1 TB transfer + 1M CDN requests/mo**; function and image usage bill against the included $20 credit, then on demand (image transformations from $0.05/1k); builds $0.007/min; cron up to once/minute.

**Deploy flow:** GitHub repo → project root `web/` → env vars from §5.4 → preview deployments per PR → production on Pro at go-live (publishing only on your explicit authorization).

---

## 10. Analytics (carry-over) — recommend Cloudflare Web Analytics

| | Cloudflare Web Analytics ⭐ | GA4 |
|---|---|---|
| Cookies | **None** | cookies/identifiers → consent management where legally required |
| Cost | Free | Free |
| Install on Vercel | JS beacon before `</body>` — no DNS move needed | Google tag in `<head>` |
| Data | 6-month dashboard; 7-day raw then ~10% aggregated | rich events/attribution |
| Weakness | ad blockers can block the beacon | consent burden + heavier |

**Recommendation:** Cloudflare Web Analytics primary + **Google Search Console** for search/CWV (neither analytics product replaces GSC). GA4 later only if campaign attribution becomes a real need (YAGNI now).

---

## 11. Google Search Console setup (carry-over)

**Recommended: Domain property + DNS verification** (covers `www` + subdomains) — [add property](https://support.google.com/webmasters/answer/34592), [verification methods](https://support.google.com/webmasters/answer/9008080).

| Step | Who | Detail |
|---|---|---|
| Create property in Google account, choose **Domain**, enter bare domain | **Owner (you)** | Do not share Google credentials |
| Add Google's **TXT record** at your DNS provider | **Owner (you)** — I provide exact record/value + click-path | Alternative: URL-prefix + HTML meta tag wired via `GOOGLE_SITE_VERIFICATION` |
| Click **Verify** | Owner | DNS propagation can take time |
| Ensure `https://domain/sitemap.xml` is live | Agent (`app/sitemap.ts`) | I validate public reachability |
| **Sitemaps → submit `sitemap.xml`** | Owner (after launch) | Discovery hint, not indexing guarantee |
| Monitor Coverage/CWV | Both | New-site indexing typically **days to weeks**; same-day indexing not expected |

I prepare: sitemap, robots.txt, verification tag/instructions, pre-launch checklist, post-launch indexability validation of every submitted URL.

---

## 12. Team removal (carry-over — expanded)

| Change | Where |
|---|---|
| Delete Team page + route | `web/` never creates `app/team/` (old `frontend/src/pages/Team.tsx` untouched as reference) |
| No Team nav/footer links | port Navbar/Footer **without** Team entries |
| **Remove "Team" value card** (Mission/Vision/Values/**Team**) | About section → 3 cards (or a true "Expertise" card — your call) |
| **Remove `15+ Team Members`** + every unverified stat: `59+`, conflicting `50+`s, `95%/98%/4.9` ratings | **replace only with numbers you confirm** |
| `/team → /` redirect | during SEO phase if the old site ever gets indexed |
| **Kept:** Careers "Join **Our Team**" CTAs (recruitment copy, unrelated) | |

---

## 13. Migration plan (separate folder — no changes to `frontend/`)

**Parity gates between every step: `npm run typecheck` + `lint` green, Playwright smoke, visual screenshot comparison old-vs-new.**

1. **Gate:** your approval of this plan + Phase 0 assets/accounts.
2. Scaffold `web/` — Next.js App Router + TypeScript + Tailwind (match the old site's Tailwind v3 config so ported classes render identically) on React 19.
3. **Supabase provisioning** (only when you approve implementation): create project → apply SQL schema (tables from §4.4) → enable RLS + policies (**default-deny per §5.5**) → **custom SMTP via Resend** → `profiles`/admin bootstrap (Auto Confirm User) → storage bucket. Schema files live in the repo (`web/supabase/`).
4. Port UI: sections/pages become **server components** by default; `'use client'` only for Framer Motion/stateful islands; `next/link` replaces react-router; fix during port — mobile hamburger, scroll restoration, 404, dead CTAs, blog filter, `window`-in-render particle math (§3).
5. Admin panel per §6 (login → middleware → CRUD areas → media → submissions inbox) + seed collections with **your real content**.
6. Forms + Resend + Turnstile (§7). SEO layer (§8, §11-prep). Analytics beacon (§10).
7. Performance & motion pass (targets: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1, Lighthouse ≥90), a11y pass (axe/pa11y zero serious), design/trust pass with real assets.
8. Deploy to **Vercel** — Hobby preview first; **production publish on Pro only on your explicit authorization** → domain + env vars → **owner-led GSC verification + sitemap submission** → analytics dashboard check.
9. Final acceptance: forms deliver a real email to your inbox; admin can edit every item in §4.4 without code; RLS denial tests pass (anon key cannot read PII/content it shouldn't); Lighthouse ≥90 all categories; zero broken links; clean axe run; OG previews correct; mobile nav works; GSC property verified with sitemap submitted.

**Rollback:** `frontend/` remains fully deployable as-is throughout; nothing is deleted.

---

## 14. Revised phased roadmap (all work in `web/`)

| Phase | Objective | Depends on | Key verification |
|---|---|---|---|
| **0** | Approve plan; assets (real contact data, logo/favicon, verified stats, founder photo or removal, domain/DNS access); accounts (Supabase, Vercel, Resend, Cloudflare Analytics, Google) created by you or with your consent; **Vercel Pro budget decision** | your approval | baseline recorded (typecheck 23 / lint 5 errors) |
| **1** | Scaffold `web/` + **Supabase schema + RLS (default-deny) + Auth middleware + admin login skeleton + Resend-as-SMTP config**; copy Tailwind design tokens; CI checks green from day one | 0 | build green; anon-key denial + role-escalation attempt tests pass |
| **2** | Port all pages/sections **with v1 P0/P1 fixes folded in** (mobile nav, scroll, 404, dead CTAs, blog filter, stats cleanup pending real numbers) | 1 | Playwright route smoke + visual parity vs `frontend/` |
| **3** | **Build `/admin` CRUD areas** (§6.3), media uploads, seed real content, security pass (RLS review, service-key audit, HTML sanitization) | 1 | admin CRUD round-trip; direct-API PII reads denied; XSS test payload sanitized |
| **4** | Forms → Supabase + Resend inbox + Turnstile/rate limits + validation | 3 | MSW/Vitest + Playwright + **one real email to your inbox** |
| **5** | SEO: per-route metadata, OG images, JSON-LD, sitemap/robots, redirects, blog article SEO | 2 (content from 3) | view-source per route; Rich Results Test; link crawl 0 errors; GSC-prep checklist |
| **6** | Performance & motion (images local AVIF, cut particles, `prefers-reduced-motion`, blur budget, fonts) | 5 | Lighthouse CI ≥90 perf; before/after numbers recorded |
| **7** | Accessibility & UX hardening (keyboard, focus, modal, contrast, labels) | 2 | axe/pa11y zero serious; keyboard walkthrough |
| **8** | Design & credibility (typography system, trust sections with **real** logos/testimonials/case studies only) | 0-assets, 6-7 | `web-design-guidelines` review; screenshots @390/768/1440 |
| **9** | Deploy (Hobby preview → **Pro for production**) → keep-alive cron (`CRON_SECRET`-protected, responses logged) → **GSC verify + sitemap submit (you)** → analytics live | all | §13.9 acceptance checklist |

**Why this order:** accounts/assets gate everything → schema+auth before pages/admin (both consume it) → content before SEO → SEO stable before performance polish → visuals last so promotion happens on the final product.

---

## 15. Verification & targets (unchanged)

typecheck+lint green (exit codes checked directly) · Playwright per interactive change (Anthropic `webapp-testing` skill) · Vitest+MSW for forms · **RLS denial + role-escalation tests via direct API (anon key / editor session)** · real password-reset email via Resend SMTP delivered · axe/pa11y zero serious · Lighthouse ≥90 (Performance/A11y/SEO/BP) · CWV LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 @p75 · link crawl (`linkinator`/`lychee`) 0 broken · Nu Html Checker · Rich Results + schema validators · OG preview via metatags.io · real inbox delivery test · **Supabase pause keep-alive verified hitting DB**. **No claimed improvement without a before/after measurement.**

---

## 16. Risks (v3.1)

| Risk | Mitigation |
|---|---|
| **Supabase inactivity pause → production outage** | §5.3 layered plan: daily keep-alive cron (CRON_SECRET-protected, responses logged — best-effort only, since Supabase's threshold is unpublished and Hobby cron runs once/day) + warning-email monitoring + natural activity; **Pro $25/mo** remains the guaranteed fix |
| Supabase free overages are not auto-billed (fair-use: pause/read-only/402) | quotas monitored (500 MB DB / 1 GB storage / 10 GB egress); alert emails actionable; Pro when growth demands |
| **Custom admin = more first-party code than Payload** | §6.3: conservative stack (shadcn/TanStack/Tiptap), shared primitives, tests on mutations, dedicated security review gate in Phase 3 |
| **RLS misconfiguration exposes PII or content** | default-deny policies; direct-API denial tests in Phase 1/3; service-role key server-only (bundle audit) |
| **Role escalation via `profiles` (editor → owner)** | `profiles` has no client-side INSERT/UPDATE policy; role changes are service-role-only after owner verification; `SECURITY DEFINER` helpers; direct-API escalation attempts must be denied (Phase 1/3 tests) |
| **Bots spamming the public forms / bloating the DB** (anon key is public) | No public INSERT policies anywhere — writes only via the server route handler; Turnstile verified before any DB write; honeypot; per-IP/per-email rate window on salted hashes (pruned by cron); DB CHECK constraints; upgrade path (needs your approval): Cloudflare/Upstash rate limiting |
| **Auth emails never arrive** (Supabase built-in sender: 2/hour, org-recipients-only, no SLA) | Resend configured as Supabase custom SMTP in Phase 1 (§5.5); dashboard admins auto-confirmed; reset UI surfaces 429 errors |
| Stored XSS via admin-authored rich text | sanitize on render + CSP headers + Payload-style advisory vigilance on editor deps |
| Supabase Storage quotas (1 GB / 10 GB egress / 50 MB file) | image optimization (AVIF/WebP), monitor dashboard; Vercel 5,000 image-ops/mo cap also watched |
| Vercel Hobby commercial-use policy | §9 determination: **Pro required for production**; Phase 0 budget decision |
| Resend needs a **verified sending domain** (DNS records) | owner DNS step scheduled in Phase 4 checklist |
| GSC requires owner Google + DNS actions | split responsibilities pre-defined (§11); I prepare everything else |
| Old `frontend/` has uncommitted sponsored changes (Exa — verified present) | Frozen — never staged, never modified; only read as reference; Exa simply not ported |
| Fake/stale content sneaks in | Content rule: only assets/claims you approve; nothing fabricated |
| Scope creep (i18n, member accounts, bookings, dashboards, version history) | Ponytail + YAGNI gate: every addition needs a stated current need |

---

## 17. Still needed from you (Phase 0)

1. **Approval of this plan** (explicit, per your instruction).
2. Real contact details (phone, address, social URLs) or approval to drop those fields.
3. Logo/favicon + brand direction (or approve us defining a type/color system).
4. Verified stats only — give numbers you can stand behind, or approve removing stat rows.
5. Founder block: ~~real photo+bio, or remove/replace~~ — **decided (Phase 3): removed entirely**, no founder section anywhere.
6. Domain name + registrar/DNS access method (for GSC TXT + Resend domain verification).
7. Account creation preferences: **Supabase**, Vercel, Resend, Cloudflare (analytics), Google — you create them, or you approve me to guide/provision each with your consent.
8. **Vercel Hobby-vs-Pro confirmation** (§9 determination: Pro required for production — confirm budget or name an alternative host).
9. **Admin sign-in preference:** email+password (recommended) vs magic link; admin email address for the first account; whether to enable TOTP MFA (recommended for owner).
10. Trust assets when available: client logos (with permission), named testimonials, real case-study metrics.
11. Approval to install the free skills/rules in §2 during implementation.

---

*Nothing has been implemented: no code changed, no dependencies installed, no accounts or databases created, nothing deployed. Implementation starts only on your explicit approval of this plan.*
