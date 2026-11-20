import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OrderItem = {
  id: string;
  productName: string;
  productSlug: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  status: "paid" | "refunded";
  amountTotal: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
};

type OrderRow = {
  id: string;
  status: "paid" | "refunded";
  amount_total: number;
  currency: string;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    products: { slug: string; image_url: string | null } | null;
  }[];
};

// RLS ya limita a los pedidos del usuario logueado.
export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, amount_total, currency, created_at, order_items(id, product_name, unit_price, quantity, products(slug, image_url))",
    )
    // Los pendientes (pago sin terminar) y fallidos no son compras.
    .in("status", ["paid", "refunded"])
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    amountTotal: Number(row.amount_total),
    currency: row.currency,
    createdAt: row.created_at,
    items: row.order_items.map((item) => ({
      id: item.id,
      productName: item.product_name,
      productSlug: item.products?.slug ?? null,
      imageUrl: item.products?.image_url ?? null,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
    })),
  }));
}
