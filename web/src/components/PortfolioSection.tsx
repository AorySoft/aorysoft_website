import Link from "next/link";

/**
 * Selected work stays honest: unverified Featured Projects are not shown as
 * real client case studies (PRODUCT.md). Replace this empty state when real
 * projects are confirmed.
 */
const PortfolioSection = () => {
  return (
    <section
      id="work"
      className="section-y scroll-mt-16 border-t border-line bg-surface"
    >
      <div className="shell">
        <div className="max-w-3xl">
          <h2 className="display-title">Selected work</h2>
          <p className="body-lead mt-5">
            Case studies go up once project details are cleared for public
            display. We do not publish fictional client work.
          </p>
        </div>

        <div className="surface-panel mt-12 max-w-3xl p-8 md:p-10">
          <p className="text-base leading-relaxed text-ink-muted">
            Have a product, platform, or automation idea? Tell us about it. We
            can share relevant experience privately in the conversation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/quote" className="btn-primary">
              Request a quote
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
