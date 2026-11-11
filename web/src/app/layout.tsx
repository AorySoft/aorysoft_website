import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import SiteJsonLd from "@/components/SiteJsonLd";
import {
  SITE_DESCRIPTION,
  SITE_LOGO_PATH,
  SITE_MARK_PATH,
  SITE_NAME,
  absoluteUrl,
} from "@/lib/site";
import "./globals.css";

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
  display: "optional",
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${SITE_NAME} | AI-first solutions, real-world impact`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI",
    "automation",
    "integrations",
    "web development",
    "AI chatbots",
    "AorySoft",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | AI-first solutions, real-world impact`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | AI-first solutions, real-world impact`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [{ url: SITE_MARK_PATH, type: "image/svg+xml" }],
    apple: SITE_LOGO_PATH,
  },
  manifest: "/manifest.webmanifest",
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
    <html
      lang="en"
      className={`${sans.variable} ${display.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen overflow-x-hidden bg-canvas font-sans text-ink antialiased">
        <SiteJsonLd />
        {children}
      </body>
    </html>
  );
}
