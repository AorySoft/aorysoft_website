import type { Metadata } from "next";
import NotFoundContent from "@/components/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** Marketing-scoped 404 — inherits Navbar/Footer via (marketing)/layout. */
export default function MarketingNotFound() {
  return <NotFoundContent />;
}
