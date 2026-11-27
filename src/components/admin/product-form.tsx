"use client";

import { useActionState, useState } from "react";
import { saveProduct, type AdminFormState } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/image-upload";
import { Field, SubmitRow } from "@/components/admin/form-bits";
import type { Product } from "@/lib/products";

type VentureOption = { id: string; name: string };

export function ProductForm({
  product,
  ventures,
  categories,
}: {
  product: Product | null;
  ventures: VentureOption[];
  categories: string[];
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveProduct, null);
  const [madeToOrder, setMadeToOrder] = useState(product?.made_to_order ?? true);

  return (
    <form action={action} className="panel flex flex-col gap-5 rounded-[28px] p-6 sm:p-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      <ImageUpload folder="products" initialUrl={product?.image_url ?? null} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre">
          <input name="name" required maxLength={120} defaultValue={product?.name} className="field" />
        </Field>
        <Field label="Precio (COP)" hint="Solo números, sin puntos: 50000">
          <input
            name="price"
            required
            inputMode="numeric"
            pattern="[0-9.]*"
            defaultValue={product ? String(Math.round(product.price)) : ""}
            className="field"
          />
        </Field>
        <Field label="Categoría" hint="Elige una existente o escribe una nueva">
          <input
            name="category"
            list="categories"
            maxLength={40}
            defaultValue={product?.category ?? ""}
            className="field"
          />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Emprendimiento">
          <select name="venture_id" defaultValue={product?.venture_id ?? ""} className="field">
            <option value="">Producto propio (tienda)</option>
            {ventures.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Descripción">
        <textarea
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={product?.description}
          className="field resize-y"
        />
      </Field>

      <div className="flex flex-wrap items-end gap-5">
        <label className="flex items-center gap-2.5 text-sm font-bold">
          <input
            type="checkbox"
            name="made_to_order"
            checked={madeToOrder}
            onChange={(e) => setMadeToOrder(e.target.checked)}
            className="h-5 w-5 accent-[var(--primary)]"
          />
          Se hace por pedido
        </label>
        {!madeToOrder && (
          <Field label="Unidades disponibles">
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={product?.stock ?? 0}
              className="field w-36"
            />
          </Field>
        )}
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer font-bold text-foreground-soft">Dirección de la página (slug)</summary>
        <div className="mt-3">
          <Field label="Slug" hint="Se arma solo con el nombre. Cámbialo solo si sabes lo que haces: los links viejos dejan de funcionar.">
            <input name="slug" maxLength={120} defaultValue={product?.slug} className="field" />
          </Field>
        </div>
      </details>

      <SubmitRow pending={pending} message={state?.message} ok={state?.ok} />
    </form>
  );
}
