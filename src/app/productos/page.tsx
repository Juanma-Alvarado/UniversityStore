import { Suspense } from "react";
import { CategoryCatalog } from "@/components/category-catalog";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Productos",
  description: "Todo lo que vendemos, en un solo lugar.",
};

export default function ProductosPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-10 sm:pt-14">
      <h1 className="animate-rise mb-8 text-5xl font-extrabold tracking-tight sm:text-6xl">
        Todos los <span className="text-primary">productos</span>
      </h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <Catalog />
      </Suspense>
    </main>
  );
}

// Las cards se renderizan en el servidor y viajan como nodos ya armados; el
// filtro por categoría (y su animación) vive en CategoryCatalog, en el cliente.
async function Catalog() {
  const products = await getProducts();
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <CategoryCatalog
      categories={categories}
      items={products.map((product) => ({
        id: product.id,
        category: product.category,
        card: <ProductCard product={product} />,
      }))}
    />
  );
}
