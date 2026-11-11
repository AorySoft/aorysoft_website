import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageEndCta from "@/components/patterns/PageEndCta";
import PageHero from "@/components/patterns/PageHero";
import { getPublishedCaseStudies } from "@/lib/data";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cases = await getPublishedCaseStudies();
  const enabled = (cases?.length ?? 0) >= 1;
  return {
    title: "Case studies",
    description:
      "Selected AorySoft work — real projects cleared for public display.",
    alternates: { canonical: "/work" },
    robots: enabled
      ? undefined
      : { index: false, follow: false },
  };
}

export default async function WorkPage() {
  const cases = (await getPublishedCaseStudies()) ?? [];
  if (cases.length < 1) notFound();

  return (
    <main>
      <PageHero
        eyebrow="Case studies"
        title="Case studies"
        lead="Projects cleared for public display. We do not publish fictional client work."
      />

      <section aria-label="Case studies" className="section-y">
        <div className="shell">
          <ol className="border-t border-line">
            {cases.map((item, index) => (
              <li key={item.id} className="grid gap-4 border-b border-line py-[clamp(1.75rem,5svh,3rem)] md:grid-cols-12 md:gap-8">
                <div className="md:col-span-4">
                  <span className="block text-xs font-medium tabular-nums text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-2 font-display text-[clamp(1.625rem,min(2.6vw,4.6svh),2.25rem)] leading-tight text-ink">
                    {item.title}
                  </h2>
                  {item.summary ? <p className="mt-3 text-sm font-medium text-signal">{item.summary}</p> : null}
                </div>
                <div className="max-w-measure whitespace-pre-wrap text-base leading-relaxed text-ink-muted md:col-span-8">
                  {item.body}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PageEndCta title="Start a project" secondary={{ href: "/services", label: "Explore services" }} />
    </main>
  );
}
