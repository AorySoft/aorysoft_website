import Link from "next/link";
import { ArrowRight } from "lucide-react";

type CtaLink = { href: string; label: string };

/** One-line closing band: the site's primary action plus one contextual link. */
export default function PageEndCta({
  title = "Have a project in mind?",
  text = "Tell us what you want to build and what constraints you already know.",
  primary = { href: "/quote", label: "Get a Quote" },
  secondary = { href: "/contact", label: "Contact us" },
}: {
  title?: string;
  text?: string;
  primary?: CtaLink;
  secondary?: CtaLink | null;
}) {
  return (
    <section aria-label="Next step" className="border-t border-line bg-surface">
      <div className="shell flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="max-w-2xl">
          <p className="font-display text-3xl text-ink md:text-4xl">{title}</p>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">{text}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link href={primary.href} className="btn-primary">
            {primary.label}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          {secondary ? (
            <Link href={secondary.href} className="btn-secondary">
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
