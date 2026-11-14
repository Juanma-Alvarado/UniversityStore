import { Suspense } from "react";
import Link from "next/link";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { getStripe } from "@/lib/stripe";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
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

async function retrieveSession(sessionId: string) {
  try {
    return await getStripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}

async function Confirmation({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const session = session_id ? await retrieveSession(session_id) : null;

  if (!session || session.payment_status !== "paid") {
    return (
      <>
        <h1 className="font-display text-3xl font-extrabold">No encontramos tu pedido</h1>
        <p className="text-foreground-soft">
          Si ya pagaste y ves esto, escribinos para confirmar tu compra.
        </p>
        <Link
          href="/productos"
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
        >
          Volver a productos
        </Link>
      </>
    );
  }

  return (
    <>
      <ClearCartOnSuccess />
      <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary">
        Pago confirmado
      </span>
      <h1 className="font-display text-3xl font-extrabold">¡Gracias por tu compra!</h1>
      <p className="text-foreground-soft">
        Pagaste{" "}
        {new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: session.currency?.toUpperCase() ?? "ARS",
          maximumFractionDigits: 0,
        }).format((session.amount_total ?? 0) / 100)}
        . Te vamos a contactar para coordinar la entrega.
      </p>
      <Link
        href="/productos"
        className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
      >
        Seguir mirando productos
      </Link>
    </>
  );
}
