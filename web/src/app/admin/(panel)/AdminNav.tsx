"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  canView,
  type Area,
  type Role,
} from "@/lib/admin/permissions";
import { signOut } from "../login/actions";

type NavItem = { href: string; label: string; area: Area };

// Nine admin areas (plan §4.4). Visibility is permission-gated, but RLS is
// the real enforcement — a hidden link proves nothing on its own.
const items: NavItem[] = [
  { href: "/admin", label: "Dashboard", area: "submissions" },
  { href: "/admin/posts", label: "Blog Posts", area: "posts" },
  { href: "/admin/categories", label: "Categories", area: "categories" },
  { href: "/admin/services", label: "Services", area: "services" },
  { href: "/admin/cases", label: "Case studies", area: "cases" },
  { href: "/admin/jobs", label: "Jobs", area: "jobs" },
  { href: "/admin/reviews", label: "Reviews", area: "reviews" },
  { href: "/admin/media", label: "Media", area: "media" },
  { href: "/admin/submissions", label: "Submissions", area: "submissions" },
  { href: "/admin/newsletter", label: "Newsletter", area: "newsletter" },
  { href: "/admin/settings", label: "Site Settings", area: "settings" },
  { href: "/admin/csp-reports", label: "CSP reports", area: "settings" },
  { href: "/admin/users", label: "Users", area: "users" },
];

export default function AdminNav({
  role,
  email,
  mobile = false,
}: {
  role: Role | null;
  email: string;
  mobile?: boolean;
}) {
  const pathname = usePathname();

  const visible = items.filter(
    (item) => item.href === "/admin" || canView(role, item.area),
  );

  const nav = (
    <nav className="space-y-1" aria-label="Admin sections">
      {visible.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`block rounded-atelier px-3 py-2 text-sm transition-colors duration-200 ${
              active
                ? "bg-signal/15 font-medium text-signal"
                : "text-ink-muted hover:bg-surface-raised hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  if (mobile) {
    return (
      <div className="space-y-4">
        {nav}
        <div className="space-y-3 border-t border-line pt-4">
          <p className="text-xs text-ink-subtle">
            {email} · {role ?? "no role"}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-atelier border border-line px-3 py-2 text-left text-sm text-ink-muted transition-colors duration-200 hover:bg-surface-raised hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 border-b border-line pb-4">
        <p className="text-sm font-semibold text-ink">AorySoft Admin</p>
        <p className="mt-1 truncate text-xs text-ink-subtle">
          {email} · {role ?? "no role assigned"}
        </p>
      </div>
      {nav}
      <div className="mt-auto border-t border-line pt-4">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-atelier px-3 py-2 text-left text-sm text-ink-muted transition-colors duration-200 hover:bg-surface-raised hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
