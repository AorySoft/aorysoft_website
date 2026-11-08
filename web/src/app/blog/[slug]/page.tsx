import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import SafeHtml from "@/components/SafeHtml";
import { getPublishedPostBySlug, getPublishedPosts } from "@/lib/data";

// Plan §8: articles are ISR-prerendered and revalidated when the admin
// publishes/edits a post (see revalidateFor() in lib/admin/actions.ts).
export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Prerender every published slug at build time. Returns [] when Supabase is
// not configured; `dynamicParams` stays true so new posts still render on
// demand between revalidations.
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return (posts ?? []).map((post) => ({ slug: post.slug }));
}

function readTime(body: string): string {
  return `${Math.max(1, Math.round((body?.length ?? 0) / 800))} min read`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return { title: "Article not found", robots: { index: false, follow: false } };
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || undefined;
  const image = post.seo_og_image_url || post.cover_image?.url || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publish_date ?? undefined,
      modifiedTime: post.updated_at,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const publishedDate = post.publish_date ?? post.created_at;
  const canonical = `${siteUrl}/blog/${post.slug}`;
  const category = post.category?.name ?? "General";

  // BlogPosting + BreadcrumbList structured data for rich results (plan §8).
  // "<" is escaped so author-controlled text can never break out of the script.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.seo_description || post.excerpt || undefined,
        datePublished: publishedDate,
        dateModified: post.updated_at,
        author: { "@type": "Person", name: post.author || "AorySoft" },
        image: post.seo_og_image_url || post.cover_image?.url || undefined,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        publisher: { "@type": "Organization", name: "AorySoft" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${siteUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: canonical,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <script
        type="application/ld+json"
        // Static, sanitized JSON — no user HTML is injected here.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to all articles
        </Link>

        <header className="mt-8 space-y-6">
          <span className="inline-block bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">
            {category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl text-gray-300 leading-relaxed">{post.excerpt}</p>
          )}
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <User size={14} aria-hidden="true" />
              {post.author || "AorySoft"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} aria-hidden="true" />
              <time dateTime={publishedDate}>
                {new Date(publishedDate).toLocaleDateString()}
              </time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} aria-hidden="true" />
              {readTime(post.body_html)}
            </span>
          </div>
        </header>

        {post.cover_image?.url && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-gray-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image.url}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Only admin-authored HTML, sanitized by SafeHtml before rendering. */}
        <SafeHtml
          html={post.body_html}
          className="mt-12 max-w-none text-gray-300 leading-relaxed space-y-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-cyan-400 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-gray-800 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto"
        />

        <footer className="mt-14 pt-8 border-t border-gray-800">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to all articles
          </Link>
        </footer>
      </article>
    </main>
  );
}
