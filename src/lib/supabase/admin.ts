import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

// Cliente con la secret key: saltea RLS. Solo para código de server que no
// actúa en nombre de un usuario (p. ej. el webhook de Stripe). Nunca
// importarlo desde un componente cliente.
export function getSupabaseAdmin(): SupabaseClient {
  if (!process.env.SUPABASE_SECRET_KEY) {
    throw new Error(
      "Falta SUPABASE_SECRET_KEY en .env.local — está en Supabase → Project Settings → API Keys",
    );
  }
  admin ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return admin;
}
