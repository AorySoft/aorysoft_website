"use client";

// Public-site analytics only. Admin panel traffic must not inflate visitor counts.
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";

/** Drop events whose URL is under /admin (client navigations into the panel). */
export function dropAdminEvent<T extends { url: string }>(event: T): T | null {
  try {
    if (new URL(event.url).pathname.startsWith("/admin")) return null;
  } catch {
    if (event.url.includes("/admin")) return null;
  }
  return event;
}

export default function SiteAnalytics() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <CloudflareAnalytics />
      <Analytics beforeSend={dropAdminEvent} />
      <SpeedInsights beforeSend={dropAdminEvent} />
    </>
  );
}
