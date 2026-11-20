"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileFormState = { ok: boolean; message: string } | null;

export async function updateDisplayName(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar?next=/cuenta");

  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 60);
  if (!displayName) return { ok: false, message: "El nombre no puede quedar vacío." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);
  if (error) return { ok: false, message: "No se pudo guardar. Intenta de nuevo." };

  // Mantiene el metadata en sync para que el header muestre la inicial correcta.
  await supabase.auth.updateUser({ data: { display_name: displayName } });

  refresh();
  return { ok: true, message: "¡Listo, guardado!" };
}
