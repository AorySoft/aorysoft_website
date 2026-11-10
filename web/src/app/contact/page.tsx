import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact AorySoft about a project, quote, or question. We reply through info@aorysoft.com.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <ContactContent />
    </main>
  );
}
