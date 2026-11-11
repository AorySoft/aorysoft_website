import type { ServiceFaq, ServiceProcessStep, ServiceRow } from "@/lib/types";

/** Detail page is public only with slug, active, overview, and ≥4 deliverables. */
export function isServiceDetailPublished(
  row: Pick<
    ServiceRow,
    "active" | "slug" | "description" | "deliverables"
  >,
): boolean {
  const deliverables = Array.isArray(row.deliverables) ? row.deliverables : [];
  return Boolean(
    row.active &&
      typeof row.slug === "string" &&
      row.slug.trim().length > 0 &&
      typeof row.description === "string" &&
      row.description.trim().length > 0 &&
      deliverables.map(String).filter((item) => item.trim()).length >= 4,
  );
}

export function normalizeDeliverables(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((item) => item.trim()).filter(Boolean);
}

export function normalizeProcessSteps(value: unknown): ServiceProcessStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = typeof row.title === "string" ? row.title.trim() : "";
      const text = typeof row.text === "string" ? row.text.trim() : "";
      if (!title || !text) return null;
      return { title, text };
    })
    .filter((item): item is ServiceProcessStep => Boolean(item));
}

export function normalizeFaqs(value: unknown): ServiceFaq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const question =
        typeof row.question === "string" ? row.question.trim() : "";
      const answer = typeof row.answer === "string" ? row.answer.trim() : "";
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is ServiceFaq => Boolean(item));
}

/** Admin stringList display: "Title | text" lines. */
export function processStepsToLines(steps: ServiceProcessStep[]): string[] {
  return steps.map((step) => `${step.title} | ${step.text}`);
}

export function faqsToLines(faqs: ServiceFaq[]): string[] {
  return faqs.map((faq) => `${faq.question} | ${faq.answer}`);
}

/** Parse admin lines "Title | text" into process steps. */
export function parseProcessStepLines(lines: string[]): ServiceProcessStep[] {
  const steps: ServiceProcessStep[] = [];
  for (const line of lines) {
    const idx = line.indexOf("|");
    if (idx === -1) continue;
    const title = line.slice(0, idx).trim();
    const text = line.slice(idx + 1).trim();
    if (title && text) steps.push({ title, text });
  }
  return steps;
}

export function parseFaqLines(lines: string[]): ServiceFaq[] {
  const faqs: ServiceFaq[] = [];
  for (const line of lines) {
    const idx = line.indexOf("|");
    if (idx === -1) continue;
    const question = line.slice(0, idx).trim();
    const answer = line.slice(idx + 1).trim();
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}
