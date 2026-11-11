import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CapabilityIcon } from "@/components/capabilities/icons";

/**
 * A catalog row (services, case studies): icon node, title, subtitle, a short
 * description, up to three highlights, and one link. Rows instead of a card grid.
 */
export default function ServiceRow({
  title,
  subtitle,
  description,
  iconKey,
  highlights = [],
  href,
  linkLabel,
  headingLevel = 2,
}: {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  iconKey?: string | null;
  highlights?: readonly string[];
  href: string;
  linkLabel: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="grid gap-6 border-b border-line py-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-atelier border border-line bg-canvas">
            <CapabilityIcon iconKey={iconKey} className="h-4 w-4 text-signal" />
          </span>
          <Heading className="font-display text-3xl text-ink">{title}</Heading>
        </div>
        {subtitle ? <p className="mt-3 text-sm font-medium text-signal">{subtitle}</p> : null}
      </div>
      <div className="md:col-span-7">
        {description ? <p className="text-base leading-relaxed text-ink-muted">{description}</p> : null}
        {highlights.length > 0 ? (
          <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {highlights.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
                <span className="mt-2 h-1 w-1 shrink-0 bg-signal" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-signal"
        >
          {linkLabel}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
