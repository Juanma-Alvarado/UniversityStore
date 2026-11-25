import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

// Cliente por request que lee/escribe la sesión en cookies.
// Nunca compartirlo entre requests.
export async function createSupabaseServerClient() {
  // La sesión de Supabase usa Date.now() para ver si el token venció: con Cache
  // Components eso solo se permite cuando el render ya es por request.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Los Server Components no pueden escribir cookies; el proxy
            // ya se encarga de refrescar la sesión en cada request.
          }
        },
      },
    },
  );
}
