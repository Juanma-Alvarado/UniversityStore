"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteReview,
  saveReview,
  type ReviewFormState,
} from "@/app/productos/[slug]/actions";
import { STAR_PATH } from "@/components/stars";
import { useAuth } from "@/lib/auth-context";
import type { Review } from "@/lib/reviews";

const LABELS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

type Props = {
  productId: string;
  productSlug: string;
  reviews: Review[];
};

export function ReviewForm({ productId, productSlug, reviews }: Props) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-[24px] bg-surface" />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[24px] bg-surface p-5 shadow-[0_4px_16px_rgba(24,21,17,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground-soft">¿Lo probaste? Contale al resto qué te pareció.</p>
        <Link
          href={`/ingresar?next=${encodeURIComponent(`/productos/${productSlug}`)}`}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background"
        >
          Ingresar para opinar
        </Link>
      </div>
    );
  }

  const own = reviews.find((r) => r.userId === user.id) ?? null;
  // key: si la reseña cambia en el server, el formulario arranca con los valores nuevos.
  return <Form key={own?.updatedAt ?? "new"} productId={productId} own={own} />;
}

function Form({ productId, own }: { productId: string; own: Review | null }) {
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(saveReview, null);
  const [deleteState, setDeleteState] = useState<ReviewFormState>(null);
  const [deleting, startDelete] = useTransition();
  const [rating, setRating] = useState(own?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;
  const status = deleteState ?? state;

  function handleDelete() {
    startDelete(async () => {
      setDeleteState(await deleteReview(productId));
    });
  }

  return (
    <form
      action={action}
      onSubmit={() => setDeleteState(null)}
      className="flex flex-col gap-4 rounded-[24px] bg-surface p-5 shadow-[0_4px_16px_rgba(24,21,17,0.08)]"
    >
      <input type="hidden" name="productId" value={productId} />
      <h3 className="font-display text-lg font-bold">
        {own ? "Tu reseña" : "Deja tu reseña"}
      </h3>

      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="sr-only">Puntaje</legend>
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              onMouseEnter={() => setHover(n)}
              className="cursor-pointer rounded-lg p-0.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary"
            >
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                required
                className="sr-only"
                aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
              />
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className={`h-8 w-8 transition-transform hover:scale-110 ${n <= shown ? "fill-yellow" : "fill-line"}`}
              >
                <path d={STAR_PATH} />
              </svg>
            </label>
          ))}
        </div>
        <span className="text-sm font-bold text-foreground-soft">{LABELS[shown]}</span>
      </fieldset>

      <textarea
        name="comment"
        defaultValue={own?.comment ?? ""}
        maxLength={1000}
        rows={3}
        placeholder="¿Qué te gustó? ¿Qué mejorarías? (opcional)"
        className="resize-y rounded-2xl border border-line bg-background px-4 py-3 text-base outline-none focus:border-primary"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || deleting || rating === 0}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "Guardando…" : own ? "Actualizar reseña" : "Publicar reseña"}
        </button>
        {own && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending || deleting}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-foreground-soft hover:text-foreground disabled:opacity-60"
          >
            {deleting ? "Borrando…" : "Borrar"}
          </button>
        )}
        {status && (
          <p
            role="status"
            className={`text-sm font-semibold ${status.ok ? "text-primary" : "text-foreground"}`}
          >
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
