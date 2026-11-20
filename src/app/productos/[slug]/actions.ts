"use server";

import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReviewFormState = { ok: boolean; message: string } | null;

export async function saveReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tienes que ingresar para dejar una reseña." };

  const productId = String(formData.get("productId") ?? "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 1000);

  if (!productId) return { ok: false, message: "Producto inválido." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, message: "Elige de 1 a 5 estrellas." };
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_id,user_id" },
  );
  if (error) return { ok: false, message: "No se pudo guardar. Intenta de nuevo." };

  refresh();
  return { ok: true, message: "¡Gracias por tu reseña!" };
}

export async function deleteReview(productId: string): Promise<ReviewFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tienes que ingresar." };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", user.id);
  if (error) return { ok: false, message: "No se pudo borrar. Intenta de nuevo." };

  refresh();
  return { ok: true, message: "Reseña borrada." };
}
