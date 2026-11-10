import Link from "next/link";

const CareersPreview = () => {
  return (
    <section id="careers-preview" className="section-y scroll-mt-16">
      <div className="shell">
        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-2xl">
            <h2 className="display-title">Build with us</h2>
            <p className="body-lead mt-5">
              Looking for people who care about solid work and shipping things
              that help real teams. Open roles are listed on the careers page.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <Link href="/careers" className="btn-secondary">
              View careers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareersPreview;
