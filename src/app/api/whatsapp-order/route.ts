import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createWhatsAppOrder, OrderError, type CartLine } from "@/lib/whatsapp-order";

export async function POST(request: NextRequest) {
  const { items }: { items?: CartLine[] } = await request.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  // Pedir sin cuenta está permitido; con sesión, el pedido queda en /pedidos.
  const user = await getCurrentUser();

  try {
    const order = await createWhatsAppOrder(items, user);
    return NextResponse.json(order);
  } catch (err) {
    const known = err instanceof OrderError;
    console.error("[whatsapp-order]", err);
    return NextResponse.json(
      { error: known ? err.message : "No se pudo registrar el pedido" },
      { status: known ? 400 : 500 },
    );
  }
}
