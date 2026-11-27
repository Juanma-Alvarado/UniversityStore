import "server-only";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Puerta del panel /admin. Sin sesión manda a ingresar; con sesión pero sin
 * ser admin responde 404 (no revela que el panel existe). La base igual
 * rechaza cualquier escritura de quien no sea admin (RLS con is_admin()).
 */
export async function requireAdmin(nextPath = "/admin") {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/ingresar?next=${encodeURIComponent(nextPath)}`);

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  return { supabase, user };
}

/** Para mostrar u ocultar el acceso al panel (p. ej. en /cuenta) sin redirigir. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("is_admin");
  return Boolean(data);
}

/** "Zuecos de Gamuza" → "zuecos-de-gamuza" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
