import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedReviews } from "@/lib/data";

export const revalidate = 60;

const REVIEW_GATE = 3;

export async function generateMetadata(): Promise<Metadata> {
  const reviews = await getPublishedReviews();
  const enabled = (reviews?.length ?? 0) >= REVIEW_GATE;
  return {
    title: "Reviews",
    description:
      "Client reviews AorySoft has permission to show — no invented testimonials.",
    alternates: { canonical: "/reviews" },
    robots: enabled ? undefined : { index: false, follow: false },
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <p className="text-sm text-signal" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-ink-subtle">{"★".repeat(5 - rating)}</span>
    </p>
  );
}

export default async function ReviewsPage() {
  const reviews = (await getPublishedReviews()) ?? [];
  if (reviews.length < REVIEW_GATE) notFound();

  return (
    <main className="min-h-screen">
      <section className="section-y border-b border-line bg-surface">
        <div className="shell max-w-3xl">
          <h1 className="display-title">Client reviews</h1>
          <p className="body-lead mt-5">
            Only real client feedback we have permission to show. No made-up
            quotes.
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="shell">
          <ul className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {reviews.map((review) => (
              <li key={review.id} className="border-t border-line pt-8">
                <Stars rating={review.rating} />
                <blockquote className="mt-4 text-lg leading-relaxed text-ink">
                  “{review.review_text}”
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  {review.profile_image?.url ? (
                    <Image
                      src={review.profile_image.url}
                      alt={review.profile_image.alt || review.display_name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-atelier object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="font-medium text-ink">{review.display_name}</p>
                    <p className="text-sm text-ink-subtle">
                      {[review.attribution, review.project_or_service]
                        .filter(Boolean)
                        .join(" · ") || review.source}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-14 text-sm text-ink-subtle">
            Want to talk about a project?{" "}
            <Link href="/contact" className="text-signal hover:text-ink">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
