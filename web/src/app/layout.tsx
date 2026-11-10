import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AorySoft | AI-first solutions, real-world impact",
    template: "%s | AorySoft",
  },
  description:
    "AorySoft builds software, AI systems, and automation for businesses: websites, apps, integrations, and practical AI.",
  applicationName: "AorySoft",
  keywords: ["AI", "automation", "integrations", "data analytics", "cloud", "AorySoft"],
  openGraph: {
    type: "website",
    siteName: "AorySoft",
    title: "AorySoft | AI-first solutions, real-world impact",
    description:
      "AorySoft builds software, AI systems, and automation for businesses: websites, apps, integrations, and practical AI.",
    url: siteUrl,
    images: [{ url: "/brand/aorysoft-logo.jpg", alt: "AorySoft" }],
  },
  twitter: {
    card: "summary",
    title: "AorySoft | AI-first solutions, real-world impact",
    description:
      "AorySoft builds software, AI systems, and automation for businesses: websites, apps, integrations, and practical AI.",
    images: ["/brand/aorysoft-logo.jpg"],
  },
  icons: {
    icon: [{ url: "/brand/aorysoft-mark.svg", type: "image/svg+xml" }],
    apple: "/brand/aorysoft-logo.jpg",
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased overflow-x-hidden">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <div id="main-content" tabIndex={-1} className="pt-16 focus:outline-none">
          {children}
        </div>
        <Footer />
        <CloudflareAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
