"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(ref.current, { opacity: 1, rotate: -6 });
        return;
      }

      gsap
        .timeline()
        .fromTo(
          ref.current,
          { y: 50, opacity: 0, rotate: -6, scale: 0.92 },
          { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" },
        )
        .to(ref.current, {
          y: -16,
          rotate: 0,
          duration: 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto w-60 opacity-0 sm:w-72 md:w-80"
      style={{ rotate: "-6deg" }}
    >
      <Image
        src="/hero/folded-tshirts.png"
        alt="Camisetas dobladas de colores"
        width={600}
        height={600}
        priority
        className="h-auto w-full drop-shadow-2xl"
      />
    </div>
  );
}
