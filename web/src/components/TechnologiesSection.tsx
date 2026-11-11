import SectionHeader from "@/components/patterns/SectionHeader";
import StackRows from "@/components/patterns/StackRows";

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
    <section id="technologies" aria-labelledby="technologies-title" className="section-y scroll-mt-16 border-t border-line">
      <div className="shell">
        <SectionHeader
          id="technologies-title"
          eyebrow="Stack"
          title="Technology we work with"
          lead="Tools we actually use on client work. The stack can shift per project; this is the core set we reach for most often."
        />

        <StackRows layers={layers} className="mt-12 md:mt-16" />
      </div>
    </section>
  );
};

export default TechnologiesSection;
