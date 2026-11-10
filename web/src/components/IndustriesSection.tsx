const industries = [
  {
    title: "Healthcare & clinical",
    description:
      "Tools and platforms for clinics and care teams, with privacy and day-to-day workflow in mind.",
  },
  {
    title: "E-commerce & retail",
    description:
      "Storefronts, ops tooling, and customer-facing features that support how you sell and fulfill.",
  },
  {
    title: "Startups & product teams",
    description:
      "From early MVPs to growing SaaS: product UI, admin systems, and automation that keep release cycles moving.",
  },
  {
    title: "Education & services",
    description:
      "Digital products and integrations for schools, training orgs, and service businesses updating how they deliver.",
  },
];

/**
 * A large serif index. Every description is always readable (no hover-only
 * content); hover adds emphasis and a signal rule that sweeps along the row.
 */
const IndustriesSection = () => {
  return (
    <section id="industries" aria-labelledby="industries-title" className="section-y scroll-mt-16 border-t border-line bg-surface">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 id="industries-title" className="display-title">
            Who we build for
          </h2>
          <p className="body-lead mt-5">
            We work with startups and established teams in healthcare,
            commerce, education, and product companies that need a steady
            engineering partner.
          </p>
        </div>

        <ul className="mt-14 border-t border-line md:mt-16">
          {industries.map((industry) => (
            <li
              key={industry.title}
              className="group relative grid gap-3 border-b border-line py-8 md:grid-cols-12 md:items-baseline md:gap-8 md:py-10"
            >
              <span
                className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-gradient-to-r from-signal-deep to-signal transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 motion-reduce:transition-none"
                aria-hidden="true"
              />
              <h3 className="font-display text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.05] tracking-[-0.02em] text-ink-muted transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:text-ink motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 md:col-span-7">
                {industry.title}
              </h3>
              <p className="max-w-md text-base leading-relaxed text-ink-muted transition-colors duration-500 group-hover:text-ink md:col-span-5">
                {industry.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default IndustriesSection;
