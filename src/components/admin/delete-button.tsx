"use client";

import { useState, useTransition } from "react";
import type { AdminFormState } from "@/app/admin/actions";

/** Eliminar en dos pasos (sin ventanas emergentes): primero pide confirmar. */
export function DeleteButton({
  label,
  warning,
  onDelete,
}: {
  label: string;
  warning: string;
  onDelete: () => Promise<AdminFormState>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-foreground-soft transition-colors hover:border-red-500 hover:text-red-600"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-red-500/40 bg-red-500/5 p-4">
      <p className="text-sm font-semibold">{warning}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await onDelete();
              if (result && !result.ok) setError(result.message);
            })
          }
          className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "Eliminando…" : "Sí, eliminar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold"
        >
          Cancelar
        </button>
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
