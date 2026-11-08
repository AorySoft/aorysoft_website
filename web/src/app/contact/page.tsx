import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Ready to transform your business with AI? Get in touch with AorySoft to discuss your project.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <ContactContent />
    </main>
  );
}
