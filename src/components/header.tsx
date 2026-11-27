"use client";

import Link from "next/link";
import { AccountButton } from "@/components/account-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
          <span className="text-primary">University</span>Store
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/productos"
            className="hidden rounded-full px-3 py-2 text-sm font-bold text-foreground-soft transition-colors hover:text-foreground sm:inline-block"
          >
            Productos
          </Link>
          <Link
            href="/emprendimientos"
            className="hidden rounded-full px-3 py-2 text-sm font-bold text-foreground-soft transition-colors hover:text-foreground sm:inline-block"
          >
            Emprendimientos
          </Link>
          <Link
            href="/carrito"
            aria-label={count > 0 ? `Carrito, ${count} productos` : "Carrito"}
            className="relative flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-extrabold text-white shadow-glow transition-transform hover:scale-105"
          >
            <span aria-hidden>🛒</span>
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow px-1 text-xs font-extrabold text-ink">
                {count}
              </span>
            )}
          </Link>
          <AccountButton />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
