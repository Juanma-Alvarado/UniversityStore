import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteVenture } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { VentureForm } from "@/components/admin/venture-form";
import { requireAdmin } from "@/lib/admin";
import { getVentureById } from "@/lib/ventures";

type Props = { params: Promise<{ id: string }> };

export default function AdminVenturePage({ params }: Props) {
  return (
    <>
      <Link href="/admin" className="mb-6 inline-block text-sm font-bold text-foreground-soft hover:text-primary">
        ← Panel
      </Link>
      <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-[28px] bg-surface" />}>
        <Editor params={params} />
      </Suspense>
    </>
  );
}

const UUID = /^[0-9a-f-]{36}$/i;

async function Editor({ params }: Props) {
  const { id } = await params;
  await requireAdmin(`/admin/emprendimientos/${id}`);

  const isNew = id === "nuevo";
  const venture = isNew || !UUID.test(id) ? null : await getVentureById(id);
  if (!isNew && !venture) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="page-title">
        {isNew ? "Nuevo" : "Editar"} <span className="text-primary">emprendimiento</span>
      </h1>
      {venture && (
        <Link
          href={`/emprendimientos/${venture.slug}`}
          className="w-fit text-sm font-bold text-secondary hover:underline"
        >
          Ver en la tienda →
        </Link>
      )}
      <VentureForm venture={venture} />
      {venture && (
        <DeleteButton
          label="Eliminar emprendimiento"
          warning={`¿Eliminar "${venture.name}"? Sus productos NO se borran: quedan como productos de la tienda, sin emprendimiento. No se puede deshacer.`}
          onDelete={deleteVenture.bind(null, venture.id)}
        />
      )}
    </div>
  );
}
