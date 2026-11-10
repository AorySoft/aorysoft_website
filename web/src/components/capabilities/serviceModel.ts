import type { ServiceRow } from "@/lib/types";

export type VignetteKind =
  | "chat"
  | "agent"
  | "workflow"
  | "insight"
  | "deploy"
  | "build"
  | "schema";

export type Capability = {
  /** Unique per list; titles from the CMS are not guaranteed unique. */
  id: string;
  iconKey: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
};

/** Admin icon choice → the illustrative vignette shown in the switchboard. */
const VIGNETTES: Record<string, VignetteKind> = {
  bot: "chat",
  brain: "agent",
  zap: "workflow",
  "bar-chart": "insight",
  cloud: "deploy",
  shield: "deploy",
  code: "build",
  database: "schema",
};

export function vignetteFor(iconKey: string): VignetteKind {
  return VIGNETTES[iconKey] ?? "build";
}

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

export function toCapability(row: ServiceRow): Capability {
  return {
    id: row.id,
    iconKey: row.icon ?? "bot",
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    features: Array.isArray(row.features) ? row.features.map(String) : [],
  };
}

export function toCapabilities(rows?: ServiceRow[] | null): Capability[] {
  return rows && rows.length > 0 ? rows.map(toCapability) : PLACEHOLDER_CAPABILITIES;
}

/** First capability whose icon matches the requested keys, in key priority order. */
export function findCapabilityIndex(list: Capability[], keys: readonly string[]): number {
  for (const key of keys) {
    const index = list.findIndex((item) => item.iconKey === key);
    if (index !== -1) return index;
  }
  return -1;
}

export const CAPABILITY_EVENT = "aory:capability";

/** Lets other sections (the hero nodes) open a capability in the switchboard. */
export function requestCapability(keys: readonly string[]) {
  window.dispatchEvent(new CustomEvent(CAPABILITY_EVENT, { detail: { keys } }));
}
