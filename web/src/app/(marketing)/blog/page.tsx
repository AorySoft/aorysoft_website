import type { Metadata } from "next";
import BlogIndex from "./BlogIndex";
import NewsletterSignup from "./NewsletterSignup";
import PageHero from "@/components/patterns/PageHero";
import { getPublishedPosts } from "@/lib/data";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPublishedPosts();
  const enabled = (posts?.length ?? 0) >= 1;
  return {
    title: "Blog",
    description:
      "Notes from AorySoft on AI, automation, and building software that holds up in production.",
    alternates: { canonical: "/blog" },
    robots: enabled ? undefined : { index: false, follow: false },
  };
}

/** RSC shell: hero copy in HTML; list/filter + newsletter are client islands. */
export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <main>
      <PageHero
        eyebrow="Blog"
        title="AorySoft Blog"
        lead="Notes on AI, automation, and building software that holds up in production. New posts show up here when we publish them."
      />
      <BlogIndex posts={posts} />
      <NewsletterSignup />
    </main>
  );
}
