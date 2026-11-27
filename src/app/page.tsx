import { Suspense } from "react";
import Link from "next/link";
import { HeroVisual } from "@/components/hero-visual";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { VentureCard, VentureGridSkeleton } from "@/components/venture-card";
import { getProducts } from "@/lib/products";
import { getVentures } from "@/lib/ventures";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-6xl px-5 pt-8 sm:pt-14">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-surface/80 p-8 shadow-sm backdrop-blur-sm sm:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary opacity-20 blur-3xl" />
          <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-1.5 text-sm font-bold text-ink">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Emprendimientos universitarios
              </span>
              <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
                Tu producto,
                <br />
                <span className="text-primary">directo al campus</span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-foreground-soft">
                Hoy, mis propios productos. Mañana, los de todos los emprendimientos de la
                universidad.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/productos"
                  className="rounded-full bg-primary px-7 py-3.5 font-extrabold text-white shadow-glow transition-transform hover:scale-105"
                >
                  Ver productos →
                </Link>
                <Link
                  href="/emprendimientos"
                  className="rounded-full border border-line bg-background px-7 py-3.5 font-bold transition-colors hover:border-secondary"
                >
                  Conoce los emprendimientos
                </Link>
              </div>
            </div>
            <div className="relative grid place-items-center">
              <div className="absolute h-64 w-64 rounded-full bg-yellow opacity-50 blur-3xl" />
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto mt-16 w-full max-w-6xl flex-1 px-5">
        <SectionTitle title="Lo más" accent="pedido" emoji="🔥" href="/productos" link="Ver todo" />
        <Suspense fallback={<ProductGridSkeleton />}>
          <FeaturedProducts />
        </Suspense>

        <div className="mt-20">
          <SectionTitle title="Detrás de cada" accent="producto" href="/emprendimientos" link="Ver todos" />
          <Suspense fallback={<VentureGridSkeleton />}>
            <FeaturedVentures />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function SectionTitle({
  title,
  accent,
  emoji,
  href,
  link,
}: {
  title: string;
  accent: string;
  emoji?: string;
  href: string;
  link: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-3xl font-extrabold sm:text-4xl">
        {title} <span className="text-primary">{accent}</span>
        {emoji && <> {emoji}</>}
      </h2>
      <Link href={href} className="shrink-0 font-bold text-secondary hover:underline">
        {link} →
      </Link>
    </div>
  );
}

async function FeaturedProducts() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <p className="text-foreground-soft">Pronto vas a encontrar aquí los primeros productos.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}

async function FeaturedVentures() {
  const ventures = await getVentures();

  if (ventures.length === 0) {
    return (
      <p className="text-foreground-soft">
        Pronto vas a conocer aquí a los emprendimientos de la tienda.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {ventures.slice(0, 6).map((venture, i) => (
        <VentureCard key={venture.id} venture={venture} index={i} />
      ))}
    </div>
  );
}
