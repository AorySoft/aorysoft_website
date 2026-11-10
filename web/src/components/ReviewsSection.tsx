import Image from "next/image";
import type { ReviewWithImage } from "@/lib/data";

function Stars({ rating }: { rating: number }) {
  return (
    <p className="text-sm text-signal" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-ink-subtle">{"★".repeat(5 - rating)}</span>
    </p>
  );
}

/**
 * Client reviews — published + permission_confirmed only.
 * Feedback is invite-only (`/feedback?token=…`); no public form here.
 */
export default function ReviewsSection({
  reviews,
}: {
  reviews: ReviewWithImage[] | null;
}) {
  const items = reviews ?? [];

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="section-y scroll-mt-16 border-t border-line bg-surface"
    >
      <div className="shell">
        <div className="max-w-3xl">
          <h2 id="reviews-title" className="display-title">
            Client reviews
          </h2>
          <p className="body-lead mt-5">
            Only real client feedback we have permission to show. No made-up
            quotes.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="mt-12 max-w-2xl text-base leading-relaxed text-ink-muted">
            Nothing published yet. After a project wraps, we send the client a
            private feedback link. Approved reviews appear here.
          </p>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2">
            {items.map((review) => (
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
                      {review.source_url ? (
                        <>
                          {" · "}
                          <a
                            href={review.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-signal/40 underline-offset-4 hover:text-signal"
                          >
                            Source
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
