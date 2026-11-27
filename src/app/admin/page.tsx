import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatPrice, getProducts } from "@/lib/products";
import { getVentures } from "@/lib/ventures";

export default function AdminPage() {
  return (
    <>
      <h1 className="page-title mb-2">
        Panel de <span className="text-primary">administración</span>
      </h1>
      <p className="mb-10 text-foreground-soft">Carga y edita los emprendimientos y productos de la tienda.</p>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[28px] bg-surface" />}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  await requireAdmin("/admin");
  const [products, ventures] = await Promise.all([getProducts(), getVentures()]);
  const ventureName = new Map(ventures.map((v) => [v.id, v.name]));

  return (
    <div className="flex flex-col gap-12">
      <section>
        <SectionHeader title="Productos" count={products.length} href="/admin/productos/nuevo" cta="Nuevo producto" />
        <ul className="flex flex-col gap-2.5">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/productos/${p.id}`}
                className="panel flex items-center gap-4 rounded-[20px] p-3 transition-colors hover:border-primary"
              >
                <Thumb src={p.image_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-extrabold">{p.name}</p>
                  <p className="truncate text-sm text-foreground-soft">
                    {p.category} · {p.venture_id ? ventureName.get(p.venture_id) : "Producto propio"}
                  </p>
                </div>
                <span className="font-display font-extrabold text-primary">{formatPrice(p.price, p.currency)}</span>
                <span aria-hidden className="text-foreground-soft">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader
          title="Emprendimientos"
          count={ventures.length}
          href="/admin/emprendimientos/nuevo"
          cta="Nuevo emprendimiento"
        />
        <ul className="flex flex-col gap-2.5">
          {ventures.map((v) => (
            <li key={v.id}>
              <Link
                href={`/admin/emprendimientos/${v.id}`}
                className="panel flex items-center gap-4 rounded-[20px] p-3 transition-colors hover:border-primary"
              >
                <Thumb src={v.image_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-extrabold">{v.name}</p>
                  <p className="truncate text-sm text-foreground-soft">{v.tagline}</p>
                </div>
                <span
                  className={`hidden rounded-full px-3 py-1 text-xs font-bold sm:inline ${
                    v.whatsapp ? "bg-primary-tint text-primary" : "bg-background text-foreground-soft"
                  }`}
                >
                  {v.whatsapp ? "WhatsApp ✓" : "Sin WhatsApp"}
                </span>
                <span aria-hidden className="text-foreground-soft">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SectionHeader({ title, count, href, cta }: { title: string; count: number; href: string; cta: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h2 className="text-3xl font-extrabold">
        {title} <span className="text-foreground-soft">({count})</span>
      </h2>
      <Link
        href={href}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-glow transition-transform hover:scale-[1.03]"
      >
        + {cta}
      </Link>
    </div>
  );
}

function Thumb({ src }: { src: string | null }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-primary-tint">
      {src ? <Image src={src} alt="" fill sizes="56px" className="object-cover" /> : null}
    </div>
  );
}
