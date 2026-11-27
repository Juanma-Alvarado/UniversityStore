/** Luces de fondo: manchas de color muy desenfocadas que se mueven lento detrás de todo el sitio. */
export function GlowBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="blob absolute -left-[12vw] -top-[14vw] h-[46vw] w-[46vw] rounded-full bg-primary opacity-[var(--glow-strong,0.22)]" />
      <div
        className="blob absolute -right-[10vw] top-[22vh] h-[40vw] w-[40vw] rounded-full bg-yellow opacity-[var(--glow-yellow,0.22)]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="blob absolute -bottom-[16vw] left-[22vw] h-[44vw] w-[44vw] rounded-full bg-secondary opacity-[var(--glow-soft,0.16)]"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
