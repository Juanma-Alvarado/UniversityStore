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
      <span className="w-fit rounded-full border border-line px-5 py-3 font-mono text-xs uppercase tracking-wide text-foreground-soft">
        Agotado
      </span>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center rounded-full border border-line">
        <button
          type="button"
          aria-label="Restar cantidad"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 font-mono text-sm"
        >
          −
        </button>
        <span className="min-w-6 text-center font-mono text-sm tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Sumar cantidad"
          onClick={() =>
            setQuantity((q) => (maxQuantity != null ? Math.min(maxQuantity, q + 1) : q + 1))
          }
          className="px-3 py-2 font-mono text-sm"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="rounded-full bg-lime px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-lime-ink transition-opacity hover:opacity-90"
      >
        {added ? "Agregado ✓" : "Agregar al carrito"}
      </button>
    </div>
  );
}
