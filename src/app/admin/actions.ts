"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, slugify } from "@/lib/admin";

export type AdminFormState = { ok: boolean; message: string } | null;

const text = (formData: FormData, key: string, max = 2000) =>
  String(formData.get(key) ?? "").trim().slice(0, max);

/** Solo URLs de nuestro Storage o rutas locales (/products/...). */
function imageUrl(formData: FormData): string | null {
  const value = text(formData, "image_url", 500);
  if (!value) return null;
  const storage = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catalog/`;
  return value.startsWith(storage) || value.startsWith("/") ? value : null;
}

function friendlyError(message: string): string {
  if (message.includes("duplicate key") && message.includes("slug")) {
    return "Ya existe otro con esa dirección (slug). Cambia el nombre o el slug.";
  }
  return "No se pudo guardar. Revisa los datos e intenta de nuevo.";
}

export async function saveProduct(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();

  const id = text(formData, "id", 64);
  const name = text(formData, "name", 120);
  const slug = slugify(text(formData, "slug", 120) || name);
  const description = text(formData, "description", 2000);
  const category = text(formData, "category", 40) || "Otros";
  const price = Number(text(formData, "price", 20).replace(/[^\d]/g, ""));
  const madeToOrder = formData.get("made_to_order") === "on";
  const stock = madeToOrder ? 0 : Math.max(0, Math.trunc(Number(text(formData, "stock", 10)) || 0));
  const ventureId = text(formData, "venture_id", 64) || null;

  if (!name) return { ok: false, message: "El nombre es obligatorio." };
  if (!slug) return { ok: false, message: "El nombre necesita al menos una letra o número." };
  if (!Number.isFinite(price) || price <= 0) return { ok: false, message: "El precio tiene que ser mayor a 0." };

  const row = {
    name,
    slug,
    description,
    category,
    price,
    currency: "COP",
    made_to_order: madeToOrder,
    stock,
    venture_id: ventureId,
    image_url: imageUrl(formData),
  };

  const { error } = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);
  if (error) return { ok: false, message: friendlyError(error.message) };

  refresh();
  redirect("/admin");
}

export async function deleteProduct(id: string): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: "No se pudo eliminar." };
  refresh();
  redirect("/admin");
}

export async function saveVenture(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();

  const id = text(formData, "id", 64);
  const name = text(formData, "name", 80);
  const slug = slugify(text(formData, "slug", 80) || name);
  const tagline = text(formData, "tagline", 160);
  const story = text(formData, "story", 5000);
  const instagram = text(formData, "instagram", 60).replace(/^@/, "") || null;
  const whatsappDigits = text(formData, "whatsapp", 20).replace(/\D/g, "");
  // Número colombiano de 10 dígitos sin indicativo → le agrega el 57.
  const whatsapp = whatsappDigits
    ? whatsappDigits.length === 10 && whatsappDigits.startsWith("3")
      ? `57${whatsappDigits}`
      : whatsappDigits
    : null;

  if (!name) return { ok: false, message: "El nombre es obligatorio." };
  if (!slug) return { ok: false, message: "El nombre necesita al menos una letra o número." };
  if (!tagline) return { ok: false, message: "Escribe una frase corta (tagline)." };
  if (!story) return { ok: false, message: "Escribe la historia del emprendimiento." };
  if (whatsapp && !/^\d{10,15}$/.test(whatsapp)) {
    return { ok: false, message: "El WhatsApp debe tener entre 10 y 15 dígitos." };
  }

  const row = {
    name,
    slug,
    tagline,
    story,
    instagram,
    whatsapp,
    image_url: imageUrl(formData),
    image_credit: text(formData, "image_credit", 80) || null,
  };

  const { error } = id
    ? await supabase.from("ventures").update(row).eq("id", id)
    : await supabase.from("ventures").insert(row);
  if (error) return { ok: false, message: friendlyError(error.message) };

  refresh();
  redirect("/admin");
}

export async function deleteVenture(id: string): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  // Sus productos no se borran: quedan sin emprendimiento (on delete set null).
  const { error } = await supabase.from("ventures").delete().eq("id", id);
  if (error) return { ok: false, message: "No se pudo eliminar." };
  refresh();
  redirect("/admin");
}
