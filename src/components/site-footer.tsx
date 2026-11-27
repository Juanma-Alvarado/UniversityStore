import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line py-8 text-center text-sm text-foreground-soft">
      Hecho con 💚 por estudiantes ·{" "}
      <span className="font-display font-extrabold text-primary">{SITE_NAME}</span>
    </footer>
  );
}
