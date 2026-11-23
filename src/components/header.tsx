"use client";

import Link from "next/link";
import { AccountButton } from "@/components/account-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-extrabold text-primary">
          UniversityStore
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/productos"
            className="hidden rounded-full px-4 py-2 text-sm font-bold text-foreground-soft hover:text-foreground sm:inline-block"
          >
            Productos
          </Link>
          <Link
            href="/emprendimientos"
            className="hidden rounded-full px-4 py-2 text-sm font-bold text-foreground-soft hover:text-foreground sm:inline-block"
          >
            Emprendimientos
          </Link>
          <Link
            href="/carrito"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface text-lg"
          >
            🛒
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
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
