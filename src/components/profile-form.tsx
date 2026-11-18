"use client";

import { useActionState } from "react";
import { updateDisplayName, type ProfileFormState } from "@/app/cuenta/actions";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateDisplayName,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-foreground-soft">
          Nombre visible
        </span>
        <input
          name="displayName"
          defaultValue={displayName}
          maxLength={60}
          required
          className="rounded-2xl border border-line bg-background px-4 py-3 text-base outline-none focus:border-primary"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
      {state && (
        <p
          role="status"
          className={`text-sm font-semibold sm:basis-full ${state.ok ? "text-primary" : "text-foreground"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
