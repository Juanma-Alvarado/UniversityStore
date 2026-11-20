import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Stripe avisa acá cuando se confirma un pago y registramos el pedido.
// Responder con error hace que Stripe reintente; record_order es idempotente,
// así que un reintento nunca duplica el pedido.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Falta STRIPE_WEBHOOK_SECRET", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Falta la firma de Stripe", { status: 400 });
  }

  // La firma se valida contra el body crudo: no parsearlo antes.
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "firma inválida";
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }

  switch (event.type) {
    // Con tarjeta el pago ya viene confirmado en "completed"; con medios
    // asincrónicos llega después en "async_payment_succeeded".
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        try {
          await recordOrder(session);
        } catch (err) {
          console.error("[stripe webhook] no se pudo registrar el pedido", session.id, err);
          return new Response("No se pudo registrar el pedido", { status: 500 });
        }
      }
      break;
    }
  }

  return new Response(null, { status: 200 });
}

async function recordOrder(session: Stripe.Checkout.Session) {
  const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });

  const items = lineItems.data.map((item) => {
    const product = item.price?.product;
    const productId =
      product && typeof product !== "string" && !product.deleted
        ? (product.metadata.product_id ?? null)
        : null;
    const quantity = item.quantity ?? 1;
    const unitAmount = item.price?.unit_amount ?? Math.round(item.amount_total / quantity);

    return {
      product_id: productId,
      product_name: item.description ?? "Producto",
      unit_price: unitAmount / 100,
      quantity,
    };
  });

  const { error } = await getSupabaseAdmin().rpc("record_order", {
    p_stripe_session_id: session.id,
    p_user_id: session.client_reference_id,
    p_amount_total: (session.amount_total ?? 0) / 100,
    p_currency: (session.currency ?? "ars").toUpperCase(),
    p_customer_email: session.customer_details?.email ?? null,
    p_items: items,
  });
  if (error) throw error;
}
