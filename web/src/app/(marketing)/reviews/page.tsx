import type { Metadata } from "next";
import PageEndCta from "@/components/patterns/PageEndCta";
import PageHero from "@/components/patterns/PageHero";
import Image from "next/image";
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
    <main>
      <PageHero
        eyebrow="Client feedback"
        title="Client reviews"
        lead="Only real client feedback we have permission to show. No made-up quotes."
      />

      <section aria-label="Reviews" className="section-y">
        <div className="shell">
          <ul className="grid grid-cols-1 gap-[clamp(1.5rem,4svh,2.5rem)] md:grid-cols-2">
            {reviews.map((review) => (
              <li key={review.id} className="border-t border-line pt-[clamp(1.25rem,3svh,2rem)]">
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
        </div>
      </section>
      <PageEndCta title="Want to talk about a project?" secondary={{ href: "/services", label: "Explore services" }} />
    </main>
  );
}
