"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import type { WhatsAppOrder } from "@/lib/whatsapp-order";

type CheckoutMode = "wompi" | "whatsapp";

// El pedido enviado sobrevive a una recarga mientras la pestaña siga abierta:
// el carrito ya se vació y los links de WhatsApp solo viven aquí.
const SENT_KEY = "universitystore-whatsapp-order";

export function CartView({ checkoutMode }: { checkoutMode: CheckoutMode }) {
  const { items, subtotal, setQuantity, removeItem, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [sentOrder, setSentOrder] = useState<WhatsAppOrder | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SENT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setSentOrder(JSON.parse(stored));
    } catch {
      // sin sessionStorage (modo privado) simplemente no se recuerda
    }
  }, []);

  async function handleWhatsAppOrder() {
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/whatsapp-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.groups) throw new Error(data.error ?? "No se pudo registrar el pedido");
      try {
        sessionStorage.setItem(SENT_KEY, JSON.stringify(data));
      } catch {
        // ver arriba
      }
      setSentOrder(data);
      clear();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "No se pudo registrar el pedido");
    } finally {
      setLoading(false);
    }
  }

  function dismissSentOrder() {
    try {
      sessionStorage.removeItem(SENT_KEY);
    } catch {
      // ver arriba
    }
    setSentOrder(null);
  }

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

  if (sentOrder) {
    return <SentOrder order={sentOrder} onDone={dismissSentOrder} />;
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

      {checkoutMode === "wompi" ? (
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="mt-4 w-full rounded-full bg-primary px-6 py-4 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "Redirigiendo a pago..." : "Finalizar compra"}
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={handleWhatsAppOrder}
            disabled={loading}
            className="mt-4 w-full rounded-full bg-[#25D366] px-6 py-4 text-sm font-extrabold text-ink transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Armando tu pedido..." : "Pedir por WhatsApp"}
          </button>
          <p className="mt-3 text-center text-xs text-foreground-soft">
            Te armamos el mensaje con tu pedido para cada emprendimiento. El pago y la
            entrega los coordinas directamente con ellos.
          </p>
        </>
      )}

      {checkoutError && (
        <p className="mt-3 text-sm font-bold text-red-600">{checkoutError}</p>
      )}
    </main>
  );
}

function SentOrder({ order, onDone }: { order: WhatsAppOrder; onDone: () => void }) {
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const reference = order.orderId.slice(0, 8).toUpperCase();
  const several = order.groups.length > 1;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <span className="rounded-full bg-yellow px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink">
        Pedido #{reference}
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold">¡Tu pedido está listo!</h1>
      <p className="mt-2 max-w-md text-foreground-soft">
        {several
          ? `Tu carrito tiene productos de ${order.groups.length} emprendimientos. Envía el mensaje a cada uno para coordinar el pago y la entrega.`
          : "Envía el mensaje por WhatsApp para coordinar el pago y la entrega."}
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {order.groups.map((group) => {
          const sent = opened.has(group.key);
          return (
            <li
              key={group.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-surface p-4 shadow-[0_4px_16px_rgba(24,21,17,0.08)]"
            >
              <div className="flex flex-col">
                <span className="font-display text-lg font-extrabold">{group.recipient}</span>
                <span className="text-sm text-foreground-soft">
                  {group.itemCount} {group.itemCount === 1 ? "producto" : "productos"} ·{" "}
                  {formatPrice(group.total, group.currency)}
                </span>
              </div>
              <a
                href={group.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpened((current) => new Set(current).add(group.key))}
                className={
                  sent
                    ? "rounded-full bg-background px-5 py-3 text-sm font-extrabold text-foreground-soft"
                    : "rounded-full bg-[#25D366] px-5 py-3 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                }
              >
                {sent ? "Enviado ✓ (abrir de nuevo)" : "Enviar por WhatsApp"}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/productos"
          onClick={onDone}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background"
        >
          Seguir comprando
        </Link>
        <Link
          href="/pedidos"
          onClick={onDone}
          className="rounded-full bg-surface px-6 py-3 text-sm font-bold text-foreground shadow-[0_2px_8px_rgba(24,21,17,0.08)]"
        >
          Ver mis pedidos
        </Link>
      </div>
    </main>
  );
}
