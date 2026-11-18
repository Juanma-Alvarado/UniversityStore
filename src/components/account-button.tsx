"use client";

import Link from "next/link";
import { displayNameOf, useAuth } from "@/lib/auth-context";

export function AccountButton() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <span className="h-11 w-11 animate-pulse rounded-2xl bg-surface" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/ingresar"
        className="rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-press"
      >
        Ingresar
      </Link>
    );
  }

  const initial = displayNameOf(user).charAt(0).toUpperCase() || "?";

  return (
    <Link
      href="/cuenta"
      aria-label="Mi cuenta"
      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow font-display text-lg font-extrabold text-ink"
    >
      {initial}
    </Link>
  );
}
