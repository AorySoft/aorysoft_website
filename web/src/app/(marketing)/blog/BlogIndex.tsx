"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User, SearchX } from "lucide-react";
import type { PostWithRelations } from "@/lib/data";

type Post = {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string | null;
  imageAlt: string;
  featured: boolean;
};

function toPost(row: PostWithRelations): Post {
  const bodyLength = row.body_html?.length ?? 0;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    author: row.author ?? "AorySoft",
    date: (row.publish_date ?? row.created_at).slice(0, 10),
    readTime: `${Math.max(1, Math.round(bodyLength / 800))} min read`,
    category: row.category?.name ?? "General",
    image: row.cover_image?.url ?? null,
    imageAlt: row.cover_image?.alt?.trim() || row.title,
    featured: row.featured,
  };
}

/** Client island: category filter + featured/grid (needs interactivity). */
export default function BlogIndex({
  posts,
}: {
  posts?: PostWithRelations[] | null;
}) {
  const blogPosts: Post[] = posts ? posts.map(toPost) : [];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(blogPosts.map((post) => post.category))),
  ];

  const featuredPost = blogPosts.find((post) => post.featured);
  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts.filter((post) => !post.featured)
      : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <>
      {featuredPost && (
        <section className="bg-canvas py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 font-display text-3xl font-normal text-ink">
              Featured Article
            </h2>

            <article className="group overflow-hidden rounded-atelier-lg border border-line bg-surface-raised/50 transition-all duration-300 hover:-translate-y-1 hover:border-signal/40 motion-reduce:hover:translate-y-0">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="block"
                aria-label={`Read ${featuredPost.title}`}
              >
                <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                  <div className="relative h-64 min-h-[16rem] lg:min-h-full">
                    {featuredPost.image ? (
                      <>
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.imageAlt}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                        />
                        <div className="absolute left-4 top-4">
                          <span className="rounded-atelier bg-signal px-3 py-1 text-sm font-medium text-canvas">
                            Featured
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full min-h-[16rem] items-center justify-center bg-surface">
                        <span className="rounded-atelier bg-signal px-3 py-1 text-sm font-medium text-canvas">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 text-sm text-ink-subtle">
                        <span className="rounded-atelier border border-line px-3 py-1 text-ink-muted">
                          {featuredPost.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} aria-hidden="true" />
                          <span>
                            {new Date(featuredPost.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} aria-hidden="true" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                      </div>

                      <h3 className="font-display text-3xl font-normal text-ink transition-colors duration-200 group-hover:text-signal">
                        {featuredPost.title}
                      </h3>

                      <p className="text-lg leading-relaxed text-ink-muted">
                        {featuredPost.excerpt}
                      </p>

                      <div className="flex items-center space-x-2">
                        <User
                          size={16}
                          className="text-ink-subtle"
                          aria-hidden="true"
                        />
                        <span className="text-ink-subtle">
                          By {featuredPost.author}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          </div>
        </section>
      )}

      {blogPosts.length > 0 && (
        <section className="bg-surface-raised/30 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              role="group"
              aria-label="Filter by category"
              className="flex flex-wrap justify-center gap-4"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-11 rounded-atelier border px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category
                      ? "border-signal bg-signal text-canvas"
                      : "border-line-strong bg-surface-raised text-ink-muted hover:border-signal/60 hover:text-ink"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <article
                  key={post.id}
                  style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                  className="atelier-fade-up group overflow-hidden rounded-atelier-lg border border-line bg-surface-raised/50 transition-all duration-300 hover:-translate-y-1 hover:border-signal/40 motion-reduce:hover:translate-y-0"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block"
                    aria-label={`Read ${post.title}`}
                  >
                    <div className="relative h-48 overflow-hidden bg-surface">
                      {post.image && (
                        <Image
                          src={post.image}
                          alt={post.imageAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
                        />
                      )}
                      <div className="absolute left-4 top-4">
                        <span className="rounded-atelier bg-canvas/90 px-3 py-1 text-xs font-medium text-signal">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 p-6">
                      <div className="flex items-center space-x-4 text-xs text-ink-subtle">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} aria-hidden="true" />
                          <span>
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} aria-hidden="true" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>

                      <h3 className="line-clamp-2 font-display text-xl font-normal text-ink transition-colors duration-200 group-hover:text-signal">
                        {post.title}
                      </h3>

                      <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center space-x-2 pt-4">
                        <User
                          size={14}
                          className="text-ink-subtle"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-ink-subtle">
                          {post.author}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 py-12 text-center">
              <SearchX
                className="h-12 w-12 text-ink-subtle"
                aria-hidden="true"
              />
              <h2 className="font-display text-2xl font-normal text-ink">
                No articles published yet
              </h2>
              <p className="max-w-md text-ink-subtle">
                No posts yet. Subscribe below if you want a note when the first
                ones go live, or check back later.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
