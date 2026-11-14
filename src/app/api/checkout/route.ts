import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

type CheckoutRequest = {
  items: { productId: string; quantity: number }[];
};

export async function POST(request: NextRequest) {
  const { items }: CheckoutRequest = await request.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  const ids = items.map((item) => item.productId);
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  if (error || !products || products.length === 0) {
    return NextResponse.json({ error: "No se pudieron cargar los productos" }, { status: 400 });
  }

  const line_items = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

    return {
      quantity: item.quantity,
      price_data: {
        currency: product.currency.toLowerCase(),
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.name,
          images: product.image_url
            ? [new URL(product.image_url, request.url).toString()]
            : undefined,
        },
      },
    };
  });

  const origin = new URL(request.url).origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/carrito/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrito`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo iniciar el pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
