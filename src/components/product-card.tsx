import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const availability = product.made_to_order
    ? "Por pedido"
    : product.stock > 0
      ? `${product.stock} disponibles`
      : "Agotado";

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-background">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-bold text-balance">
          {product.name}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-foreground-soft">
          {product.description}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono text-base font-bold text-lime">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
            {availability}
          </span>
        </div>
      </div>
    </Link>
  );
}
