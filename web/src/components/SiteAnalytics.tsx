"use client";

// Public-site analytics only. Admin panel traffic must not inflate visitor counts.
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";

export default function SiteAnalytics() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <CloudflareAnalytics />
      <Analytics
        beforeSend={(event) => {
          // Belt-and-suspenders for client navigations into /admin.
          try {
            const path = new URL(event.url).pathname;
            if (path.startsWith("/admin")) return null;
          } catch {
            if (event.url.includes("/admin")) return null;
          }
          return event;
        }}
      />
    </>
  );
}
