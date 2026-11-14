"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-base font-bold">
          UniversityStore
        </Link>
        <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-wide">
          <Link href="/productos" className="hover:text-lime">
            Productos
          </Link>
          <Link href="/carrito" className="flex items-center gap-2 hover:text-lime">
            Carrito
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime text-lime-ink">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
