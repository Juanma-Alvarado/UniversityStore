import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getMyOrders, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/products";

export const metadata = {
  title: "Mis pedidos",
  robots: { index: false },
};

export default function PedidosPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold">Mis pedidos</h1>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <div className="h-40 animate-pulse rounded-[28px] bg-surface" />
            <div className="h-40 animate-pulse rounded-[28px] bg-surface" />
          </div>
        }
      >
        <OrderList />
      </Suspense>
    </main>
  );
}

async function OrderList() {
  await requireProfile("/pedidos");
  const orders = await getMyOrders();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[28px] bg-surface p-6 shadow-[0_4px_16px_rgba(24,21,17,0.08)]">
        <p className="text-foreground-soft">
          Todavía no hiciste ningún pedido. Cuando compres con tu cuenta iniciada, lo vas a ver
          aquí.
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
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const date = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(order.createdAt));

  return (
    <article className="rounded-[28px] bg-surface p-5 shadow-[0_4px_16px_rgba(24,21,17,0.08)]">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold">{date}</p>
          <p className="text-xs text-foreground-soft">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        {order.status === "paid" ? (
          <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary">
            Pagado
          </span>
        ) : (
          <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-foreground-soft">
            Reembolsado
          </span>
        )}
      </header>

      <ul className="flex flex-col gap-3">
        {order.items.map((item) => {
          const content = (
            <>
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-primary-tint">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-display text-sm font-bold">{item.productName}</span>
                <span className="text-xs text-foreground-soft">
                  {item.quantity} × {formatPrice(item.unitPrice, order.currency)}
                </span>
              </div>
              <span className="text-sm font-extrabold tabular-nums">
                {formatPrice(item.unitPrice * item.quantity, order.currency)}
              </span>
            </>
          );

          return (
            <li key={item.id}>
              {item.productSlug ? (
                <Link
                  href={`/productos/${item.productSlug}`}
                  className="flex items-center gap-3 rounded-2xl transition-opacity hover:opacity-80"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-center gap-3">{content}</div>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm font-bold text-foreground-soft">Total</span>
        <span className="font-display text-xl font-extrabold">
          {formatPrice(order.amountTotal, order.currency)}
        </span>
      </footer>
    </article>
  );
}
