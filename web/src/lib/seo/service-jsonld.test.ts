import { describe, expect, it } from "vitest";
import type { ServiceRow } from "@/lib/types";
import { jsonLdScript, serviceJsonLd } from "./service-jsonld";

const service = {
  id: "1",
  title: "AI Chatbots",
  subtitle: "Answers on your site",
  description: "Overview",
  features: [],
  icon: "bot",
  color: null,
  sort_order: 0,
  active: true,
  slug: "ai-chatbots",
  seo_title: null,
  seo_description: null,
  deliverables: ["a", "b", "c", "d"],
  process_steps: [],
  technologies: [],
  faqs: [] as ServiceRow["faqs"],
  created_at: "",
  updated_at: "2026-11-11T00:00:00Z",
} satisfies ServiceRow;

describe("serviceJsonLd", () => {
  it("describes the service with breadcrumbs and canonical URL", () => {
    const data = serviceJsonLd(service, "https://www.aorysoft.com");
    const [svc, crumbs] = data["@graph"] as Array<Record<string, unknown>>;
    expect(svc).toMatchObject({ "@type": "Service", name: "AI Chatbots", url: "https://www.aorysoft.com/services/ai-chatbots" });
    expect(svc.description).toBe("Answers on your site");
    expect((crumbs.itemListElement as unknown[]).length).toBe(3);
    expect(data["@graph"]).toHaveLength(2);
  });

  it("adds an FAQPage only when FAQs exist", () => {
    const data = serviceJsonLd({ ...service, faqs: [{ question: "Q?", answer: "A." }] }, "https://x.test");
    expect(data["@graph"]).toHaveLength(3);
    expect(data["@graph"][2]).toMatchObject({ "@type": "FAQPage" });
  });

  it("escapes < so the script cannot be closed early", () => {
    expect(jsonLdScript({ a: "</script>" })).not.toContain("</script>");
  });
});
