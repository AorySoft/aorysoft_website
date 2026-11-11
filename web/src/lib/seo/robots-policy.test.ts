import { describe, expect, it } from "vitest";
import {
  ROBOTS_AI_AGENTS,
  ROBOTS_DISALLOW,
  buildRobotsRules,
  formatRobotsTxt,
} from "./robots-policy";

function parseRobotsGroups(text: string): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  let current: string | null = null;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.toLowerCase().startsWith("sitemap:")) {
      current = null;
      continue;
    }
    const ua = line.match(/^user-agent:\s*(.+)$/i);
    if (ua) {
      current = ua[1].trim();
      if (!groups.has(current)) groups.set(current, []);
      continue;
    }
    const disallow = line.match(/^disallow:\s*(.*)$/i);
    if (disallow && current) {
      groups.get(current)!.push(disallow[1].trim());
    }
  }
  return groups;
}

describe("robots policy", () => {
  it("gives every user-agent group the full Disallow list", () => {
    const txt = formatRobotsTxt();
    const groups = parseRobotsGroups(txt);

    const expectedAgents = ["*", ...ROBOTS_AI_AGENTS];
    for (const agent of expectedAgents) {
      expect(groups.has(agent), `missing group ${agent}`).toBe(true);
      const disallow = groups.get(agent) ?? [];
      for (const path of ROBOTS_DISALLOW) {
        expect(disallow, `${agent} missing ${path}`).toContain(path);
      }
    }
  });

  it("builds a dedicated disallow array per rule", () => {
    const rules = buildRobotsRules();
    expect(rules.length).toBe(1 + ROBOTS_AI_AGENTS.length);
    const first = rules[0].disallow;
    for (const rule of rules.slice(1)) {
      expect(rule.disallow).toEqual([...ROBOTS_DISALLOW]);
      expect(rule.disallow).not.toBe(first);
    }
  });
});
