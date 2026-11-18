"use client";

import Link from "next/link";
import { displayNameOf, useAuth } from "@/lib/auth-context";

const BOX = "flex h-11 w-11 items-center justify-center rounded-2xl border border-line";

export function AccountButton() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <span className={`${BOX} bg-surface`} aria-hidden />;
  }

  if (!user) {
    return (
      <Link href="/ingresar" aria-label="Ingresar" className={`${BOX} bg-surface text-lg`}>
        👤
      </Link>
    );
  }

  const initial = displayNameOf(user).charAt(0).toUpperCase() || "?";

  return (
    <Link
      href="/cuenta"
      aria-label="Mi cuenta"
      className={`${BOX} bg-yellow font-display text-lg font-extrabold text-ink`}
    >
      {initial}
    </Link>
  );
}
