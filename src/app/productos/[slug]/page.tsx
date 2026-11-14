import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { formatPrice, getProductBySlug } from "@/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function ProductoPage({ params }: Props) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-24">
      <Link
        href="/productos"
        className="mb-8 inline-block font-mono text-xs uppercase tracking-widest text-foreground-soft hover:text-lime"
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

  const availability = product.made_to_order
    ? "Por pedido"
    : product.stock > 0
      ? `${product.stock} disponibles`
      : "Agotado";

  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface">
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
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-black text-balance">
          {product.name}
        </h1>
        <span className="font-mono text-2xl font-bold text-lime">
          {formatPrice(product.price, product.currency)}
        </span>
        <p className="text-foreground-soft">{product.description}</p>
        <span className="w-fit rounded-full border border-line px-3 py-1 font-mono text-xs uppercase tracking-wide text-foreground-soft">
          {availability}
        </span>
        <AddToCart product={product} />
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-10 sm:grid-cols-2">
      <div className="aspect-square w-full rounded-2xl border border-line bg-surface" />
      <div className="flex flex-col gap-4">
        <div className="h-8 w-3/4 rounded bg-surface" />
        <div className="h-6 w-1/3 rounded bg-surface" />
        <div className="h-20 w-full rounded bg-surface" />
      </div>
    </div>
  );
}
