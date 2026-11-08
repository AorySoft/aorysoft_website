import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";
import "./globals.css";

// Absolute-URL base for metadata (OpenGraph/Twitter/canonical). Falls back to
// the local dev origin so metadata is well-formed before NEXT_PUBLIC_SITE_URL
// is set for production (it is a launch-gate value, configured at deploy).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AorySoft — AI-first solutions, real-world impact",
    template: "%s — AorySoft",
  },
  description:
    "AorySoft builds AI automation, intelligent integrations, data analytics and cloud solutions for businesses.",
  applicationName: "AorySoft",
  keywords: ["AI", "automation", "integrations", "data analytics", "cloud", "AorySoft"],
  openGraph: {
    type: "website",
    siteName: "AorySoft",
    title: "AorySoft — AI-first solutions, real-world impact",
    description:
      "AorySoft builds AI automation, intelligent integrations, data analytics and cloud solutions for businesses.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "AorySoft — AI-first solutions, real-world impact",
    description:
      "AorySoft builds AI automation, intelligent integrations, data analytics and cloud solutions for businesses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-900 text-white overflow-x-hidden antialiased">
        <Navbar />
        <div className="pt-16">{children}</div>
        <Footer />
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
