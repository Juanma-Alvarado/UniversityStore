export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = "UniversityStore";
/** WhatsApp de la tienda para los productos propios (sin emprendimiento). Indicativo + número, solo dígitos. */
export const STORE_WHATSAPP = process.env.STORE_WHATSAPP?.replace(/\D/g, "") || null;
export const SITE_DESCRIPTION =
  "La tienda de los emprendimientos universitarios. Hoy, tus propios productos.";
