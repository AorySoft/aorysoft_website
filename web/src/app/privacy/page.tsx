import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How AorySoft collects, uses and protects the information you share through our website, contact forms and newsletter.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "November 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-canvas">
      <div className="shell max-w-3xl py-20">
        <h1 className="display-title mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-ink-subtle mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-10 text-ink-muted leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Who we are</h2>
            <p>
              AorySoft builds software, AI systems, and automation for businesses.
              This policy explains what this website collects, why, and what choices
              you have. Questions or requests can go to{" "}
              <a
                href="mailto:info@aorysoft.com"
                className="text-signal underline"
              >
                info@aorysoft.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              Information you give us
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-ink">Contact and quote forms:</strong> your
                name, email address, and any phone number, company, service interest,
                project details or message you choose to include.
              </li>
              <li>
                <strong className="text-ink">Newsletter:</strong> your email address,
                the time you gave consent, and a one-way hash of your IP address.
              </li>
            </ul>
            <p>
              Form submissions are stored in our database and delivered to our team by
              email so we can respond to your enquiry.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              Information collected automatically
            </h2>
            <p>
              To protect the forms from spam and abuse we apply rate limiting. Bucket
              keys are salted, one-way SHA-256 hashes of your IP address or email
              address. We do not store the raw values for this purpose, and the
              hashes expire automatically.
            </p>
            <p>
              We use Cloudflare Web Analytics, which is cookie-free and reports only
              aggregated, anonymous usage statistics (page views, referrers, country,
              device type). We do not use advertising or cross-site tracking cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Cookies</h2>
            <p>
              The public website sets no tracking cookies. Cookies are used only for
              staff signing in to the administration area, to keep that session secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              How we use your information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To reply to enquiries and prepare quotes you request.</li>
              <li>
                To send the newsletter you explicitly confirmed (double opt-in), never
                to an address that has not confirmed.
              </li>
              <li>To keep the site secure and prevent automated abuse.</li>
              <li>To understand aggregate site usage and improve our pages.</li>
            </ul>
            <p>We do not sell your personal information.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              Service providers
            </h2>
            <p>
              We use a small number of processors to run this site: Supabase (database
              and file storage), Resend (delivery of notification and newsletter
              emails), Vercel (hosting) and Cloudflare (analytics and bot protection).
              They process data only to provide those services to us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Retention</h2>
            <p>
              Enquiries are kept while we handle your request and for a reasonable
              period afterwards for our records, then deleted or archived. Newsletter
              addresses are kept until you unsubscribe; every newsletter includes a
              one-click unsubscribe link.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Your choices</h2>
            <p>
              You can ask us to access, correct or delete the personal information you
              have sent us, or to stop contacting you, by emailing{" "}
              <a
                href="mailto:info@aorysoft.com"
                className="text-signal underline"
              >
                info@aorysoft.com
              </a>
              . We will respond within a reasonable time and may need to verify your
              identity first.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Children</h2>
            <p>
              This site is intended for businesses and is not directed at children. We
              do not knowingly collect information from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Changes</h2>
            <p>
              We may update this policy as the site or our tools change. The date at the
              top of this page shows the latest revision.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
