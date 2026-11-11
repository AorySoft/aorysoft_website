import type { Metadata } from "next";
import PageHero from "@/components/patterns/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How AorySoft collects, uses and protects the information you share through our website, contact forms and newsletter.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "November 2026";

export default function PrivacyPage() {
  return (
    <main className="bg-canvas">
      <PageHero eyebrow="Legal" title="Privacy Policy" lead={`Last updated: ${LAST_UPDATED}`} compact />
      <div className="shell section-y">
        <div className="max-w-3xl space-y-10 leading-relaxed text-ink-muted">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">Who we are</h2>
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
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">
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
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">
              Information collected automatically
            </h2>
            <p>
              To protect the forms from spam and abuse we apply rate limiting. Bucket
              keys are salted, one-way SHA-256 hashes of your IP address or email
              address. We do not store the raw values for this purpose, and the
              hashes expire automatically.
            </p>
            <p>
              We use Cloudflare Web Analytics and Vercel Analytics on the public
              site only. Both report aggregated, anonymous usage statistics (page
              views, referrers, country, device type) and neither sets cookies.
              Staff activity under /admin is not tracked. We do not use
              advertising or cross-site tracking.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">
              Cookies and browser storage
            </h2>
            <p>
              The public pages of this website set no cookies and store nothing in
              your browser. The only cookie we set is for staff who sign in to the
              administration area. Some third-party services we load may set their
              own strictly necessary security cookies on their own domains.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <caption className="sr-only">Cookies and storage used on this website</caption>
                <thead>
                  <tr className="border-b border-line text-ink">
                    <th scope="col" className="py-2 pr-4 font-medium">Name</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Set by</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Purpose</th>
                    <th scope="col" className="py-2 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-line">
                    <td className="py-3 pr-4 font-mono text-xs text-ink">sb-…-auth-token</td>
                    <td className="py-3 pr-4">AorySoft (Supabase sign-in), staff only</td>
                    <td className="py-3 pr-4">Keeps a staff member signed in to /admin. Never set for visitors of the public pages.</td>
                    <td className="py-3">Until sign-out, at most about 400 days</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 pr-4 font-mono text-xs text-ink">__cf_bm</td>
                    <td className="py-3 pr-4">Cloudflare, on the domains of services we load (for example image storage)</td>
                    <td className="py-3 pr-4">Bot protection for that service. Set on their domain, not ours; many browsers block it as a third-party cookie.</td>
                    <td className="py-3">About 30 minutes</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 pr-4 font-mono text-xs text-ink">Cloudflare Turnstile</td>
                    <td className="py-3 pr-4">Cloudflare, inside the security check on the contact, quote, and newsletter forms</td>
                    <td className="py-3 pr-4">Tells people and bots apart so the forms stay free of spam. It runs in a Cloudflare frame and sets no cookies on our domain.</td>
                    <td className="py-3">Handled by Cloudflare</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 pr-4 font-mono text-xs text-ink">__va_attribution</td>
                    <td className="py-3 pr-4">Vercel Analytics script (local storage)</td>
                    <td className="py-3 pr-4">The script checks for this value but only writes it when a site identifies its users. We do not, so nothing is stored.</td>
                    <td className="py-3">Not stored</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Because the public site sets no cookies, there is nothing to accept
              or decline. You can still block or clear cookies and site data in
              your browser settings at any time; the public pages keep working.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">
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
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">
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
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">Retention</h2>
            <p>
              Enquiries are kept while we handle your request and for a reasonable
              period afterwards for our records, then deleted or archived. Newsletter
              addresses are kept until you unsubscribe; every newsletter includes a
              one-click unsubscribe link.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">Your choices</h2>
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
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">Children</h2>
            <p>
              This site is intended for businesses and is not directed at children. We
              do not knowingly collect information from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-normal text-ink md:text-3xl">Changes</h2>
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
