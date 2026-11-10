# Product

<!-- impeccable:product-schema 1 -->



## Platform

web

## Users

Primary audience (confirmed): startups, entrepreneurs, small and medium-sized businesses, established companies, enterprises, digital agencies, e-commerce businesses, healthcare providers (hospitals, clinics, medical organizations), educational institutions, product owners, and individual professionals seeking a reliable technology partner.

Typical needs they bring: website development; web and mobile applications; custom software; healthcare software and medical platforms; AI chatbots, agents, and voice assistants; business automation; SaaS products; and broader digital transformation solutions.

Primary job on the site: understand AorySoft’s capabilities, explore services and projects, build trust, and contact the company or request a quote.

Secondary audiences (confirmed):

- Job seekers via Careers
- Internal admins (owner/editor) who manage site content, media, submissions, newsletter, and (planned) reviews through `/admin`

## Product Purpose

AorySoft’s public website is the company’s marketing and lead-generation surface. Success means a visitor can quickly grasp what AorySoft builds, trust that the company is a credible AI-first technology partner, and convert through contact or quote without friction or fabricated proof.

The custom `/admin` panel is the operating surface for publishing content and handling inbound leads (and planned reviews) without a second CMS or auth system.

## Positioning

AorySoft is a technology and software development company that combines modern software engineering, AI, and automation to solve real business problems and build scalable digital products — not a generic “software agency” pitch.

Service offerings (confirmed catalog):

- Website Design & Development
- Custom Web Application Development
- Mobile Application Development
- E-commerce Development
- SaaS Product Development
- Custom Software Development
- AI Chatbot Development
- AI Voice Agents & Virtual Assistants
- AI Agent Development
- Business Process & Workflow Automation
- API Development & Third-Party Integrations
- Admin Panels, Dashboards & CMS Development
- UI/UX Design
- Backend & Database Development
- Cloud Deployment, Integration & Maintenance

Technology coverage (broad capability list; presentation must stay focused on relevant, demonstrable expertise — not equal emphasis on every item):

- Languages: JavaScript, TypeScript, Python, PHP, Java, C#, Go, SQL
- Frameworks / platforms: React, Next.js, Node.js, Express.js, Django, FastAPI, Laravel, .NET, Flutter, React Native
- Data: PostgreSQL, MySQL, MongoDB
- AI & automation: OpenAI and other AI integrations; n8n and workflow automation tools

## Operating Context

- Public visitors browse marketing pages (home sections, blog, careers, legal), then submit contact or multi-step quote forms.
- Admins sign in via Supabase Auth to `/admin` and manage posts, categories, services, jobs, media, submissions, newsletter, site settings, and users/roles.
- Form pipeline (honeypot → Turnstile → rate limit → validate → service-role insert → Resend) is the only public write path; no public INSERT/UPDATE/DELETE RLS policies.
- Content edits revalidate public routes; honest empty/setup states when Supabase is unset.

## Capabilities and Constraints

Confirmed product functionality (shipped or planned as product truth):

- Public marketing site with services, portfolio area, industries, technologies, blog, careers, contact, quote, privacy, terms
- Admin CMS over Supabase (posts, categories, services, jobs, media, submissions, newsletter, site settings, users)
- **Reviews management (shipped):** full admin CRUD for client reviews — display name, review text, rating, source/platform, project or service, optional profile image; add/edit/delete; publish/unpublish; feature; public submission → pending moderation; Fiverr/manual entries require `permission_confirmed` before publish is publicly visible

Hard constraints:

- One auth system (Supabase Auth); no Payload or second CMS
- Never fabricate testimonials, reviews, client logos, metrics, founders/team bios, company history, or unverified project claims
- Demo content, if used in development, must be clearly marked as demo and never published as real testimonials
- Phone numbers and physical addresses stay hidden until verified
- Existing Featured Projects (HealthCare AI, RetailBot, FinTech Analytics Suite) are **unverified placeholders** until real project details are confirmed — never present them as real client work
- Client logos only with permission
- Metrics must not invent client counts, revenue improvements, performance statistics, or similar business claims
- `info@aorysoft.com` is the confirmed public contact email
- Service-role key remains server-only; public writes only through the secured form pipeline

Open decisions (explicitly undecided):

- Public review submission UX (open form vs invite/token link vs post-engagement email) and spam controls beyond existing form patterns
- Exact Fiverr attribution copy and which reviews have display permission
- Which portfolio projects replace the current unverified placeholders, and when
- Which items from the technology coverage list are “demonstrable” enough to feature prominently vs list lightly
- Verified phone and address (remain undisclosed until confirmed)

## Brand Commitments

- Name: **AorySoft**
- Tagline: **“AI-first solutions, real-world impact.”** (candidates may be proposed later; current line remains default until explicitly replaced)
- Contact email: **info@aorysoft.com**
- **Official logo (binding):** geometric stylized **A** mark with blue→cyan gradient + white high-contrast serif wordmark **AorySoft** on black. Source file: `brand/aorysoft-logo.jpg`. The Lucide Zap tile in the current site is a placeholder and must not survive redesign.
- Logo-derived identity constraints: dark/black canvas; blue–cyan signal reserved primarily for the mark and sparse UI accents; display/heading type should harmonize with the logo’s sharp serif; body type stays a clean readable sans; form language favors precise geometry over soft “pill everywhere” chrome.
- Binding visual intent (direction only; not a design system): the site should have a strong, recognizable AI-tech identity — modern, premium, visually impressive — communicating AI, innovation, software engineering, and automation; it should feel like a premium AI-first technology company, not a generic software agency. Visual world, tokens, and layout decisions wait on approved redesign direction.

## Evidence on Hand

- Confirmed: company name, tagline, contact email `info@aorysoft.com`, official logo at `brand/aorysoft-logo.jpg`
- Confirmed intent: genuine Fiverr client reviews exist and will be entered manually via admin once Reviews management ships; display requires attribution and permission
- Absent / must not fabricate: verified phone, address, client logos with permission, published case-study metrics, team/founder content, invented testimonials
- Current Featured Projects copy and stock imagery in the portfolio section are unverified and must not be treated as real client evidence until replaced or confirmed
- Reviews table + `/admin/reviews` + homepage Reviews section shipped; apply `web/supabase/0009_reviews.sql` on the project before using

## Product Principles

1. **Trust over theater** — only publish proof the company can stand behind; placeholders and demo data stay clearly labeled and unpublished as real social proof.
2. **Lead clarity** — every public surface should make capabilities understandable and the path to contact/quote obvious.
3. **AI-first substance** — position around engineering + AI + automation that solves business problems, not buzzword decoration.
4. **Honest operations** — empty states, form errors, and unpublished content tell the truth; never fake success or invent metrics.
5. **One system** — marketing site and admin share one stack and one auth model; new capabilities (e.g. reviews) extend that model rather than adding parallel vendors.

## Accessibility & Inclusion

- Required standard (confirmed 2026-11-09): **WCAG 2.2 AA** across the public site and `/admin`.
- This applies to text and non-text contrast, full keyboard operation with visible focus, accessible names and errors on forms (contact, quote, admin CRUD), and honoring `prefers-reduced-motion`.
- The audience includes healthcare and education organizations, so accessibility is part of being credible to them, not only a compliance item.
