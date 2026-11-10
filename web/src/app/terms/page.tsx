import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that apply when you use the AorySoft website, including content ownership, acceptable use and limitations.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "November 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="display-title mb-3">
          Terms of Use
        </h1>
        <p className="text-sm text-ink-subtle mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-10 text-ink-muted leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Acceptance</h2>
            <p>
              By using this website you agree to these terms. If you do not agree,
              please do not use the site. If you engage AorySoft for services, the
              terms of the applicable agreement or proposal govern that engagement and
              take precedence over these website terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              Informational content
            </h2>
            <p>
              Articles, service descriptions and other content on this site are
              provided for general information. They are not professional, legal,
              financial or technical advice for your specific situation, and you should
              not rely on them as such.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              Intellectual property
            </h2>
            <p>
              The site design, text, graphics, logos and code are owned by AorySoft or
              its licensors and are protected by applicable intellectual property laws.
              You may view and share links to the site, but you may not copy, republish
              or redistribute its content for commercial purposes without our written
              permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Acceptable use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Do not attempt to gain unauthorised access to any part of the site, its
                administration area or its data.
              </li>
              <li>
                Do not use the contact forms, quote requests or newsletter signup to
                send spam, unlawful content or another person&apos;s information without
                their permission.
              </li>
              <li>
                Do not interfere with the site&apos;s operation, probe it for
                vulnerabilities without authorisation, or place unreasonable load on it.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              Information you submit
            </h2>
            <p>
              You confirm that the information you send us is accurate and that you have
              the right to share it. Please do not send confidential material or trade
              secrets through the public forms; contact us first to arrange a suitable
              channel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              Third-party links
            </h2>
            <p>
              This site may link to third-party websites. We do not control those sites
              and are not responsible for their content, availability or privacy
              practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              Availability and warranties
            </h2>
            <p>
              The site is provided &quot;as is&quot; and &quot;as available&quot;. To the
              extent permitted by law, we make no warranties about the site&apos;s
              accuracy, availability or fitness for a particular purpose, and we may
              change or withdraw any part of it at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">
              Limitation of liability
            </h2>
            <p>
              To the extent permitted by law, AorySoft is not liable for indirect,
              incidental or consequential losses arising from your use of this website.
              Nothing in these terms excludes liability that cannot lawfully be
              excluded.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Governing law</h2>
            <p>
              These terms are governed by the laws applicable at AorySoft&apos;s
              principal place of business, without regard to conflict-of-law rules. Any
              dispute relating to this website will be handled by the courts competent
              in that jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the site
              after a change means you accept the updated terms. The date at the top of
              this page shows the latest revision.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-ink">Contact</h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a
                href="mailto:info@aorysoft.com"
                className="text-signal underline"
              >
                info@aorysoft.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
