import styles from "@/components/sections/stack.module.css";

/** Only tools from PRODUCT.md's technology list that are used in delivery. */
const layers = [
  { name: "Interface", tools: ["React & Next.js", "Flutter / React Native"] },
  { name: "Logic", tools: ["TypeScript", "Python", "Node.js"] },
  { name: "Data", tools: ["PostgreSQL"] },
  { name: "AI & automation", tools: ["OpenAI & AI APIs", "n8n & automation"] },
  { name: "Platform", tools: ["Cloud deploy & ops"] },
];

/**
 * The stack drawn as the layers of a system, top (what people touch) to bottom
 * (where it runs), with a signal travelling down through every layer.
 */
const TechnologiesSection = () => {
  return (
    <section id="technologies" aria-labelledby="technologies-title" className="section-y scroll-mt-16">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 id="technologies-title" className="display-title">
            Technology we work with
          </h2>
          <p className="body-lead mt-5">
            Tools we actually use on client work. The stack can shift per
            project; this is the core set we reach for most often.
          </p>
        </div>

        <dl className={`${styles.stack} relative mt-12 border-t border-line md:mt-16`}>
          <span className={styles.signal} aria-hidden="true" />
          {layers.map((layer) => (
            <div
              key={layer.name}
              className="relative grid gap-3 border-b border-line py-6 pl-8 md:grid-cols-12 md:items-center md:gap-8 md:pl-10"
            >
              <span
                className="absolute left-[3px] top-[1.9rem] h-[9px] w-[9px] border border-line-strong bg-canvas md:left-[11px] md:top-1/2 md:-translate-y-1/2"
                aria-hidden="true"
              />
              <dt className="text-sm font-medium text-ink-subtle md:col-span-3">{layer.name}</dt>
              <dd className="flex flex-wrap gap-x-8 gap-y-2 md:col-span-9">
                {layer.tools.map((tool) => (
                  <span key={tool} className="font-display text-2xl text-ink md:text-3xl">
                    {tool}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default TechnologiesSection;
