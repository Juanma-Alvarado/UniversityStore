# UniversityStore — Guía del proyecto

> Versión navegable con diseño completo: https://claude.ai/code/artifact/05b7f3c5-0353-469f-a835-bb18af921ea7

El marketplace de los emprendimientos universitarios — pero empieza como tienda personal antes de convertirse en plataforma.

## Decisión de stack

**Código a medida desde el día 1 (Next.js + Supabase), no Webflow.** El combo Webflow + GSAP + Three.js + Lenis + Blender + Barba.js es el estándar de agencia para sitios de marca, pero Webflow Ecommerce está pensado para una sola tienda: no tiene cuentas de vendedor, dashboards ni reparto de pagos entre emprendimientos, y el CMS tiene techo de ítems. Como la visión final es multi-vendedor, mejor construir una sola vez en código y portar el mismo ADN visual a React.

| Rol | Herramienta | Nota |
|---|---|---|
| Frontend | Next.js + Tailwind | Rutas, SEO y rendimiento de fábrica |
| Animación | GSAP + ScrollTrigger | Se mantiene igual |
| 3D / WebGL | Three.js (React Three Fiber) | Mismo motor, integrado como componentes React |
| Scroll suave | Lenis | Se mantiene igual, integración oficial con GSAP |
| Modelado 3D | Blender → glTF/GLB | Se mantiene igual |
| Transiciones de página | View Transitions API | Reemplaza a Barba.js (pensado para vanilla JS) |
| Datos + cuentas | Supabase | Postgres + Auth + Storage, escala a multi-vendedor sin migrar |
| Pagos | Stripe → Stripe Connect | Checkout simple ahora, split de pagos cuando haya más vendedores |
| Hosting | Vercel | Soporte nativo de Next.js |

## Dirección de diseño

Referencia: landonorris.com — fondo oscuro, un solo acento eléctrico, tipografía grande y segura, hover states como premio, foto/contenido real.

Se adapta (no se copia) la paleta: acento lima + violeta eléctrico sobre tinta/papel, con tema claro ("fanzine en papel") y oscuro ("póster de recital").

- **Lima** `#8FAE00` · **Violeta** `#5A3FD1` · **Tinta** `#15180F` · **Papel** `#F4F1E6`
- Tipografía: **Unbounded** (titulares) + **Hanken Grotesk** (cuerpo) + **Space Mono** (labels/data)
- Motion: objeto 3D interactivo en el hero (Blender → Three.js), scroll suave con Lenis, reveals con GSAP ScrollTrigger, hover microinteracciones en cards de producto, galerías con scroll horizontal

## Fases

### Fase 0 — Fundamentos (ahora)
- Cerrar paleta y tipografía definitivas
- Setup Next.js + Tailwind + Supabase en este repo
- Modelar 1 objeto 3D en Blender para el hero
- Wireframes de Home, producto, carrito y checkout

### Fase 1 — Tienda personal (MVP)
Funcionalidades: catálogo (listado + detalle), carrito, checkout real con Stripe, mobile-first, SEO básico.
Diseño: hero 3D interactivo, grid de productos con hover, checkout simple sin sacrificar conversión.

### Fase 2 — Comunidad y descubrimiento
Funcionalidades: cuentas de usuario (favoritos/historial), reviews, categorías/tags, newsletter.
Diseño: contenido "detrás del emprendimiento", transiciones fluidas entre categorías.

### Fase 3 — Marketplace multi-vendedor (visión final)
Funcionalidades: onboarding de vendedores (verificación estudiantil), dashboard de vendedor, pagos divididos (Stripe Connect), buscador/filtros por categoría-facultad-precio, mensajería comprador-vendedor, moderación.
Diseño: vitrina personalizable por vendedor dentro de los límites de marca, feed de descubrimiento.

## Próximos pasos inmediatos
1. Elegir los primeros productos reales (el catálogo se diseña con productos de verdad, no relleno)
2. Confirmar paleta y tipografía (o ajustarlas)
3. Inicializar el proyecto Next.js en este repo
4. Bocetar Home y página de producto antes de meterle animación
