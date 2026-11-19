"use client";

import type { MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";

type Props = {
  productId: string;
  productName: string;
  size?: "sm" | "lg";
  className?: string;
};

const SIZES = {
  sm: "h-9 w-9 [&_svg]:h-[18px] [&_svg]:w-[18px]",
  lg: "h-11 w-11 [&_svg]:h-[22px] [&_svg]:w-[22px]",
};

export function FavoriteButton({ productId, productName, size = "sm", className = "" }: Props) {
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const router = useRouter();
  const pathname = usePathname();
  const active = isFavorite(productId);

  function handleClick(e: MouseEvent) {
    // Vive dentro del <Link> de la card: no tiene que navegar al producto.
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/ingresar?next=${encodeURIComponent(pathname)}`);
      return;
    }
    void toggle(productId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={
        active ? `Quitar ${productName} de favoritos` : `Guardar ${productName} en favoritos`
      }
      className={`flex items-center justify-center rounded-full bg-surface/95 shadow-[0_2px_8px_rgba(24,21,17,0.15)] backdrop-blur transition-transform hover:scale-110 active:scale-95 ${SIZES[size]} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={active ? "fill-primary stroke-primary" : "fill-none stroke-foreground"}
        strokeWidth={2.2}
        strokeLinejoin="round"
      >
        <path d="M12 20.5s-7.5-4.6-7.5-10.4A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.5 2.8c0 5.8-7.5 10.4-7.5 10.4Z" />
      </svg>
    </button>
  );
}
