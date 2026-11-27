import type { ReactNode } from "react";

/** Etiqueta + control con el estilo de los formularios del panel. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-foreground-soft">{label}</span>
      {children}
      {hint && <span className="text-xs text-foreground-soft">{hint}</span>}
    </label>
  );
}

export function SubmitRow({ pending, message, ok }: { pending: boolean; message?: string; ok?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-white shadow-glow transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
      {message && (
        <p role="status" className={`text-sm font-semibold ${ok ? "text-primary" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
