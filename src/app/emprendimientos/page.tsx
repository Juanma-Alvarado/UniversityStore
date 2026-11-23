import { Suspense } from "react";
import { VentureCard, VentureGridSkeleton } from "@/components/venture-card";
import { getVentures } from "@/lib/ventures";

export const metadata = {
  title: "Emprendimientos",
  description: "Conoce a quienes hacen cada producto de la tienda.",
};

export default function EmprendimientosPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="font-display text-3xl font-extrabold">Emprendimientos</h1>
      <p className="mb-6 mt-2 max-w-md text-foreground-soft">
        Detrás de cada producto hay estudiantes armando su propio proyecto. Conoce
        quiénes son y cómo trabajan.
      </p>
      <Suspense fallback={<VentureGridSkeleton />}>
        <VentureList />
      </Suspense>
    </main>
  );
}

async function VentureList() {
  const ventures = await getVentures();

  if (ventures.length === 0) {
    return <p className="text-foreground-soft">Pronto vas a conocer aquí a los primeros emprendimientos.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {ventures.map((venture) => (
        <VentureCard key={venture.id} venture={venture} />
      ))}
    </div>
  );
}
