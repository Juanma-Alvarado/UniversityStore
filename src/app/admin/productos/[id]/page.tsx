import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/admin";
import { getProducts } from "@/lib/products";
import { getVentures } from "@/lib/ventures";

type Props = { params: Promise<{ id: string }> };

export default function AdminProductPage({ params }: Props) {
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

async function Editor({ params }: Props) {
  const { id } = await params;
  await requireAdmin(`/admin/productos/${id}`);
  const [products, ventures] = await Promise.all([getProducts(), getVentures()]);

  const isNew = id === "nuevo";
  const product = isNew ? null : (products.find((p) => p.id === id) ?? null);
  if (!isNew && !product) notFound();

  const categories = Array.from(new Set(products.map((p) => p.category))).sort();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="page-title">
        {isNew ? (
          <>
            Nuevo <span className="text-primary">producto</span>
          </>
        ) : (
          <>
            Editar <span className="text-primary">producto</span>
          </>
        )}
      </h1>
      {product && (
        <Link href={`/productos/${product.slug}`} className="w-fit text-sm font-bold text-secondary hover:underline">
          Ver en la tienda →
        </Link>
      )}
      <ProductForm
        product={product}
        ventures={ventures.map((v) => ({ id: v.id, name: v.name }))}
        categories={categories}
      />
      {product && (
        <DeleteButton
          label="Eliminar producto"
          warning={`¿Eliminar "${product.name}"? También se borran sus favoritos y reseñas. Los pedidos ya hechos conservan el nombre y el precio. No se puede deshacer.`}
          onDelete={deleteProduct.bind(null, product.id)}
        />
      )}
    </div>
  );
}
