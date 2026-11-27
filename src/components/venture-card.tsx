import Image from "next/image";
import Link from "next/link";
import type { Venture } from "@/lib/ventures";

/** Card de emprendimiento: la foto ocupa toda la card y el texto va encima (home y /emprendimientos). */
export function VentureCard({ venture, index }: { venture: Venture; index?: number }) {
  return (
    <Link
      href={`/emprendimientos/${venture.slug}`}
      className={`card-glow group relative block aspect-[10/9] overflow-hidden rounded-[28px] bg-primary-tint ${
        index !== undefined ? "animate-rise" : ""
      }`}
      style={index !== undefined ? { animationDelay: `${index * 110}ms` } : undefined}
    >
      {venture.image_url ? (
        <Image
          src={venture.image_url}
          alt={`Foto de ${venture.name}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 sm:p-6">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-yellow">
          Emprendimiento
        </span>
        <h3 className="font-display text-3xl font-extrabold leading-none text-white">
          {venture.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/80">{venture.tagline}</p>
      </div>
    </Link>
  );
}

export function VentureGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-[10/9] animate-pulse rounded-[28px] bg-surface" />
      ))}
    </div>
  );
}
