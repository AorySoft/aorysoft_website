import type { Metadata } from "next";
import QuoteForm from "./QuoteForm";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Tell us about your project and AorySoft will provide a detailed proposal through our multi-step quote form.",
};

export default function QuotePage() {
  return (
    <main className="min-h-screen">
      <QuoteForm />
    </main>
  );
}
