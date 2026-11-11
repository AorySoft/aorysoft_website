"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Client-safe public chrome for root error.tsx (cannot import server-only shells).
 * Skip link + nav + footer; analytics omitted on error recovery UI.
 */
export default function MarketingChromeClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <div id="main-content" tabIndex={-1} className="pt-16 focus:outline-none">
        {children}
      </div>
      <Footer />
    </>
  );
}
