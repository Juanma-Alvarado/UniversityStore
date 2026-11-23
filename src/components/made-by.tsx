import Image from "next/image";
import Link from "next/link";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getVentureById } from "@/lib/ventures";

/** "Hecho por…" en la ficha del producto: lleva a la historia del emprendimiento. */
export async function MadeBy({ ventureId, productName }: { ventureId: string; productName: string }) {
  const venture = await getVentureById(ventureId);
  if (!venture) return null;

  return (
    <>
      {venture.whatsapp && (
        <WhatsAppButton
          phone={venture.whatsapp}
          message={`Hola, vi "${productName}" en UniversityStore y quiero hacer un pedido.`}
          className="w-full"
        />
      )}
      <Link
        href={`/emprendimientos/${venture.slug}`}
        className="group mt-2 flex items-center gap-3.5 rounded-[20px] border border-line bg-surface p-3 transition-colors hover:border-primary"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-primary-tint">
          {venture.image_url ? (
            <Image src={venture.image_url} alt="" fill sizes="64px" className="object-cover" />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wide text-foreground-soft">
            Hecho por
          </span>
          <span className="font-display text-lg font-extrabold leading-tight">{venture.name}</span>
          <span className="text-sm font-bold text-primary">
            Conoce su historia <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </Link>
    </>
  );
}

export function MadeBySkeleton() {
  return <div className="mt-2 h-[88px] animate-pulse rounded-[20px] bg-surface" />;
}
