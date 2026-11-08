"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, User, SearchX, Loader2 } from "lucide-react";
import type { PostWithRelations } from "@/lib/data";
import TurnstileField from "@/components/TurnstileField";
import { subscribeNewsletter } from "@/lib/public-forms/actions";
import { idleFormState } from "@/lib/public-forms/state";

// Audit/plan notes:
// - The six hardcoded 2023–24 demo posts are NOT imported (plan §8: only real,
//   authored articles ship). Posts will come from Supabase via the admin panel
//   (Phase 3) — until then the page shows an honest empty state.
// - Filter bug fixed: selecting the featured article's category no longer
//   blanks the grid (featured posts rejoin the grid when a filter is active).
// - InsightSearch (Exa) intentionally not ported (plan §16).
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
  featured: boolean;
};

const placeholderPosts: Post[] = [];

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
    featured: row.featured,
  };
}

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(
    subscribeNewsletter,
    idleFormState,
  );
  const turnstileConfigured = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileMissing = turnstileConfigured && !turnstileToken;

  return (
    <section className="py-20 bg-gray-800/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-gray-900/80 to-blue-900/20 backdrop-blur-sm border border-gray-700 rounded-3xl p-12 space-y-8"
        >
          <h2 className="text-4xl font-bold text-white">Stay Updated</h2>
          <p className="text-xl text-gray-300">
            Subscribe to our newsletter to get the latest insights on AI,
            automation, and technology trends.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            action={formAction}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: pending || turnstileMissing ? 1 : 1.05 }}
              whileTap={{ scale: pending || turnstileMissing ? 1 : 0.95 }}
              disabled={pending || turnstileMissing}
              aria-busy={pending}
              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 ${
                pending || turnstileMissing
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:shadow-lg hover:shadow-blue-500/50"
              }`}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                  Joining…
                </span>
              ) : (
                "Subscribe"
              )}
            </motion.button>

            {/* Honeypot: hidden from humans, bots tend to fill it. */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            >
              <label htmlFor="newsletter-website">Website</label>
              <input
                type="text"
                id="newsletter-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>
            <TurnstileField onTokenChange={setTurnstileToken} />
          </form>

          {state.status === "error" && (
            <div
              role="alert"
              className="text-sm text-red-300 space-y-1 text-left"
            >
              <p>{state.message}</p>
              {state.fieldErrors && (
                <ul className="list-disc list-inside">
                  {Object.entries(state.fieldErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {state.status === "success" && (
            <p role="status" className="text-sm text-cyan-300">
              {state.message}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const BlogContent = ({
  posts,
}: {
  posts?: PostWithRelations[] | null;
}) => {
  // null/undefined → Supabase not connected → empty state (placeholder
  // drafts live in admin until the owner publishes them).
  const blogPosts: Post[] = posts ? posts.map(toPost) : placeholderPosts;

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
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              AorySoft Blog
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Insights, tutorials, and thoughts on AI, automation, and the
              future of technology. Stay updated with the latest trends and best
              practices in intelligent software development.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-8">
              Featured Article
            </h2>

            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl overflow-hidden group hover:border-cyan-500/50 transition-all duration-300"
            >
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="block"
                aria-label={`Read ${featuredPost.title}`}
              >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto">
                  {featuredPost.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full min-h-[16rem] items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
                      <span className="bg-cyan-500 px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
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

                    <h3 className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">
                      {featuredPost.title}
                    </h3>

                    <p className="text-gray-300 text-lg leading-relaxed">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" aria-hidden="true" />
                      <span className="text-gray-400">
                        By {featuredPost.author}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              </Link>
            </motion.article>
          </div>
        </section>
      )}

      {/* Category Filter (only once there is content to filter) */}
      {blogPosts.length > 0 && (
        <section className="py-8 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid / Empty State */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden group hover:border-cyan-500/50 transition-all duration-300"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block"
                    aria-label={`Read ${post.title}`}
                  >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
                    {post.image && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-gray-900/80 backdrop-blur-sm text-cyan-400 px-3 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
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

                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center space-x-2 pt-4">
                      <User size={14} className="text-gray-400" aria-hidden="true" />
                      <span className="text-gray-400 text-sm">
                        {post.author}
                      </span>
                    </div>
                  </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-4 py-12">
              <SearchX className="w-12 h-12 text-gray-500" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">
                No articles published yet
              </h2>
              <p className="text-gray-400 max-w-md">
                We&apos;re working on our first posts. Subscribe below or check
                back soon — fresh AI and automation insights are on the way.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
};

export default BlogContent;
