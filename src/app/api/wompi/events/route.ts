import { applyTransaction, verifyEvent } from "@/lib/wompi";

// Wompi avisa acá cuando una transacción cambia de estado. Cualquier respuesta
// que no sea 200 hace que reintente (30 min, 3 h, 24 h); applyTransaction es
// idempotente, así que un reintento nunca duplica efectos.
export async function POST(request: Request) {
  let event;
  try {
    event = await request.json();
  } catch {
    return new Response("Body inválido", { status: 400 });
  }

  if (!verifyEvent(event)) {
    return new Response("Firma inválida", { status: 401 });
  }

  if (event.event === "transaction.updated" && event.data?.transaction) {
    try {
      await applyTransaction(event.data.transaction);
    } catch (err) {
      console.error("[wompi] no se pudo aplicar la transacción", event.data.transaction.id, err);
      return new Response("No se pudo actualizar el pedido", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}
