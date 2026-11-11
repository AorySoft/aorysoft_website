import { ArrowRight, Briefcase, Clock, MapPin, Users } from "lucide-react";
import type { JobRow } from "@/lib/types";

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

const CareersContent = ({ jobs }: { jobs?: JobRow[] | null }) => {
  const openPositions = jobs?.map(toPosition) ?? [];

  return (
    <div>
      <section className="section-y border-b border-line">
        <div className="shell">
          <h1 className="display-title max-w-3xl">Build with us</h1>
          <p className="body-lead mt-5">
            Looking for people who care about solid work and shipping systems
            that help real teams.
          </p>
        </div>
      </section>

      <section aria-labelledby="open-roles" className="section-y">
        <div className="shell">
          <h2 id="open-roles" className="font-display text-3xl text-ink md:text-4xl">
            Open roles
          </h2>

          {openPositions.length > 0 ? (
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {openPositions.map((job) => (
                <li key={job.id} className="grid gap-4 py-8 md:grid-cols-12 md:gap-8">
                  <div className="md:col-span-5">
                    <h3 className="font-display text-2xl text-ink">{job.title}</h3>
                    {job.description ? (
                      <p className="mt-3 max-w-measure text-base leading-relaxed text-ink-muted">
                        {job.description}
                      </p>
                    ) : null}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:col-span-7 md:grid-cols-4">
                    {job.meta.map(({ icon: Icon, label, value }) => (
                      <div key={label}>
                        <dt className="flex items-center gap-1.5 text-ink-subtle">
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
          ) : (
            <p className="mt-6 max-w-measure text-base leading-relaxed text-ink-muted">
              There are no open roles right now. New openings are listed here
              as soon as they are confirmed.
            </p>
          )}
        </div>
      </section>

      <section className="section-y border-t border-line bg-surface">
        <div className="shell">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Don&apos;t see your role?</h2>
          <p className="body-lead mt-5">
            No perfect match on the list? Send a short note and your CV to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-ink underline decoration-signal underline-offset-4 hover:text-signal"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Careers`} className="btn-primary mt-8">
            Email us
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default CareersContent;
