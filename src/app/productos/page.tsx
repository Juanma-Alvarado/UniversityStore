import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Productos · UniversityStore",
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default function ProductosPage({ searchParams }: Props) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold">Productos</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Catalog({ searchParams }: Props) {
  const { category } = await searchParams;
  const products = await getProducts();
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2.5">
        <Chip href="/productos" active={!category} label="Todo" />
        {categories.map((c) => (
          <Chip key={c} href={`/productos?category=${encodeURIComponent(c)}`} active={category === c} label={c} />
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-foreground-soft">No hay productos en esta categoría todavía.</p>
      )}
    </>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background"
          : "rounded-full bg-surface px-4 py-2 text-sm font-bold text-foreground shadow-[0_2px_8px_rgba(24,21,17,0.08)]"
      }
    >
      {label}
    </Link>
  );
}
