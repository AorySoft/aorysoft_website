import type { Metadata } from "next";
import Image from "next/image";
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
    <main className="min-h-screen bg-canvas">
      <script
        type="application/ld+json"
        // Static, sanitized JSON — no user HTML is injected here.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <article className="shell max-w-4xl py-16 md:py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-signal"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to all articles
        </Link>

        <header className="mt-8 space-y-6">
          <span className="inline-block rounded-atelier border border-line px-3 py-1 text-sm text-ink-muted">
            {category}
          </span>
          <h1 className="display-title text-ink">{post.title}</h1>
          {post.excerpt && (
            <p className="body-lead max-w-3xl text-ink-muted">{post.excerpt}</p>
          )}
          <div className="flex flex-wrap items-center gap-5 text-sm text-ink-subtle">
            <span className="flex items-center gap-1.5">
              <User size={14} aria-hidden="true" />
              {post.author || "AorySoft"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} aria-hidden="true" />
              <time dateTime={publishedDate}>
                Published {new Date(publishedDate).toLocaleDateString()}
              </time>
            </span>
            <span className="flex items-center gap-1.5">
              Updated{" "}
              <time dateTime={post.updated_at}>
                {new Date(post.updated_at).toLocaleDateString()}
              </time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} aria-hidden="true" />
              {readTime(post.body_html)}
            </span>
          </div>
        </header>

        {post.cover_image?.url && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-atelier-lg border border-line">
            <Image
              src={post.cover_image.url}
              alt={post.cover_image.alt?.trim() || post.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Only admin-authored HTML, sanitized by SafeHtml before rendering. */}
        <SafeHtml
          html={post.body_html}
          className="mt-12 max-w-none space-y-5 text-ink-muted leading-relaxed [&_a]:text-signal [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l [&_blockquote]:border-line [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-ink [&_code]:rounded-atelier [&_code]:bg-surface-raised [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-ink [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-normal [&_h3]:text-ink [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-atelier-lg [&_pre]:border [&_pre]:border-line [&_pre]:bg-surface [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-6"
        />

        <footer className="mt-14 border-t border-line pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-signal transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to all articles
          </Link>
        </footer>
      </article>
    </main>
  );
}
