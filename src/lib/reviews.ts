import { supabase } from "@/lib/supabase";

export type Review = {
  id: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewSummary = {
  count: number;
  average: number;
};

type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string } | null;
};

export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, rating, comment, created_at, updated_at, profiles(display_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .returns<ReviewRow[]>();

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    authorName: row.profiles?.display_name || "Anónimo",
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function summarize(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) return { count: 0, average: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { count: reviews.length, average: total / reviews.length };
}
