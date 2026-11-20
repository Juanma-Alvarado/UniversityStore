import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { checkoutUrl } from "@/lib/wompi";

type CheckoutRequest = {
  items: { productId: string; quantity: number }[];
};

export async function POST(request: NextRequest) {
  const { items }: CheckoutRequest = await request.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  // Comprar sin cuenta sigue permitido; si hay sesión, el pedido queda en su historial.
  const user = await getCurrentUser();

  try {
    // El pedido nace "pending" con precios leídos de la base; su id es la
    // referencia que Wompi nos devuelve al confirmar el pago.
    const { data, error } = await getSupabaseAdmin()
      .rpc("create_pending_order", {
        p_user_id: user?.id ?? null,
        p_customer_email: user?.email ?? null,
        p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      })
      .single<{ order_id: string; amount_total: number; currency: string }>();
    if (error || !data) throw new Error(error?.message ?? "No se pudo crear el pedido");

    const url = checkoutUrl({
      reference: data.order_id,
      amountInCents: Math.round(Number(data.amount_total) * 100),
      currency: data.currency,
      redirectUrl: `${new URL(request.url).origin}/carrito/exito`,
      customerEmail: user?.email,
    });

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo iniciar el pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
