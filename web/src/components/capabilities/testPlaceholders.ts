import type { Capability } from "./serviceModel";

/**
 * Explicit test-only fixtures for the capabilities switchboard.
 * Never imported by production UI (FRONTEND_AUDIT F02).
 */
export const PLACEHOLDER_CAPABILITIES: Capability[] = [
  {
    id: "placeholder-ai-automation",
    iconKey: "bot",
    title: "AI Automation",
    subtitle: "Cut repetitive work with practical AI workflows",
    description:
      "Automate the busywork: document handling, workflows, and ops tools that save time without adding ceremony.",
    features: [
      "Robotic Process Automation (RPA)",
      "Intelligent Document Processing",
      "Workflow Optimization",
      "Predictive Analytics",
      "Natural Language Processing",
    ],
  },
  {
    id: "placeholder-custom-software",
    iconKey: "code",
    title: "Custom Software",
    subtitle: "Web, mobile, and SaaS products",
    description:
      "Websites, apps, and product platforms shaped around how your team actually works.",
    features: [
      "Website Design & Development",
      "Custom Web Applications",
      "Mobile Applications",
      "SaaS Product Development",
      "Admin Panels & Dashboards",
    ],
  },
  {
    id: "placeholder-ai-agents",
    iconKey: "brain",
    title: "AI Agents & Chat",
    subtitle: "Assistants that work in context",
    description:
      "Chatbots, voice agents, and custom agents connected to your data and tools, with humans in the loop where it matters.",
    features: [
      "AI Chatbot Development",
      "AI Voice Agents",
      "AI Agent Development",
      "OpenAI and model integrations",
      "Human-in-the-loop workflows",
    ],
  },
  {
    id: "placeholder-integrations-cloud",
    iconKey: "cloud",
    title: "Integrations & Cloud",
    subtitle: "Connect systems and keep them running",
    description:
      "APIs, third-party integrations, cloud deploy, and maintenance so the stack stays reliable.",
    features: [
      "API Development & Integrations",
      "Business Process Automation",
      "Backend & Database Development",
      "Cloud Deployment & Maintenance",
      "n8n and workflow tooling",
    ],
  },
];
