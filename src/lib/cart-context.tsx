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
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
  maxQuantity: number | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "universitystore-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage no existe en el server: hidratar acá evita que el HTML
    // del servidor (carrito vacío) no coincida con el primer render del cliente.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(stored));
      } catch {
        // ignora un carrito corrupto en localStorage
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // El carrito guardado es una foto vieja de cada producto: al cargar se
  // refresca precio, moneda, nombre, foto y stock desde la base, y se quitan
  // los productos que ya no existen. (El cobro siempre usa precios de la base.)
  useEffect(() => {
    if (!hydrated) return;
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]").map(
      (i: CartItem) => i.productId,
    );
    if (ids.length === 0) return;

    getSupabaseBrowserClient()
      .from("products")
      .select("id, slug, name, price, currency, image_url, stock, made_to_order")
      .in("id", ids)
      .then(({ data, error }) => {
        if (error || !data) return;
        const fresh = new Map(data.map((p) => [p.id, p]));
        setItems((current) =>
          current.flatMap((item) => {
            const p = fresh.get(item.productId);
            if (!p) return [];
            const maxQuantity = p.made_to_order ? null : p.stock;
            if (maxQuantity === 0) return [];
            return [
              {
                ...item,
                slug: p.slug,
                name: p.name,
                price: Number(p.price),
                currency: p.currency,
                imageUrl: p.image_url,
                maxQuantity,
                quantity: maxQuantity != null ? Math.min(item.quantity, maxQuantity) : item.quantity,
              },
            ];
          }),
        );
      });
  }, [hydrated]);

  const clamp = useCallback((quantity: number, max: number | null) => {
    const value = Math.max(1, quantity);
    return max != null ? Math.min(value, max) : value;
  }, []);

  const addItem = useCallback<CartContextValue["addItem"]>(
    (item, quantity) => {
      setItems((current) => {
        const existing = current.find((i) => i.productId === item.productId);
        if (existing) {
          return current.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: clamp(i.quantity + quantity, i.maxQuantity) }
              : i,
          );
        }
        return [
          ...current,
          { ...item, quantity: clamp(quantity, item.maxQuantity) },
        ];
      });
    },
    [clamp],
  );

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(
    (productId, quantity) => {
      setItems((current) =>
        current.map((i) =>
          i.productId === productId
            ? { ...i, quantity: clamp(quantity, i.maxQuantity) }
            : i,
        ),
      );
    },
    [clamp],
  );

  const removeItem = useCallback<CartContextValue["removeItem"]>(
    (productId) => {
      setItems((current) => current.filter((i) => i.productId !== productId));
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, addItem, setQuantity, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
