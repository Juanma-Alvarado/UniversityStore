import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";
import { getVentures } from "@/lib/ventures";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, ventures] = await Promise.all([getProducts(), getVentures()]);

  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/productos`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...products.map((product) => ({
      url: `${SITE_URL}/productos/${product.slug}`,
      lastModified: product.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/emprendimientos`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...ventures.map((venture) => ({
      url: `${SITE_URL}/emprendimientos/${venture.slug}`,
      lastModified: venture.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
