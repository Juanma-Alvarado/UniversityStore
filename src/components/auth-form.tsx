"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/safe-next";

type Mode = "login" | "signup";

const ERRORS: Record<string, string> = {
  "Invalid login credentials": "Email o contraseña incorrectos.",
  "Email not confirmed": "Todavía no confirmaste tu correo. Revisa tu bandeja de entrada.",
  "User already registered": "Ya existe una cuenta con ese email.",
};

function translate(message: string) {
  if (ERRORS[message]) return ERRORS[message];
  if (message.toLowerCase().includes("password")) {
    return "La contraseña tiene que tener al menos 6 caracteres.";
  }
  if (message.toLowerCase().includes("rate limit")) {
    return "Demasiados intentos. Espera unos minutos e intenta de nuevo.";
  }
  return message;
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "link"
      ? "El enlace de confirmación venció o ya se usó. Intenta ingresar de nuevo."
      : null,
  );
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const displayName = String(form.get("displayName") ?? "").trim();
    const supabase = getSupabaseBrowserClient();

    setLoading(true);
    setError(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translate(error.message));
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(translate(error.message));
      setLoading(false);
      return;
    }
    if (data.session) {
      // Confirmación por mail desactivada en Supabase: ya queda logueado.
      router.replace(next);
      router.refresh();
      return;
    }
    setSentTo(email);
    setLoading(false);
  }

  if (sentTo) {
    return (
      <div className="panel flex flex-col items-start gap-3 rounded-[28px] p-7">
        <span className="text-4xl">📬</span>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Revisa tu correo</h1>
        <p className="text-foreground-soft">
          Te enviamos un enlace a <strong className="text-foreground">{sentTo}</strong> para
          confirmar tu cuenta. Ábrelo desde este mismo navegador.
        </p>
      </div>
    );
  }

  const isLogin = mode === "login";

  return (
    <div className="panel rounded-[28px] p-7">
      <div className="mb-6 flex gap-1 rounded-full bg-background p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
              mode === m ? "bg-primary text-white" : "text-foreground-soft"
            }`}
          >
            {m === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <h1 className="mb-1 font-display text-4xl font-extrabold tracking-tight">
        {isLogin ? "¡Hola de nuevo!" : "Únete"}
      </h1>
      <p className="mb-6 text-sm text-foreground-soft">
        {isLogin
          ? "Entra para ver tus favoritos y tus pedidos."
          : "Guarda favoritos, deja reseñas y sigue tus pedidos."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {!isLogin && (
          <Field label="Nombre" name="displayName" autoComplete="name" required />
        )}
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={6}
          required
        />

        {error && (
          <p role="alert" className="rounded-2xl bg-primary-tint px-4 py-3 text-sm font-semibold">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-press disabled:opacity-60 shadow-glow transition-transform hover:scale-[1.03]"
        >
          {loading ? "Un segundo…" : isLogin ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

function Field({ label, ...props }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-foreground-soft">
        {label}
      </span>
      <input
        {...props}
        className="field"
      />
    </label>
  );
}
