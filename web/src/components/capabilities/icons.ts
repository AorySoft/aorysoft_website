import { createElement } from "react";
import {
  BarChart3,
  Bot,
  Brain,
  Cloud,
  Code,
  Database,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** CMS `services.icon` keys → icons. Unknown keys fall back to Bot. */
export const CAPABILITY_ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  zap: Zap,
  "bar-chart": BarChart3,
  cloud: Cloud,
  brain: Brain,
  code: Code,
  database: Database,
  shield: Shield,
};

/** Decorative icon for a CMS icon key (a stable component, not one created per render). */
export function CapabilityIcon({ iconKey, className }: { iconKey?: string | null; className?: string }) {
  const icon = (iconKey && CAPABILITY_ICONS[iconKey]) || Bot;
  return createElement(icon, { className, "aria-hidden": true });
}
