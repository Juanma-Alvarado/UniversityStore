// Solo acepta rutas internas para evitar open redirects (?next=https://...).
export function safeNextPath(next: string | null | undefined, fallback = "/cuenta") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
