import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
    <main className="min-h-screen">
      <section className="section-y border-b border-line bg-surface">
        <div className="shell max-w-3xl">
          <h1 className="display-title">Case studies</h1>
          <p className="body-lead mt-5">
            Projects cleared for public display. We do not publish fictional
            client work.
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="shell max-w-3xl">
          <ul className="space-y-10">
            {cases.map((item) => (
              <li key={item.id} className="border-t border-line pt-8">
                <h2 className="font-display text-2xl text-ink md:text-3xl">
                  {item.title}
                </h2>
                {item.summary ? (
                  <p className="mt-3 text-base leading-relaxed text-ink-muted">
                    {item.summary}
                  </p>
                ) : null}
                <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-ink-muted">
                  {item.body}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-14 border-t border-line pt-8">
            <Link href="/quote" className="btn-primary inline-flex">
              Start a project
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
