import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/patterns/PageHero";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact AorySoft about a project, quote, or question. We reply through info@aorysoft.com.",
  alternates: { canonical: "/contact" },
};

/** RSC shell: static copy in HTML for crawlers; form is a client island. */
export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="Contact"
        compact
        lead={
          <>
            Tell us about your project or question. We respond through{" "}
            <a
              href="mailto:info@aorysoft.com"
              className="text-signal underline decoration-signal/60 underline-offset-4 hover:decoration-signal"
            >
              info@aorysoft.com
            </a>
            .
          </>
        }
      />

      <section aria-label="Contact form" className="section-y">
        <div className="shell grid grid-cols-1 gap-[clamp(2rem,5svh,3rem)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
          <ContactForm />

          <aside className="space-y-6">
            <div className="surface-panel p-6 md:p-8">
              <h2 className="font-display text-2xl text-ink">Email</h2>
              <p className="mt-2 text-ink-muted">
                Prefer to write directly? Reach us at{" "}
                <a
                  href="mailto:info@aorysoft.com"
                  className="text-signal underline decoration-signal/60 underline-offset-4 hover:decoration-signal"
                >
                  info@aorysoft.com
                </a>
                . Phone and address will be published once verified.
              </p>
            </div>

            <div className="surface-panel p-6 md:p-8">
              <h2 className="font-display text-2xl text-ink">Need a proposal?</h2>
              <p className="mt-2 text-ink-muted">
                Use the quote form for project type, timeline, and requirements.
              </p>
              <Link href="/quote" className="btn-primary mt-6">
                Get a Quote
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
