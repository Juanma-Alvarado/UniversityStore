import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { QuickAddButton } from "@/components/quick-add-button";
import { formatPrice, type Product } from "@/lib/products";

/**
 * `index` activa la entrada escalonada (home, emprendimientos). En /productos no
 * se pasa: ahí las cards ya se animan con View Transitions al filtrar.
 */
export function ProductCard({ product, index }: { product: Product; index?: number }) {
  const availabilityBadge = product.made_to_order
    ? "Por pedido"
    : product.stock > 0
      ? null
      : "Agotado";

  return (
    <Link
      href={`/productos/${product.slug}`}
      className={`card-glow flex flex-col overflow-hidden rounded-[22px] bg-surface shadow-[0_6px_20px_rgba(24,21,17,0.08)] ${
        index !== undefined ? "animate-rise" : ""
      }`}
      style={index !== undefined ? { animationDelay: `${index * 90}ms` } : undefined}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-primary-tint">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover"
          />
        ) : null}
        {availabilityBadge && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-yellow px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-ink">
            {availabilityBadge}
          </span>
        )}
        <FavoriteButton
          productId={product.id}
          productName={product.name}
          className="absolute right-2.5 top-2.5"
        />
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-primary px-3 py-1.5 text-sm font-extrabold text-white shadow-glow">
          {formatPrice(product.price, product.currency)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-secondary">
          {product.category}
        </span>
        <div className="flex flex-1 items-end justify-between gap-2">
          <h3 className="font-display text-[15px] font-extrabold leading-tight text-balance">
            {product.name}
          </h3>
          <QuickAddButton product={product} />
        </div>
      </div>
    </Link>
  );
}
