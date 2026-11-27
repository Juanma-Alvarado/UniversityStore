import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { WhatsAppButton } from "@/components/whatsapp-button";
import {
  creditUrl,
  getVentureBySlug,
  getVentureProducts,
  storyParagraphs,
  type Venture,
} from "@/lib/ventures";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venture = await getVentureBySlug(slug);

  if (!venture) return {};

  return {
    title: venture.name,
    description: venture.tagline,
    openGraph: {
      title: venture.name,
      description: venture.tagline,
      images: venture.image_url ? [venture.image_url] : undefined,
    },
  };
}

export default function EmprendimientoPage({ params }: Props) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <Link
        href="/emprendimientos"
        className="mb-6 inline-block text-sm font-bold text-foreground-soft hover:text-primary"
      >
        ← Emprendimientos
      </Link>
      <Suspense fallback={<VentureSkeleton />}>
        <VentureDetail params={params} />
      </Suspense>
    </main>
  );
}

async function VentureDetail({ params }: Props) {
  const { slug } = await params;
  const venture = await getVentureBySlug(slug);

  if (!venture) notFound();

  return (
    <>
      <VentureHero venture={venture} />

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[1fr_16rem]">
        <section>
          <h2 className="mb-4 font-display text-2xl font-extrabold">
            Detrás de {venture.name}
          </h2>
          <div className="flex max-w-prose flex-col gap-4 leading-relaxed text-foreground-soft">
            {storyParagraphs(venture.story).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>

        {(venture.whatsapp || venture.instagram) && (
          <aside className="flex flex-col gap-4 self-start rounded-[22px] bg-primary-tint p-5">
            {venture.whatsapp && (
              <WhatsAppButton
                phone={venture.whatsapp}
                message={`Hola, vi ${venture.name} en UniversityStore y quiero hacer un pedido.`}
              />
            )}
            {venture.instagram && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-foreground-soft">
                  Síguelos
                </span>
                <a
                  href={`https://instagram.com/${venture.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-display text-lg font-extrabold text-primary"
                >
                  @{venture.instagram}
                </a>
              </div>
            )}
          </aside>
        )}
      </div>

      <section className="mt-12">
        <h2 className="mb-6 text-3xl font-extrabold sm:text-4xl">
          Sus <span className="text-primary">productos</span>
        </h2>
        <Suspense fallback={<ProductGridSkeleton />}>
          <VentureProducts ventureId={venture.id} />
        </Suspense>
      </section>
    </>
  );
}

function VentureHero({ venture }: { venture: Venture }) {
  return (
    <section>
      <div className="animate-rise relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] bg-primary sm:aspect-[21/9]">
        {venture.image_url ? (
          <Image
            src={venture.image_url}
            alt={`Foto de ${venture.name}`}
            fill
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="object-cover"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-6 sm:p-10">
          <span className="rounded-full bg-yellow px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink">
            Emprendimiento universitario
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-6xl">
            {venture.name}
          </h1>
          <p className="max-w-md text-sm text-white/90 sm:text-base">{venture.tagline}</p>
        </div>
      </div>
      {venture.image_credit && (
        <p className="mt-2 text-right text-xs text-foreground-soft">
          Foto:{" "}
          {venture.image_credit_url ? (
            <a
              href={creditUrl(venture.image_credit_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              {venture.image_credit}
            </a>
          ) : (
            venture.image_credit
          )}
          {venture.image_url?.includes("unsplash.com") && (
            <>
              {" "}en{" "}
              <a
                href="https://unsplash.com/?utm_source=universitystore&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Unsplash
              </a>
            </>
          )}
        </p>
      )}
    </section>
  );
}

async function VentureProducts({ ventureId }: { ventureId: string }) {
  const products = await getVentureProducts(ventureId);

  if (products.length === 0) {
    return <p className="text-foreground-soft">Todavía no hay productos de este emprendimiento.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}

function VentureSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] w-full rounded-[28px] bg-surface sm:aspect-[21/9]" />
      <div className="mt-10 flex flex-col gap-3">
        <div className="h-7 w-1/3 rounded bg-surface" />
        <div className="h-20 w-full max-w-prose rounded bg-surface" />
      </div>
    </div>
  );
}
