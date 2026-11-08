// Shared helper: derive the caller's session user + profile role from the
// auth cookies. Used by server actions and route handlers alike. RLS remains
// the real enforcement; role checks here produce honest error messages.
import { createClient } from "@/lib/supabase/server";
import type { Role } from "./permissions";

export async function getSessionRole(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email?: string } | null;
  role: Role | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role =
    profile?.role === "owner" || profile?.role === "editor"
      ? profile.role
      : null;

  return { supabase, user: { id: user.id, email: user.email }, role };
}

/** RFC-4180-style CSV cell escaping. */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function csvResponse(
  filename: string,
  columns: string[],
  rows: Record<string, unknown>[],
): Response {
  const lines = [
    columns.join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsvCell(row[column])).join(","),
    ),
  ];
  // BOM so Excel opens UTF-8 correctly.
  const body = "\uFEFF" + lines.join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
