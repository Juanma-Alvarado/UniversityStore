import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { getProducts } from "@/lib/products";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-5xl px-6 pt-6">
        <section className="relative overflow-hidden rounded-[28px] bg-primary px-7 py-9 text-white sm:px-10 sm:py-12">
          <h1 className="font-display text-4xl font-extrabold leading-tight text-balance sm:text-5xl">
            Tu producto,
            <br />
            directo al campus
          </h1>
          <p className="mt-3 max-w-xs text-sm text-white/90 sm:text-base">
            Hoy, mis propios productos. Mañana, los de todos los
            emprendimientos de la universidad.
          </p>
          <Link
            href="/productos"
            className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background"
          >
            Ver productos →
          </Link>
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
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
      </main>
    </div>
  );
}

async function FeaturedProducts() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <p className="text-foreground-soft">
        Pronto vas a encontrar acá los primeros productos.
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
