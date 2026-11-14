"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

export default function CarritoPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "No se pudo iniciar el pago");
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-4 px-6 py-16">
        <h1 className="font-display text-3xl font-extrabold">Tu carrito está vacío</h1>
        <Link
          href="/productos"
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
        >
          Ver productos
        </Link>
      </main>
    );
  }

  const currency = items[0].currency;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold">Tu carrito</h1>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-[20px] bg-surface p-3.5 shadow-[0_4px_16px_rgba(24,21,17,0.08)]"
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-primary-tint">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
              <span className="font-display text-sm font-bold">{item.name}</span>
              <span className="text-sm font-extrabold text-primary">
                {formatPrice(item.price, item.currency)}
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-background p-1">
              <button
                type="button"
                aria-label="Restar cantidad"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-sm font-bold"
              >
                −
              </button>
              <span className="min-w-5 text-center text-sm font-bold tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Sumar cantidad"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-sm font-bold"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-xs font-bold text-foreground-soft hover:text-primary"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-[20px] bg-surface px-5 py-4 shadow-[0_4px_16px_rgba(24,21,17,0.08)]">
        <span className="text-sm font-bold text-foreground-soft">Subtotal</span>
        <span className="font-display text-xl font-extrabold">
          {formatPrice(subtotal, currency)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="mt-4 w-full rounded-full bg-primary px-6 py-4 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {loading ? "Redirigiendo a pago..." : "Finalizar compra"}
      </button>

      {checkoutError && (
        <p className="mt-3 text-sm font-bold text-red-600">{checkoutError}</p>
      )}
    </main>
  );
}
