"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";

type NavItem = {
  name: string;
  path: string;
  sectionId?: string;
};

const navItems: NavItem[] = [
  { name: "Home", path: "/" },
  { name: "About", path: "/", sectionId: "about" },
  { name: "Services", path: "/", sectionId: "services" },
  { name: "Blog", path: "/blog" },
  { name: "Careers", path: "/careers" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Active state is carried by underline + aria-current, not colour alone (WCAG 1.4.1).
  const isActive = (item: NavItem) =>
    !item.sectionId &&
    (item.path === "/" ? pathname === "/" : pathname.startsWith(item.path));

  const linkClasses = (active: boolean) =>
    `text-sm underline-offset-[6px] transition-colors duration-200 ${
      active
        ? "text-ink underline decoration-signal decoration-1"
        : "text-ink-muted hover:text-ink"
    }`;

  return (
    <nav
      aria-label="Main"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? "border-b border-line bg-canvas/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="shell">
        <div className="flex h-16 items-center justify-between gap-4">
          <BrandMark size="sm" />

          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.sectionId ? `/#${item.sectionId}` : item.path}
                aria-current={isActive(item) ? "page" : undefined}
                className={`py-2 ${linkClasses(isActive(item))}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link href="/quote" className="btn-primary !px-5 !py-2.5">
              Get a Quote
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-atelier text-ink-muted transition hover:bg-surface hover:text-ink md:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div
          id="mobile-menu"
          className="border-t border-line bg-canvas/95 backdrop-blur-md md:hidden"
        >
          <div className="shell space-y-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.sectionId ? `/#${item.sectionId}` : item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive(item) ? "page" : undefined}
                className={`block rounded-atelier px-3 py-2.5 ${linkClasses(
                  isActive(item),
                )}`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/quote"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary mt-3 w-full"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
