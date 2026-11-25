import "server-only";
import { formatPrice } from "@/lib/products";
import { SITE_NAME, STORE_WHATSAPP } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { whatsappUrl } from "@/lib/whatsapp";

export type CartLine = { productId: string; quantity: number };

/** Un mensaje de WhatsApp por destinatario: cada emprendimiento, o la tienda para los productos propios. */
export type WhatsAppGroup = {
  key: string;
  recipient: string;
  url: string;
  itemCount: number;
  total: number;
  currency: string;
};

export type WhatsAppOrder = { orderId: string; groups: WhatsAppGroup[] };

type ProductRecipient = {
  id: string;
  name: string;
  ventures: { slug: string; name: string; whatsapp: string | null } | null;
};

type Recipient = { key: string; name: string; phone: string; isStore: boolean };

export class OrderError extends Error {}

function recipientFor(product: ProductRecipient): Recipient | null {
  const venture = product.ventures;
  if (venture?.whatsapp) {
    return { key: venture.slug, name: venture.name, phone: venture.whatsapp, isStore: false };
  }
  // Productos propios, o un emprendimiento que todavía no cargó su número: los
  // recibe la tienda y los coordina ella.
  if (STORE_WHATSAPP) {
    return { key: "tienda", name: SITE_NAME, phone: STORE_WHATSAPP, isStore: true };
  }
  return null;
}

export async function createWhatsAppOrder(
  lines: CartLine[],
  user: { id: string; email?: string | null } | null,
): Promise<WhatsAppOrder> {
  const admin = getSupabaseAdmin();

  // Antes de registrar nada: cada producto tiene que tener a quién pedírselo.
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, name, ventures(slug, name, whatsapp)")
    .in("id", lines.map((l) => l.productId))
    .returns<ProductRecipient[]>();
  if (productsError) throw productsError;

  const recipients = new Map<string, Recipient>();
  for (const product of products ?? []) {
    const recipient = recipientFor(product);
    if (!recipient) {
      throw new OrderError(`"${product.name}" todavía no recibe pedidos por WhatsApp`);
    }
    recipients.set(product.id, recipient);
  }

  // Precios, existencia y moneda los valida la base (create_pending_order).
  const { data: order, error: orderError } = await admin
    .rpc("create_whatsapp_order", {
      p_user_id: user?.id ?? null,
      p_customer_email: user?.email ?? null,
      p_items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
    })
    .single<{ order_id: string; amount_total: number; currency: string }>();
  if (orderError || !order) {
    throw new OrderError(orderError?.message ?? "No se pudo registrar el pedido");
  }

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("product_id, product_name, unit_price, quantity")
    .eq("order_id", order.order_id)
    .returns<{ product_id: string; product_name: string; unit_price: number; quantity: number }[]>();
  if (itemsError) throw itemsError;

  const reference = order.order_id.slice(0, 8).toUpperCase();
  const byRecipient = new Map<string, { recipient: Recipient; lines: string[]; count: number; total: number }>();

  for (const item of items ?? []) {
    const recipient = recipients.get(item.product_id);
    if (!recipient) continue;
    const group = byRecipient.get(recipient.key) ?? { recipient, lines: [], count: 0, total: 0 };
    const subtotal = Number(item.unit_price) * item.quantity;
    group.lines.push(`• ${item.quantity} × ${item.product_name} — ${formatPrice(subtotal, order.currency)}`);
    group.count += item.quantity;
    group.total += subtotal;
    byRecipient.set(recipient.key, group);
  }

  const groups = [...byRecipient.values()].map(({ recipient, lines: orderLines, count, total }) => {
    const greeting = recipient.isStore ? "¡Hola!" : `¡Hola, ${recipient.name}!`;
    const message = [
      `${greeting} Quiero hacer este pedido en ${SITE_NAME}:`,
      "",
      ...orderLines,
      "",
      `Total: ${formatPrice(total, order.currency)}`,
      `Pedido #${reference}`,
      "",
      "¿Cómo coordinamos el pago y la entrega?",
    ].join("\n");

    return {
      key: recipient.key,
      recipient: recipient.name,
      url: whatsappUrl(recipient.phone, message),
      itemCount: count,
      total,
      currency: order.currency,
    };
  });

  return { orderId: order.order_id, groups };
}
