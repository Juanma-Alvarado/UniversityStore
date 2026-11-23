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
      <div className="mx-auto w-full max-w-5xl px-6 pt-6">
        <section className="relative overflow-hidden rounded-[28px] bg-primary px-7 py-10 text-white sm:px-10 sm:py-14">
          <div className="flex flex-col items-center gap-10 sm:min-h-72 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <h1 className="font-display text-4xl font-extrabold leading-tight text-balance sm:text-5xl md:text-6xl">
                Tu producto,
                <br />
                directo al campus
              </h1>
              <p className="mt-4 max-w-xs text-sm text-white/90 sm:text-base">
                Hoy, mis propios productos. Mañana, los de todos los
                emprendimientos de la universidad.
              </p>
              <Link
                href="/productos"
                className="mt-7 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background"
              >
                Ver productos →
              </Link>
            </div>
            <div className="relative shrink-0">
              <div className="absolute inset-x-6 bottom-2 h-6 rounded-full bg-black/15 blur-xl" />
              <HeroVisual />
            </div>
          </div>
        </section>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Lo más pedido</h2>
          <Link href="/productos" className="text-sm font-bold text-primary">
            Ver todo
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <FeaturedProducts />
        </Suspense>

        <div className="mb-5 mt-14 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Detrás de cada producto</h2>
          <Link href="/emprendimientos" className="text-sm font-bold text-primary">
            Ver todos
          </Link>
        </div>
        <Suspense fallback={<VentureGridSkeleton />}>
          <FeaturedVentures />
        </Suspense>
      </main>
    </div>
  );
}

async function FeaturedProducts() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <p className="text-foreground-soft">
        Pronto vas a encontrar aquí los primeros productos.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
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
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {ventures.slice(0, 4).map((venture) => (
        <VentureCard key={venture.id} venture={venture} />
      ))}
    </div>
  );
}
