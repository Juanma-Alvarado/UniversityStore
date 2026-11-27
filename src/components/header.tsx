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
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px]"
            >
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2.5 3.5h2.6l2.3 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2l1.6-6.8H6.1" />
            </svg>
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
