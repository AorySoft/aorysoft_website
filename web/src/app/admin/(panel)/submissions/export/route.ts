import { canEdit } from "@/lib/admin/permissions";
import { csvResponse, getSessionRole } from "@/lib/admin/session";

export async function GET(request: Request) {
  const { supabase, role } = await getSessionRole();
  if (!canEdit(role, "submissions")) {
    return new Response("Not authorized", { status: 403 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");

  let query = supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (type && type !== "all") query = query.eq("type", type);
  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return new Response(`Export failed: ${error.message}`, { status: 500 });
  }

  return csvResponse(
    "submissions.csv",
    ["created_at", "type", "status", "name", "email", "phone", "company", "service", "message", "details"],
    (data ?? []).map((row) => ({
      ...row,
      // PII hygiene: hashes are internal, never exported.
      ip_hash: undefined,
    })),
  );
}
