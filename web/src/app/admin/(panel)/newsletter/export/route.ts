import { canView } from "@/lib/admin/permissions";
import { csvResponse, getSessionRole } from "@/lib/admin/session";

export async function GET() {
  const { supabase, role } = await getSessionRole();
  if (!canView(role, "newsletter")) {
    return new Response("Owner-only", { status: 403 });
  }

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) {
    return new Response(`Export failed: ${error.message}`, { status: 500 });
  }

  return csvResponse(
    "newsletter-subscribers.csv",
    ["created_at", "email", "status", "consent_at"],
    data ?? [],
  );
}
