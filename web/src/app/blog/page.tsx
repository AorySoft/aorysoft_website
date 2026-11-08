import type { Metadata } from "next";
import BlogContent from "./BlogContent";
import { getPublishedPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights, tutorials and thoughts on AI, automation and the future of technology from the AorySoft team.",
};

// Draft/publish toggles in /admin revalidate this route (plan §8).
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="min-h-screen">
      <BlogContent posts={posts} />
    </main>
  );
}
