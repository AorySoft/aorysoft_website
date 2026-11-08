"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";

type NavItem = {
  name: string;
  path: string;
  /** Home-page section to scroll to (rendered as /#section hash links). */
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu whenever the route changes. Adjusting state during
  // render (React's documented pattern for state derived from a prop change)
  // instead of an effect, per react-hooks/set-state-in-effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const linkClasses = (active: boolean) =>
    `transition-colors duration-200 relative group ${
      active ? "text-cyan-400" : "text-gray-300 hover:text-cyan-400"
    }`;

  const underline = (
    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
  );

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-900/95 backdrop-blur-md shadow-2xl shadow-blue-500/20"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Zap className="w-6 h-6 text-white" aria-hidden="true" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              AorySoft
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <motion.div key={item.name} whileHover={{ scale: 1.05 }}>
                  <Link
                    href={
                      item.sectionId ? `/#${item.sectionId}` : item.path
                    }
                    className={linkClasses(pathname === item.path && !item.sectionId)}
                  >
                    {item.name}
                    {underline}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Get Quote Button */}
          <div className="hidden md:block">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/quote"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
              >
                Get Quote
              </Link>
            </motion.div>
          </div>

          {/* Mobile hamburger (P0 fix: the original never rendered a toggle) */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/60 transition-colors duration-200"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          id="mobile-menu"
          className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={
                  item.sectionId ? `/#${item.sectionId}` : item.path
                }
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block transition-colors duration-200 ${
                  pathname === item.path && !item.sectionId
                    ? "text-cyan-400"
                    : "text-gray-300 hover:text-cyan-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/quote"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full text-center"
            >
              Get Quote
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
