"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Sube la foto directo del navegador a Supabase Storage (bucket "catalog") con
 * la sesión del admin, y deja la URL pública en un input oculto `image_url`.
 * Así la foto no pasa por el servidor (Vercel limita el cuerpo a ~4,5 MB).
 */
export function ImageUpload({ folder, initialUrl }: { folder: string; initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setStatus("error");
      setMessage("Usa una foto JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus("error");
      setMessage("La foto pesa más de 8 MB.");
      return;
    }

    setStatus("uploading");
    setMessage("");
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const storage = getSupabaseBrowserClient().storage.from("catalog");
    const { error } = await storage.upload(path, file, { contentType: file.type });
    if (error) {
      setStatus("error");
      setMessage("No se pudo subir la foto. ¿Sigues con la sesión iniciada?");
      return;
    }
    setUrl(storage.getPublicUrl(path).data.publicUrl);
    setStatus("idle");
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-foreground-soft">Foto</span>
      <input type="hidden" name="image_url" value={url} />
      <div className="flex items-center gap-4">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-line bg-primary-tint">
          {url ? <Image src={url} alt="" fill sizes="112px" className="object-cover" /> : null}
        </div>
        <div className="flex flex-col items-start gap-2">
          <label className="cursor-pointer rounded-full border border-line bg-background px-5 py-2.5 text-sm font-bold transition-colors hover:border-primary">
            {status === "uploading" ? "Subiendo…" : url ? "Cambiar foto" : "Subir foto"}
            <input
              type="file"
              accept={TYPES.join(",")}
              onChange={handleFile}
              disabled={status === "uploading"}
              className="sr-only"
            />
          </label>
          {url && status !== "uploading" && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-xs font-bold text-foreground-soft hover:text-foreground"
            >
              Quitar foto
            </button>
          )}
          {status === "error" && <p className="text-sm font-semibold text-red-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}
