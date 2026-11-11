import type { Metadata } from "next";
import PageHero from "@/components/patterns/PageHero";
import QuoteForm from "./QuoteForm";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Share scope, timeline, and constraints. AorySoft will follow up with a clear proposal.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <main>
      <PageHero
        eyebrow="Get a Quote"
        title="Get a quote"
        lead="Walk through a few short steps about scope, timeline, and constraints. We use that to put together a clear proposal."
        compact
      />
      <QuoteForm />
    </main>
  );
}
