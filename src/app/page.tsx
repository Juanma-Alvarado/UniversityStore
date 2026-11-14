import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-16 pt-16 sm:pt-24">
        <h1 className="font-display text-5xl font-black text-balance sm:text-7xl">
          Tu producto,<br />tu marca
        </h1>
        <p className="max-w-md text-lg text-foreground-soft">
          Hoy, mis propios productos. Mañana, los de todos los
          emprendimientos de la universidad.
        </p>
        <Link
          href="/productos"
          className="mt-2 w-fit rounded-full bg-lime px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-lime-ink transition-opacity hover:opacity-90"
        >
          Ver productos
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-24">
        <h2 className="mb-6 font-display text-2xl font-bold">
          Nuestros productos
        </h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-foreground-soft">
            Pronto vas a encontrar acá los primeros productos.
          </p>
        )}
      </main>
    </div>
  );
}
