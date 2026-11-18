"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, ready: false });

// Estado de sesión para la UI del cliente (header, botones). No sirve para
// autorizar nada: eso lo verifica el server contra Supabase en cada acción.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthContextValue>({ user: null, ready: false });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, ready: true });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function displayNameOf(user: User) {
  const name = user.user_metadata?.display_name;
  return typeof name === "string" && name.trim() ? name.trim() : (user.email ?? "");
}
