import type { Metadata } from "next";
import BlogIndex from "./BlogIndex";
import NewsletterSignup from "./NewsletterSignup";
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
    <main className="min-h-screen">
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="display-title mb-6">AorySoft Blog</h1>
          <p className="mx-auto max-w-3xl text-xl text-ink-muted">
            Notes on AI, automation, and building software that holds up in
            production. New posts show up here when we publish them.
          </p>
        </div>
      </section>

      <BlogIndex posts={posts} />
      <NewsletterSignup />
    </main>
  );
}
