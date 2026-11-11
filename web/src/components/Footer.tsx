// Server component on marketing pages (no client JS, no hydration of the
// year). The client error boundary (MarketingChromeClient) also renders it;
// there it runs on the client only, so the year cannot mismatch (R4).
import Link from "next/link";
import { Mail } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { SOCIAL_LINKS } from "@/lib/social";
import { SITE_DESCRIPTION } from "@/lib/site";

export default function Footer({
  showBlog = false,
  showWork = false,
  year = new Date().getFullYear(),
  services = [],
}: {
  showBlog?: boolean;
  showWork?: boolean;
  /** Published service detail pages (title + href); the column is hidden when empty. */
  services?: { title: string; href: string }[];
  /** Copyright year; defaults to the current year at render time. */
  year?: number;
}) {
  const explore = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    ...(showWork ? [{ name: "Case studies", path: "/work" }] : []),
    ...(showBlog ? [{ name: "Blog", path: "/blog" }] : []),
  ];

  const company = [
    { name: "Careers", path: "/careers" },
    { name: "Contact", path: "/contact" },
    { name: "Get a Quote", path: "/quote" },
  ];

  return (
    <footer className="border-t border-line bg-surface pb-[env(safe-area-inset-bottom,0px)]">
      <div className="shell py-[clamp(2.5rem,7svh,3.5rem)]">
        <div className={`grid grid-cols-1 gap-10 md:grid-cols-2 ${services.length > 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          <div className="space-y-4">
            <BrandMark size="sm" />
            {/* Same brand line as metadata, JSON-LD, and llms.txt. */}
            <p className="max-w-sm text-sm leading-6 text-ink-muted">
              {SITE_DESCRIPTION}
            </p>
            <ul className="flex flex-wrap gap-4 pt-1">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink-muted underline decoration-transparent underline-offset-4 transition hover:text-signal hover:decoration-signal"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-ink">Explore</h2>
            <div className="space-y-2">
              {explore.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="block text-sm text-ink-muted transition hover:text-signal"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {services.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-ink">Services</h2>
              <div className="space-y-2">
                {services.map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="block text-sm text-ink-muted transition hover:text-signal"
                  >
                    {service.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-ink">Company</h2>
            <div className="space-y-2">
              {company.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="block text-sm text-ink-muted transition hover:text-signal"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <a
              href="mailto:info@aorysoft.com"
              className="inline-flex items-center gap-2 pt-2 text-sm text-ink-muted transition hover:text-signal"
            >
              <Mail size={16} aria-hidden="true" />
              info@aorysoft.com
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} AorySoft. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-signal">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-signal">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
