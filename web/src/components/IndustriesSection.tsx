import SectionHeader from "@/components/patterns/SectionHeader";

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
        <SectionHeader split
          id="industries-title"
          eyebrow="Industries"
          title="Who we build for"
          lead="We work with startups and established teams in healthcare, commerce, education, and product companies that need a steady engineering partner."
        />

        <ul className="mt-[clamp(1.5rem,5svh,4rem)] border-t border-line">
          {industries.map((industry) => (
            <li
              key={industry.title}
              className="group relative grid gap-3 border-b border-line py-[clamp(1rem,3svh,2.5rem)] md:grid-cols-12 md:items-baseline md:gap-8"
            >
              <span
                className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-gradient-to-r from-signal-deep to-signal transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 motion-reduce:transition-none"
                aria-hidden="true"
              />
              <h3 className="font-display text-[clamp(1.75rem,min(4.6vw,6.5svh),3.75rem)] leading-[1.05] tracking-[-0.02em] text-ink transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 md:col-span-7">
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
