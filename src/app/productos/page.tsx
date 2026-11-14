import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Productos · UniversityStore",
};

export default function ProductosPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-24">
      <h1 className="mb-10 font-display text-4xl font-black">Productos</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </main>
  );
}

async function ProductGrid() {
  const products = await getProducts();

  if (products.length === 0) {
    return <p className="text-foreground-soft">Todavía no hay productos cargados.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
