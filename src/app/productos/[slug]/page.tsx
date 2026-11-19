import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { FavoriteButton } from "@/components/favorite-button";
import { formatPrice, getProductBySlug } from "@/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

export default function ProductoPage({ params }: Props) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link
        href="/productos"
        className="mb-6 inline-block text-sm font-bold text-foreground-soft hover:text-primary"
      >
        ← Volver a productos
      </Link>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </main>
  );
}

async function ProductDetail({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const availabilityBadge = product.made_to_order
    ? "Por pedido"
    : product.stock > 0
      ? `${product.stock} disponibles`
      : "Agotado";

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-primary-tint">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        ) : null}
        <span className="absolute left-3 top-3 rounded-full bg-yellow px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink">
          {availabilityBadge}
        </span>
        <FavoriteButton
          productId={product.id}
          productName={product.name}
          size="lg"
          className="absolute right-3 top-3"
        />
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-foreground-soft">
          {product.category}
        </span>
        <h1 className="font-display text-3xl font-extrabold text-balance">
          {product.name}
        </h1>
        <span className="font-display text-2xl font-extrabold text-primary">
          {formatPrice(product.price, product.currency)}
        </span>
        <p className="text-foreground-soft">{product.description}</p>
        <AddToCart product={product} />
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-8 sm:grid-cols-2">
      <div className="aspect-square w-full rounded-[24px] bg-surface" />
      <div className="flex flex-col gap-4">
        <div className="h-8 w-3/4 rounded bg-surface" />
        <div className="h-6 w-1/3 rounded bg-surface" />
        <div className="h-20 w-full rounded bg-surface" />
      </div>
    </div>
  );
}
