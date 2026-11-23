import { cache } from "react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/products";

export type Venture = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  story: string;
  image_url: string | null;
  image_credit: string | null;
  image_credit_url: string | null;
  instagram: string | null;
  whatsapp: string | null;
  created_at: string;
};

export async function getVentures(): Promise<Venture[]> {
  const { data, error } = await supabase
    .from("ventures")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export const getVentureBySlug = cache(async (slug: string): Promise<Venture | null> => {
  const { data, error } = await supabase
    .from("ventures")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
});

export async function getVentureById(id: string): Promise<Venture | null> {
  const { data, error } = await supabase
    .from("ventures")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getVentureProducts(ventureId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("venture_id", ventureId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** La historia se guarda como texto plano con párrafos separados por una línea en blanco. */
export function storyParagraphs(story: string): string[] {
  return story
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Link al perfil de Unsplash con los parámetros de referencia que piden sus guías. */
export function creditUrl(url: string): string {
  if (!url.includes("unsplash.com")) return url;
  return `${url}?utm_source=universitystore&utm_medium=referral`;
}
