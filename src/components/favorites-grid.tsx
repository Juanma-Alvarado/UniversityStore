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
      <div className="panel flex flex-col items-start gap-4 rounded-[28px] p-6">
        <p className="text-foreground-soft">
          Todavía no guardaste nada. Toca el corazón de un producto para tenerlo a mano aquí.
        </p>
        <Link
          href="/productos"
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03]"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {visible.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
