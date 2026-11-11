import type { Metadata } from "next";
import MarketingShell from "@/components/MarketingShell";
import NotFoundContent from "@/components/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** Global unmatched-URL fallback — root layout has no chrome, so wrap here. */
export default function NotFound() {
  return (
    <MarketingShell>
      <NotFoundContent />
    </MarketingShell>
  );
}
