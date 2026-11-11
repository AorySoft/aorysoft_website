import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HELPFUL_LINKS = [
  { href: "/services", label: "Services", note: "What we build: web, apps, AI, and automation" },
  { href: "/about", label: "About", note: "How a project runs with us" },
  { href: "/contact", label: "Contact", note: "Ask us directly" },
] as const;

/** Shared 404 body (root and marketing not-found): helps a visitor from search find their way. */
export default function NotFoundContent() {
  return (
    <main className="section-y">
      <div className="shell max-w-3xl">
        <p className="font-display text-7xl text-signal">404</p>
        <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">Page not found</h1>
        <p className="body-lead mt-4">
          The page you are looking for doesn&apos;t exist or may have moved.
        </p>
        <nav aria-label="Helpful links" className="mt-10">
          <ul className="divide-y divide-line border-y border-line">
            {HELPFUL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-center justify-between gap-6 py-4 transition-colors hover:text-signal"
                >
                  <span>
                    <span className="block font-display text-xl text-ink group-hover:text-signal">
                      {link.label}
                    </span>
                    <span className="mt-1 block text-sm text-ink-muted">{link.note}</span>
                  </span>
                  <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-ink-subtle group-hover:text-signal" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/" className="btn-primary mt-10 inline-flex">
          Back to home
        </Link>
      </div>
    </main>
  );
}
