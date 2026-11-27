import { Suspense } from "react";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata = {
  title: "Mi cuenta",
  robots: { index: false },
};

export default function CuentaPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="page-title mb-8">
        Mi <span className="text-primary">cuenta</span>
      </h1>
      <Suspense fallback={<div className="h-56 animate-pulse rounded-[28px] bg-surface" />}>
        <AccountDetails />
      </Suspense>
    </main>
  );
}

async function AccountDetails() {
  const profile = await requireProfile("/cuenta");
  const memberSince = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(new Date(profile.createdAt));
  const initial = (profile.displayName || profile.email).charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <section className="relative flex items-center gap-4 overflow-hidden rounded-[28px] bg-primary p-6 text-white shadow-glow">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-yellow font-display text-3xl font-extrabold text-ink">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-2xl font-extrabold">
            {profile.displayName || "Sin nombre"}
          </p>
          <p className="truncate text-sm text-white/90">{profile.email}</p>
          <p className="text-xs text-white/75">Miembro desde {memberSince}</p>
        </div>
      </section>

      <Link
        href="/pedidos"
        className="panel flex items-center justify-between rounded-[28px] p-6 transition-transform hover:-translate-y-0.5"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-tint text-xl text-primary">
            ▤
          </span>
          <span className="font-display text-lg font-bold">Tus pedidos</span>
        </span>
        <span className="text-xl font-bold text-foreground-soft">→</span>
      </Link>

      <Link
        href="/favoritos"
        className="panel flex items-center justify-between rounded-[28px] p-6 transition-transform hover:-translate-y-0.5"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-tint text-xl text-primary">
            ♥
          </span>
          <span className="font-display text-lg font-bold">Tus favoritos</span>
        </span>
        <span className="text-xl font-bold text-foreground-soft">→</span>
      </Link>

      <section className="panel rounded-[28px] p-6">
        <h2 className="mb-4 font-display text-xl font-extrabold">Tus datos</h2>
        <ProfileForm displayName={profile.displayName} />
      </section>

      <SignOutButton />
    </div>
  );
}
