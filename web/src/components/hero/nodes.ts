/**
 * The four signal nodes under the hero mark. Shared by the client sculpture
 * (drawing) and the server hero (resolving each node to a published service).
 * `keys` are CMS service icon keys, in priority order.
 */
export const HERO_NODES = [
  { label: "Web", x: 70, path: "M150 399V460L70 540", keys: ["code"] },
  { label: "Apps", x: 235, path: "M185 399V490L235 540", keys: ["code", "database"] },
  { label: "AI agents", x: 365, path: "M415 399V490L365 540", keys: ["brain", "bot"] },
  { label: "Automation", x: 530, path: "M450 399V460L530 540", keys: ["zap", "bot"] },
] as const;
