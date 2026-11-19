"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type FavoritesContextValue = {
  ids: ReadonlySet<string>;
  ready: boolean;
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const EMPTY: ReadonlySet<string> = new Set();

type Loaded = { userId: string; ids: ReadonlySet<string> } | null;

// Los favoritos viven en Supabase (tabla favorites, con RLS por usuario).
// Acá se cachea el set de ids para pintar los corazones sin pedirlo por card.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const userId = user?.id ?? null;
  const [loaded, setLoaded] = useState<Loaded>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    getSupabaseBrowserClient()
      .from("favorites")
      .select("product_id")
      .then(({ data }) => {
        if (cancelled) return;
        setLoaded({ userId, ids: new Set((data ?? []).map((row) => row.product_id as string)) });
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Si cambia la sesión, los favoritos del usuario anterior dejan de valer.
  const current = userId && loaded?.userId === userId ? loaded : null;
  const ids = current?.ids ?? EMPTY;
  const ready = authReady && (!userId || current !== null);

  const toggle = useCallback(
    async (productId: string) => {
      if (!userId || loaded?.userId !== userId) return;
      const wasFavorite = loaded.ids.has(productId);

      // Optimista: el corazón cambia al toque y se revierte si falla.
      const apply = (add: boolean) =>
        setLoaded((prev) => {
          if (!prev || prev.userId !== userId) return prev;
          const next = new Set(prev.ids);
          if (add) next.add(productId);
          else next.delete(productId);
          return { userId, ids: next };
        });
      apply(!wasFavorite);

      const favorites = getSupabaseBrowserClient().from("favorites");
      const { error } = wasFavorite
        ? await favorites.delete().eq("user_id", userId).eq("product_id", productId)
        : await favorites.upsert(
            { user_id: userId, product_id: productId },
            { ignoreDuplicates: true },
          );

      if (error) apply(wasFavorite);
    },
    [userId, loaded],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ ids, ready, isFavorite: (id) => ids.has(id), toggle }),
    [ids, ready, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return ctx;
}
