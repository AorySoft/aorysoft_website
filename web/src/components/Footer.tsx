"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { SOCIAL_LINKS } from "@/lib/social";

export default function Footer({
  showBlog = false,
  showWork = false,
}: {
  showBlog?: boolean;
  showWork?: boolean;
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
    <footer className="border-t border-line bg-surface">
      <div className="shell py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <BrandMark size="sm" />
            <p className="max-w-sm text-sm leading-6 text-ink-muted">
              Software, AI, and automation for teams that need systems that
              ship and stay maintainable.
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
          <p>© {new Date().getFullYear()} AorySoft. All rights reserved.</p>
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
