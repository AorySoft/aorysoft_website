import type { Metadata } from "next";
import CareersContent from "./CareersContent";
import { getActiveJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join AorySoft and help build the next generation of AI-powered solutions. Explore open positions and benefits.",
};

// Job edits in /admin revalidate this route (plan §8).
export const revalidate = 60;

export default async function CareersPage() {
  const jobs = await getActiveJobs();

  return (
    <main className="min-h-screen">
      <CareersContent jobs={jobs} />
    </main>
  );
}
