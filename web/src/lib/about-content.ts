// Single source for the About copy, shared by /about (HTML), /about.md
// (markdown twin), and the ProcessLine section. Edit here, not in the pages.

export const ABOUT_HEADING = "How we build";

export const ABOUT_LEAD =
  "We help teams ship digital products, AI features, and automation that hold up in day-to-day use. Software first, AI where it earns its place, and a process you can follow without guesswork.";

export const ABOUT_HONESTY =
  "We care about honest delivery: clear communication, realistic timelines, and work we are willing to stand behind.";

export const ABOUT_PILLARS = [
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
] as const;

export const PROCESS_STEPS = [
  { title: "Discover", text: "Goals, users, and constraints first." },
  { title: "Design", text: "Flows and interfaces shaped before code." },
  { title: "Build", text: "Software and AI systems in small, reviewable steps." },
  { title: "Integrate", text: "Connected to the tools and data you already use." },
  { title: "Operate", text: "Deployed, maintained, and improved." },
] as const;
