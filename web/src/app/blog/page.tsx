import type { Metadata } from "next";
import BlogContent from "./BlogContent";
import { getPublishedPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from AorySoft on AI, automation, and building software that holds up in production.",
  alternates: { canonical: "/blog" },
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
