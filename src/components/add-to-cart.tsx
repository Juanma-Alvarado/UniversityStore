"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const maxQuantity = product.made_to_order ? null : product.stock;
  const soldOut = !product.made_to_order && product.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        imageUrl: product.image_url,
        maxQuantity,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (soldOut) {
    return (
      <span className="mt-2 w-fit rounded-full bg-background px-5 py-3 text-sm font-bold text-foreground-soft">
        Agotado
      </span>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="flex items-center gap-1 rounded-full border border-line bg-background p-1">
        <button
          type="button"
          aria-label="Restar cantidad"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg font-bold"
        >
          −
        </button>
        <span className="min-w-7 text-center text-sm font-bold tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Sumar cantidad"
          onClick={() =>
            setQuantity((q) => (maxQuantity != null ? Math.min(maxQuantity, q + 1) : q + 1))
          }
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg font-bold"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="flex-1 rounded-full bg-primary px-6 py-3.5 text-sm font-extrabold text-white transition-transform hover:scale-[1.02] shadow-glow"
      >
        {added ? "Agregado ✓" : "Agregar al carrito"}
      </button>
    </div>
  );
}
