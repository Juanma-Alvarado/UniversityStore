"use client";

import type { MouseEvent } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export function QuickAddButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const soldOut = !product.made_to_order && product.stock <= 0;

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        imageUrl: product.image_url,
        maxQuantity: product.made_to_order ? null : product.stock,
      },
      1,
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      aria-label={`Agregar ${product.name} al carrito`}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xl font-extrabold text-white transition-transform hover:scale-105 disabled:bg-foreground-soft"
    >
      +
    </button>
  );
}
