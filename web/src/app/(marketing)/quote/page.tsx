import type { Metadata } from "next";
import QuoteForm from "./QuoteForm";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Share scope, timeline, and constraints. AorySoft will follow up with a clear proposal.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <main className="min-h-screen">
      <QuoteForm />
    </main>
  );
}
