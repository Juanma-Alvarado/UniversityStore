import { Suspense } from "react";
import Link from "next/link";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/products";
import { applyTransaction, getOwnTransaction } from "@/lib/wompi";

type Props = {
  // Wompi vuelve a esta página con ?id=<id de la transacción>.
  searchParams: Promise<{ id?: string }>;
};

export const metadata = {
  title: "Estado del pago",
  robots: { index: false },
};

export default function ExitoPage({ searchParams }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-6 py-16">
      <Suspense fallback={<p className="text-foreground-soft">Confirmando tu pago…</p>}>
        <Confirmation searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

const primaryButton = "rounded-full bg-primary px-6 py-3 text-sm font-bold text-white";
const secondaryButton =
  "rounded-full bg-surface px-6 py-3 text-sm font-bold shadow-[0_4px_16px_rgba(24,21,17,0.08)]";

async function Confirmation({ searchParams }: Props) {
  const { id } = await searchParams;
  const transaction = id ? await getOwnTransaction(id) : null;

  if (!transaction) {
    return (
      <>
        <h1 className="font-display text-3xl font-extrabold">No encontramos tu pago</h1>
        <p className="text-foreground-soft">
          Si ya pagaste y ves esto, escribinos para confirmar tu compra.
        </p>
        <Link href="/productos" className={primaryButton}>
          Volver a productos
        </Link>
      </>
    );
  }

  // El dato viene de la API de Wompi y es de nuestro comercio, así que es confiable
  // para actualizar el pedido. El webhook hace lo mismo por si el usuario
  // cierra la pestaña antes de volver; aplicar dos veces no tiene efecto.
  await applyTransaction(transaction);
  const user = await getCurrentUser();
  const total = formatPrice(transaction.amount_in_cents / 100, transaction.currency);

  if (transaction.status === "APPROVED") {
    return (
      <>
        <ClearCartOnSuccess />
        <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary">
          Pago confirmado
        </span>
        <h1 className="font-display text-3xl font-extrabold">¡Gracias por tu compra!</h1>
        <p className="text-foreground-soft">
          Pagaste {total}. Te vamos a contactar para coordinar la entrega.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/productos" className={primaryButton}>
            Seguir mirando productos
          </Link>
          {user && (
            <Link href="/pedidos" className={secondaryButton}>
              Ver mis pedidos
            </Link>
          )}
        </div>
      </>
    );
  }

  if (transaction.status === "PENDING") {
    return (
      <>
        <span className="rounded-full bg-yellow px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink">
          Pago en proceso
        </span>
        <h1 className="font-display text-3xl font-extrabold">Tu banco todavía no confirma</h1>
        <p className="text-foreground-soft">
          Con PSE la confirmación puede tardar unos minutos. Apenas llegue, el pedido aparece
          {user ? " en tus pedidos" : " confirmado"}. No hace falta que pagues de nuevo.
        </p>
        <div className="flex flex-wrap gap-3">
          {user && (
            <Link href="/pedidos" className={primaryButton}>
              Ver mis pedidos
            </Link>
          )}
          <Link href="/productos" className={user ? secondaryButton : primaryButton}>
            Seguir mirando productos
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-foreground-soft">
        Pago no completado
      </span>
      <h1 className="font-display text-3xl font-extrabold">No se pudo completar el pago</h1>
      <p className="text-foreground-soft">
        El pago de {total} fue rechazado o cancelado. Tu carrito sigue guardado para que lo
        intentes de nuevo.
      </p>
      <Link href="/carrito" className={primaryButton}>
        Volver al carrito
      </Link>
    </>
  );
}
