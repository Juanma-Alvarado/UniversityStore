import { Suspense } from "react";
import { VentureCard, VentureGridSkeleton } from "@/components/venture-card";
import { getVentures } from "@/lib/ventures";

export const metadata = {
  title: "Emprendimientos",
  description: "Conoce a quienes hacen cada producto de la tienda.",
};

export default function EmprendimientosPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-10 sm:pt-14">
      <h1 className="animate-rise text-5xl font-extrabold tracking-tight sm:text-6xl">
        Los <span className="text-primary">emprendimientos</span>
      </h1>
      <p className="mb-10 mt-4 max-w-md text-lg text-foreground-soft">
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {ventures.map((venture, i) => (
        <VentureCard key={venture.id} venture={venture} index={i} />
      ))}
    </div>
  );
}
