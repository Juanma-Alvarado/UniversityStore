"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { useFavorites } from "@/lib/favorites-context";
import type { Product } from "@/lib/products";

// La lista llega del server; si el usuario saca un corazón acá mismo,
// la card desaparece sin recargar la página.
export function FavoritesGrid({ products }: { products: Product[] }) {
  const { ids, ready } = useFavorites();
  const visible = ready ? products.filter((p) => ids.has(p.id)) : products;

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[28px] bg-surface p-6 shadow-[0_4px_16px_rgba(24,21,17,0.08)]">
        <p className="text-foreground-soft">
          Todavía no guardaste nada. Tocá el corazón de un producto para tenerlo a mano acá.
        </p>
        <Link
          href="/productos"
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
      {visible.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
