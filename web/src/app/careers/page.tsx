import type { Metadata } from "next";
import CareersContent from "./CareersContent";
import { getActiveJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Build software, AI systems, and automation with AorySoft. See open roles or get in touch.",
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
