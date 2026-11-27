"use client";

import { useActionState } from "react";
import { saveVenture, type AdminFormState } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/image-upload";
import { Field, SubmitRow } from "@/components/admin/form-bits";
import type { Venture } from "@/lib/ventures";

export function VentureForm({ venture }: { venture: Venture | null }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveVenture, null);

  return (
    <form action={action} className="panel flex flex-col gap-5 rounded-[28px] p-6 sm:p-8">
      {venture && <input type="hidden" name="id" value={venture.id} />}

      <ImageUpload folder="ventures" initialUrl={venture?.image_url ?? null} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre">
          <input name="name" required maxLength={80} defaultValue={venture?.name} className="field" />
        </Field>
        <Field label="WhatsApp" hint="Ej: 311 757 5086. Vacío = sin botón de WhatsApp.">
          <input
            name="whatsapp"
            inputMode="tel"
            maxLength={20}
            defaultValue={venture?.whatsapp ?? ""}
            className="field"
          />
        </Field>
        <Field label="Instagram" hint="Sin @">
          <input name="instagram" maxLength={60} defaultValue={venture?.instagram ?? ""} className="field" />
        </Field>
        <Field label="Crédito de la foto (opcional)">
          <input name="image_credit" maxLength={80} defaultValue={venture?.image_credit ?? ""} className="field" />
        </Field>
      </div>

      <Field label="Frase corta" hint="Aparece en las cards, debajo del nombre.">
        <input name="tagline" required maxLength={160} defaultValue={venture?.tagline} className="field" />
      </Field>

      <Field label="Historia" hint="Separa los párrafos con una línea en blanco.">
        <textarea
          name="story"
          required
          rows={8}
          maxLength={5000}
          defaultValue={venture?.story}
          className="field resize-y"
        />
      </Field>

      <details className="text-sm">
        <summary className="cursor-pointer font-bold text-foreground-soft">Dirección de la página (slug)</summary>
        <div className="mt-3">
          <Field label="Slug" hint="Se arma solo con el nombre. Cámbialo solo si sabes lo que haces: los links viejos dejan de funcionar.">
            <input name="slug" maxLength={80} defaultValue={venture?.slug} className="field" />
          </Field>
        </div>
      </details>

      <SubmitRow pending={pending} message={state?.message} ok={state?.ok} />
    </form>
  );
}
