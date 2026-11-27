"use client";

import {
  addTransitionType,
  startTransition,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

export type CatalogItem = { id: string; category: string; card: ReactNode };

type Props = { categories: string[]; items: CatalogItem[] };

function hrefFor(category: string | null) {
  return category ? `/productos?category=${encodeURIComponent(category)}` : "/productos";
}

// El catálogo completo llega del servidor y el filtro corre aquí: cambiar de
// categoría es instantáneo (sin ida y vuelta al servidor) y la URL se actualiza
// con pushState, que Next integra a su router dentro de una transición. Eso es
// lo que dispara los <ViewTransition> de cada card.
export function CategoryCatalog({ categories, items }: Props) {
  const category = useSearchParams().get("category");
  const visible = category ? items.filter((item) => item.category === category) : items;

  function select(event: MouseEvent<HTMLAnchorElement>, next: string | null) {
    // Ctrl/Cmd+clic y similares siguen abriendo el link normal en otra pestaña.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (next === category) return;
    startTransition(() => {
      addTransitionType("category-filter");
      window.history.pushState(null, "", hrefFor(next));
    });
  }

  return (
    <>
      <CategoryChips categories={categories} active={category} onSelect={select} />

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {visible.map((item) => (
            <ViewTransition
              key={item.id}
              enter="catalog-enter"
              exit="catalog-exit"
              update="catalog-move"
              default="none"
            >
              {item.card}
            </ViewTransition>
          ))}
        </div>
      ) : (
        <p className="text-foreground-soft">No hay productos en esta categoría todavía.</p>
      )}
    </>
  );
}

type Pill = { x: number; y: number; width: number; height: number };

function CategoryChips({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active: string | null;
  onSelect: (event: MouseEvent<HTMLAnchorElement>, category: string | null) => void;
}) {
  const chipRefs = useRef(new Map<string, HTMLAnchorElement>());
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<Pill | null>(null);
  const activeKey = active ?? "";

  // El fondo del chip activo es una sola píldora que se desliza de un chip a
  // otro. Sin JS (o antes de medir) el chip activo pinta su propio fondo, así
  // que el estado se ve igual.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      const chip = chipRefs.current.get(activeKey);
      setPill(
        chip
          ? { x: chip.offsetLeft, y: chip.offsetTop, width: chip.offsetWidth, height: chip.offsetHeight }
          : null,
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeKey]);

  const chips = [{ key: "", label: "Todo", value: null }, ...categories.map((c) => ({ key: c, label: c, value: c }))];

  return (
    <div ref={containerRef} className="relative isolate mb-10 flex flex-wrap gap-2">
      {pill && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-[1] rounded-full bg-primary shadow-glow transition-[translate,width,height] duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none"
          style={{ translate: `${pill.x}px ${pill.y}px`, width: pill.width, height: pill.height }}
        />
      )}
      {chips.map((chip) => {
        const isActive = chip.key === activeKey;
        return (
          <a
            key={chip.key}
            ref={(el) => {
              if (el) chipRefs.current.set(chip.key, el);
              else chipRefs.current.delete(chip.key);
            }}
            href={hrefFor(chip.value)}
            onClick={(event) => onSelect(event, chip.value)}
            aria-current={isActive ? "true" : undefined}
            className={`relative rounded-full border px-5 py-2 font-bold transition-colors duration-300 ${
              isActive && !pill
                ? "border-transparent bg-primary text-white shadow-glow"
                : "border-line bg-surface"
            } ${isActive ? "text-white" : "text-foreground-soft hover:text-foreground"}`}
          >
            <span className="relative z-[2]">{chip.label}</span>
          </a>
        );
      })}
    </div>
  );
}
