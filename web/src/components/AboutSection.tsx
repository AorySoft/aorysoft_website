import ProcessLine from "@/components/sections/ProcessLine";

const pillars = [
  {
    title: "Engineering",
    description:
      "Websites, apps, and platforms that are clear to use and easier to maintain over time.",
  },
  {
    title: "AI",
    description:
      "Chatbots, voice agents, and custom AI wired into the work your team already does. Not demos for demos' sake.",
  },
  {
    title: "Automation",
    description:
      "Workflows and integrations that cut repetitive work so people can spend time on the decisions that matter.",
  },
];

/**
 * "How we build": positioning copy, the three disciplines, and the process line.
 * Rendered on the server; only the process line hydrates. No entrance animation
 * on the copy, so server and client HTML always match (fixes the reduced-motion
 * hydration mismatch).
 */
const AboutSection = () => {
  return (
    <section id="about" aria-labelledby="about-title" className="section-y scroll-mt-16 border-t border-line bg-surface">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
          <div>
            <h2 id="about-title" className="display-title">
              How we build
            </h2>
            <p className="body-lead mt-5">
              We help teams ship digital products, AI features, and automation
              that hold up in day-to-day use. Software first, AI where it
              earns its place, and a process you can follow without guesswork.
            </p>
            <p className="mt-4 max-w-measure text-base leading-relaxed text-ink-subtle">
              We care about honest delivery: clear communication, realistic
              timelines, and work we are willing to stand behind.
            </p>
          </div>

          <ul className="space-y-8">
            {pillars.map((pillar) => (
              <li key={pillar.title} className="border-t border-line pt-6">
                <h3 className="font-display text-2xl text-ink">{pillar.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <ProcessLine />
      </div>
    </section>
  );
};

export default AboutSection;
