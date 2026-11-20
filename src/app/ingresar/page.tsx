import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Ingresar",
  description: "Entra a tu cuenta o crea una nueva.",
  robots: { index: false },
};

export default function IngresarPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[28px] bg-surface" />}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
