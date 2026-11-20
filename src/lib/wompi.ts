import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Integración con Wompi (Colombia): Web Checkout + eventos firmados.
// Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web/

export type WompiTransaction = {
  id: string;
  reference: string;
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
  amount_in_cents: number;
  currency: string;
  customer_email?: string | null;
  payment_method_type?: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta ${name} en .env.local — está en comercios.wompi.co → Desarrolladores`,
    );
  }
  return value;
}

// Las llaves de prueba (pub_test_) apuntan al sandbox; las de producción, a producción.
function apiBase(): string {
  return requireEnv("WOMPI_PUBLIC_KEY").startsWith("pub_test_")
    ? "https://sandbox.wompi.co/v1"
    : "https://production.wompi.co/v1";
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export function checkoutUrl(params: {
  reference: string;
  amountInCents: number;
  currency: string;
  redirectUrl: string;
  customerEmail?: string | null;
}): string {
  // Firma de integridad: referencia + monto en centavos + moneda + secreto.
  // Se calcula solo en el server para no exponer el secreto.
  const signature = sha256(
    `${params.reference}${params.amountInCents}${params.currency}${requireEnv("WOMPI_INTEGRITY_SECRET")}`,
  );

  const url = new URL("https://checkout.wompi.co/p/");
  url.searchParams.set("public-key", requireEnv("WOMPI_PUBLIC_KEY"));
  url.searchParams.set("currency", params.currency);
  url.searchParams.set("amount-in-cents", String(params.amountInCents));
  url.searchParams.set("reference", params.reference);
  url.searchParams.set("signature:integrity", signature);
  url.searchParams.set("redirect-url", params.redirectUrl);
  if (params.customerEmail) url.searchParams.set("customer-data:email", params.customerEmail);
  return url.toString();
}

// GET /transactions/{id} es público y devuelve transacciones de CUALQUIER
// comercio: alguien podría pagarse a sí mismo con la referencia de un pedido
// nuestro. Por eso se confirma que la transacción aparezca en la búsqueda por
// referencia, que exige nuestra llave y solo lista transacciones propias.
export async function getOwnTransaction(id: string): Promise<WompiTransaction | null> {
  const res = await fetch(`${apiBase()}/transactions/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const tx = ((await res.json()) as { data?: WompiTransaction }).data;
  if (!tx) return null;

  const search = await fetch(
    `${apiBase()}/transactions?reference=${encodeURIComponent(tx.reference)}`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${requireEnv("WOMPI_PUBLIC_KEY")}` },
    },
  );
  if (!search.ok) return null;
  const own = ((await search.json()) as { data?: WompiTransaction[] }).data ?? [];
  return own.find((t) => t.id === tx.id) ?? null;
}

type WompiEvent = {
  event: string;
  data: { transaction?: WompiTransaction };
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
};

// Checksum = SHA256(valores de signature.properties en orden + timestamp + secreto de eventos).
export function verifyEvent(event: WompiEvent): boolean {
  const { properties, checksum } = event.signature ?? {};
  if (!properties || !checksum || event.timestamp == null) return false;

  const values = properties.map((path) =>
    path.split(".").reduce<unknown>(
      (obj, key) => (obj && typeof obj === "object" ? (obj as Record<string, unknown>)[key] : undefined),
      event.data,
    ),
  );
  const expected = sha256(
    `${values.join("")}${event.timestamp}${requireEnv("WOMPI_EVENTS_SECRET")}`,
  );

  const a = Buffer.from(expected.toLowerCase());
  const b = Buffer.from(checksum.toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Pasa el resultado de la transacción al pedido (la referencia es el id del
// pedido). Idempotente: solo cambia pedidos que siguen pendientes.
export async function applyTransaction(tx: WompiTransaction): Promise<string | null> {
  if (!UUID.test(tx.reference)) return null;

  const { data, error } = await getSupabaseAdmin().rpc("apply_payment_result", {
    p_order_id: tx.reference,
    p_payment_id: tx.id,
    p_status: tx.status,
    p_amount_in_cents: tx.amount_in_cents,
    p_currency: tx.currency,
  });
  if (error) throw error;
  return data as string;
}
