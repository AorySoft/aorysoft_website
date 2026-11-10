import Image from "next/image";
import type { ReviewWithImage } from "@/lib/data";
import ReviewSubmitForm from "@/components/ReviewSubmitForm";

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
 * Honest empty state until real reviews are cleared in /admin.
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
            Nothing published yet. If you have worked with us and want to share
            feedback, use the form below. We review every submission before it
            goes live.
          </p>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2">
            {items.map((review) => (
              <li
                key={review.id}
                className="border-t border-line pt-8"
              >
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

        <div className="mt-16 max-w-xl border-t border-line pt-10">
          <h3 className="font-display text-2xl text-ink">Share your experience</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            We keep submissions private until we check permission and publish.
            Only send feedback you are okay seeing on the site.
          </p>
          <div className="mt-6">
            <ReviewSubmitForm />
          </div>
        </div>
      </div>
    </section>
  );
}
