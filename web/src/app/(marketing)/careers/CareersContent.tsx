import { ArrowRight, Briefcase, Clock, MapPin, Users } from "lucide-react";
import type { JobRow } from "@/lib/types";
import EmptyState from "@/components/patterns/EmptyState";
import PageHero from "@/components/patterns/PageHero";
import SectionHeader from "@/components/patterns/SectionHeader";

// Only real openings from the CMS are listed. No placeholder roles or invented
// benefits are shown (PRODUCT.md: never fabricate company facts).
const CONTACT_EMAIL = "info@aorysoft.com";

function capitalize(value: string | null): string | null {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toPosition(job: JobRow) {
  return {
    id: job.id,
    title: job.title,
    description: job.description ?? "",
    meta: [
      { icon: Users, label: "Team", value: job.department },
      { icon: MapPin, label: "Location", value: job.location },
      { icon: Clock, label: "Type", value: capitalize(job.type) },
      { icon: Briefcase, label: "Experience", value: job.experience },
    ].filter((item) => Boolean(item.value)),
  };
}

const emailLink = (
  <a
    href={`mailto:${CONTACT_EMAIL}`}
    className="text-ink underline decoration-signal underline-offset-4 hover:text-signal"
  >
    {CONTACT_EMAIL}
  </a>
);

const CareersContent = ({ jobs }: { jobs?: JobRow[] | null }) => {
  const openPositions = jobs?.map(toPosition) ?? [];

  return (
    <div>
      <PageHero
        eyebrow="Careers"
        title="Build with us"
        lead="Looking for people who care about solid work and shipping systems that help real teams."
      />

      <section aria-labelledby="open-roles" className="section-y">
        <div className="shell">
          <SectionHeader split id="open-roles" eyebrow="Openings" title="Open roles" />

          {openPositions.length > 0 ? (
            <>
              <ul className="mt-[clamp(1.5rem,5svh,2.5rem)] divide-y divide-line border-y border-line">
                {openPositions.map((job) => (
                  <li key={job.id} className="grid gap-4 py-[clamp(1.25rem,4svh,2rem)] md:grid-cols-12 md:gap-8">
                    <div className="md:col-span-5">
                      <h3 className="font-display text-2xl text-ink">{job.title}</h3>
                      {job.description ? (
                        <p className="mt-3 max-w-measure text-base leading-relaxed text-ink-muted">{job.description}</p>
                      ) : null}
                    </div>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:col-span-7 md:grid-cols-4">
                      {job.meta.map(({ icon: Icon, label, value }) => (
                        <div key={label}>
                          <dt className="flex items-center gap-1.5 text-ink-muted">
                            <Icon size={14} aria-hidden="true" />
                            {label}
                          </dt>
                          <dd className="mt-1 text-ink">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
              <p className="mt-[clamp(1.5rem,4svh,2.5rem)] max-w-measure text-base leading-relaxed text-ink-muted">
                To apply, or if you don&apos;t see your role, send a short note and your CV to {emailLink}.
              </p>
            </>
          ) : (
            <div className="mt-[clamp(1.5rem,5svh,2.5rem)]">
              <EmptyState
                title="No open roles right now"
                action={
                  <a href={`mailto:${CONTACT_EMAIL}?subject=Careers`} className="btn-primary">
                    Email us
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                }
              >
                New openings are listed here as soon as they are confirmed. If you think you would be a
                good fit anyway, send a short note and your CV to {emailLink}.
              </EmptyState>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CareersContent;
