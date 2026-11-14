"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

export default function CarritoPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-4 px-6 py-24">
        <h1 className="font-display text-3xl font-black">Tu carrito está vacío</h1>
        <Link
          href="/productos"
          className="rounded-full bg-lime px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-lime-ink"
        >
          Ver productos
        </Link>
      </main>
    );
  }

  const currency = items[0].currency;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-24">
      <h1 className="mb-10 font-display text-3xl font-black">Tu carrito</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
          >
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-background">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <span className="font-display text-sm font-bold">{item.name}</span>
              <span className="font-mono text-sm text-lime">
                {formatPrice(item.price, item.currency)}
              </span>
            </div>

            <div className="flex items-center rounded-full border border-line">
              <button
                type="button"
                aria-label="Restar cantidad"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="px-3 py-1.5 font-mono text-sm"
              >
                −
              </button>
              <span className="min-w-6 text-center font-mono text-sm tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Sumar cantidad"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="px-3 py-1.5 font-mono text-sm"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="font-mono text-xs uppercase tracking-wide text-foreground-soft hover:text-violet"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <span className="font-mono text-sm uppercase tracking-wide text-foreground-soft">
          Subtotal
        </span>
        <span className="font-display text-2xl font-black">
          {formatPrice(subtotal, currency)}
        </span>
      </div>

      <p className="mt-4 text-sm text-foreground-soft">
        El pago todavía no está conectado — el checkout llega en el próximo paso.
      </p>
    </main>
  );
}
