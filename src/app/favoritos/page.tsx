import { Suspense } from "react";
import { requireProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FavoritesGrid } from "@/components/favorites-grid";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import type { Product } from "@/lib/products";

export const metadata = {
  title: "Favoritos",
  robots: { index: false },
};

export default function FavoritosPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <h1 className="animate-rise mb-8 text-5xl font-extrabold tracking-tight sm:text-6xl">
        Tus <span className="text-primary">favoritos</span>
      </h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <FavoriteProducts />
      </Suspense>
    </main>
  );
}

async function FavoriteProducts() {
  await requireProfile("/favoritos");
  const supabase = await createSupabaseServerClient();

  // RLS ya limita a los favoritos del usuario logueado.
  const { data, error } = await supabase
    .from("favorites")
    .select("products(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const products = (data ?? [])
    .map((row) => row.products as unknown as Product | null)
    .filter((p): p is Product => p !== null);

  return <FavoritesGrid products={products} />;
}
