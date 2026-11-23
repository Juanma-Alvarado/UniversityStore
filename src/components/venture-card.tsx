import Image from "next/image";
import Link from "next/link";
import type { Venture } from "@/lib/ventures";

/** Card foto-céntrica para listar emprendimientos (home y /emprendimientos). */
export function VentureCard({ venture }: { venture: Venture }) {
  return (
    <Link
      href={`/emprendimientos/${venture.slug}`}
      className="group flex flex-col overflow-hidden rounded-[22px] bg-surface shadow-[0_6px_20px_rgba(24,21,17,0.1)] transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-primary-tint">
        {venture.image_url ? (
          <Image
            src={venture.image_url}
            alt={`Foto de ${venture.name}`}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute left-3.5 top-3.5 rounded-full bg-yellow px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-ink">
          Emprendimiento
        </span>
        <h3 className="absolute bottom-3.5 left-4 right-4 font-display text-2xl font-extrabold leading-tight text-white">
          {venture.name}
        </h3>
      </div>
      <div className="flex flex-1 items-end justify-between gap-3 p-4">
        <p className="text-sm text-foreground-soft">{venture.tagline}</p>
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
    </Link>
  );
}

export function VentureGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-[22px] bg-surface shadow-[0_6px_20px_rgba(24,21,17,0.1)]"
        >
          <div className="aspect-[16/10] w-full bg-primary-tint" />
          <div className="p-4">
            <div className="h-4 w-2/3 rounded bg-background" />
          </div>
        </div>
      ))}
    </div>
  );
}
