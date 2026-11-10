// Soften seeded service copy in the live DB (no em dashes, less brochure tone).
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(2);
}

const svc = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const updates = [
  {
    title: "AI Automation",
    subtitle: "Cut repetitive work with practical AI workflows",
    description:
      "Automate the busywork: document handling, workflows, and ops tools that save time without adding ceremony.",
  },
  {
    title: "Smart Integrations",
    subtitle: "Connect the systems you already use",
    description:
      "APIs and integrations that keep data moving between your tools, including older systems that still matter.",
  },
  {
    title: "Data Analytics",
    subtitle: "Clear views of what is happening",
    description:
      "Dashboards, reporting, and models that help you see patterns and make decisions with better data.",
  },
  {
    title: "Cloud Solutions",
    subtitle: "Deploy and run with less friction",
    description:
      "Cloud setup, containers, and ops practices so your apps stay reliable as traffic and features grow.",
  },
];

for (const row of updates) {
  const { data, error } = await svc
    .from("services")
    .update({
      subtitle: row.subtitle,
      description: row.description,
      updated_at: new Date().toISOString(),
    })
    .eq("title", row.title)
    .eq("active", true)
    .select("id, title");
  if (error) {
    console.error(row.title, error.message);
    process.exit(1);
  }
  console.log("updated", row.title, "rows=", data?.length ?? 0);
}

console.log("done");
