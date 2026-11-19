import { ReviewForm } from "@/components/review-form";
import { Stars } from "@/components/stars";
import { getProductReviews, summarize } from "@/lib/reviews";

const dateFormat = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function ProductReviews({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const reviews = await getProductReviews(productId);
  const { count, average } = summarize(reviews);

  return (
    <section className="mt-12 flex flex-col gap-5" aria-labelledby="reviews-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="reviews-title" className="font-display text-2xl font-extrabold">
          Reseñas
        </h2>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-extrabold">
              {average.toFixed(1).replace(".", ",")}
            </span>
            <Stars value={average} className="h-5 w-5" />
            <span className="text-sm font-bold text-foreground-soft">
              ({count} {count === 1 ? "reseña" : "reseñas"})
            </span>
          </div>
        )}
      </div>

      <ReviewForm productId={productId} productSlug={productSlug} reviews={reviews} />

      {count === 0 ? (
        <p className="text-foreground-soft">Todavía nadie opinó. ¡Estrená la sección!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-col gap-2 rounded-[20px] bg-surface p-4 shadow-[0_4px_16px_rgba(24,21,17,0.08)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-yellow font-display font-extrabold text-ink">
                  {review.authorName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{review.authorName}</p>
                  <p className="text-xs text-foreground-soft">
                    {dateFormat.format(new Date(review.createdAt))}
                  </p>
                </div>
                <span className="flex items-center gap-1.5">
                  <span className="sr-only">{review.rating} de 5 estrellas</span>
                  <Stars value={review.rating} />
                </span>
              </div>
              {review.comment && (
                <p className="whitespace-pre-line text-sm text-foreground">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ProductReviewsSkeleton() {
  return (
    <div className="mt-12 flex animate-pulse flex-col gap-4">
      <div className="h-8 w-32 rounded bg-surface" />
      <div className="h-40 rounded-[24px] bg-surface" />
    </div>
  );
}
