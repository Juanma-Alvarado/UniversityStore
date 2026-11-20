# UniversityStore — Guía del proyecto

> Concepto visual de la dirección de diseño actual: https://claude.ai/code/artifact/6ba03b11-5106-4725-bb40-e36b5c569636

El marketplace de los emprendimientos universitarios — pero empieza como tienda personal antes de convertirse en plataforma.

## Decisión de stack

**Código a medida desde el día 1 (Next.js + Supabase), no Webflow.** El combo Webflow + GSAP + Three.js + Lenis + Blender + Barba.js es el estándar de agencia para sitios de marca, pero Webflow Ecommerce está pensado para una sola tienda: no tiene cuentas de vendedor, dashboards ni reparto de pagos entre emprendimientos, y el CMS tiene techo de ítems. Como la visión final es multi-vendedor, mejor construir una sola vez en código y portar el mismo ADN visual a React.

| Rol | Herramienta | Nota |
|---|---|---|
| Frontend | Next.js + Tailwind | Rutas, SEO y rendimiento de fábrica |
| Animación | GSAP + ScrollTrigger | Se mantiene igual |
| 3D / WebGL | Three.js (React Three Fiber) | Descartado por ahora — una foto de producto con GSAP cumple el mismo rol para el hero |
| Scroll suave | Lenis | Se mantiene igual, integración oficial con GSAP |
| Modelado 3D | Blender → glTF/GLB | Descartado por ahora, ver nota de arriba |
| Transiciones de página | View Transitions API | Reemplaza a Barba.js (pensado para vanilla JS) |
| Datos + cuentas | Supabase | Postgres + Auth + Storage, escala a multi-vendedor sin migrar |
| Pagos | Stripe → Stripe Connect | Checkout simple ahora, split de pagos cuando haya más vendedores |
| Hosting | Vercel | Soporte nativo de Next.js |

## Dirección de diseño

Primera versión (descartada): fondo oscuro, acento lima + violeta eléctrico, tipografía Unbounded + Hanken Grotesk + Space Mono — inspirada en landonorris.com. No convenció: se sentía a sitio editorial de agencia, no a app comercial.

Dirección actual, inspirada en apps como Rappi: color dominante vibrante (no un acento tímido), esquinas muy redondeadas, cards foto-céntricas con badges flotantes, botones píldora, tono informal. Se adapta la paleta (no se copia): verde en vez de naranja, con amarillo como secundario.

- **Verde** `#17B35B` (dark: `#1FCB6E`) · **Amarillo** `#FFC527` (dark: `#FFCF47`) · **Tinta/Papel** invertidos entre modo claro (`#FFF8F3`/`#181511`) y oscuro (`#121212`/`#F5F3EF`)
- Tipografía: **Baloo 2** (titulares, redonda y gorda) + **Plus Jakarta Sans** (cuerpo) — sin monoespaciada en ningún lado
- Modo claro y oscuro con toggle manual (persistido en localStorage) y fallback a preferencia del sistema
- Patrones de card: foto ocupando casi todo, precio y disponibilidad como badges flotantes, botón "+" circular de agregado rápido
- Motion: hero animado con GSAP (foto de producto real con fondo removido, no modelo 3D) + scroll suave con Lenis en todo el sitio. Three.js/Blender quedan descartados por ahora — la foto cumple el mismo objetivo con mucho menos esfuerzo

## Fases

### Fase 0 — Fundamentos (ahora)
- Cerrar paleta y tipografía definitivas
- Setup Next.js + Tailwind + Supabase en este repo
- Hero animado (GSAP + Lenis) con foto de producto en vez de modelo 3D
- Wireframes de Home, producto, carrito y checkout

### Fase 1 — Tienda personal (MVP)
Funcionalidades: catálogo (listado + detalle), carrito, checkout real con Stripe, mobile-first, SEO básico.
Diseño: hero 3D interactivo, grid de productos con hover, checkout simple sin sacrificar conversión.

### Fase 2 — Comunidad y descubrimiento (funcionalidad completa)
Funcionalidades: cuentas de usuario (favoritos/historial), reviews, categorías/tags. (Newsletter descartado por ahora.)

Hecho:
- Cuentas con Supabase Auth (email + contraseña, confirmación por mail), tabla `profiles` con nombre visible, página `/cuenta`, sesión refrescada por `src/proxy.ts`
- Categorías con filtro en el catálogo (heredado de Fase 1)
- Favoritos: tabla `favorites` con RLS por usuario, corazón en cada card y en el detalle (optimista), página `/favoritos` enlazada desde `/cuenta`
- Reseñas: tabla `reviews` (una por usuario y producto, 1–5 estrellas + comentario opcional), promedio y listado en el detalle del producto, alta/edición/borrado con Server Actions. Por ahora puede opinar cualquier usuario logueado; cuando exista el historial de pedidos se puede limitar a quienes compraron

- Historial de pedidos: tablas `orders` + `order_items` (nombre y precio congelados al comprar), escritas solo por el webhook de Stripe (`/api/stripe/webhook`) vía la función `record_order` — atómica, idempotente ante reintentos de Stripe y descuenta stock de los productos que no son por encargo. Página `/pedidos` enlazada desde `/cuenta`. Comprar sin cuenta sigue permitido (el pedido queda sin usuario)

Falta (funcionalidad lista, pendiente de claves): probar el flujo completo de pago → webhook → pedido con Stripe en modo test.
Diseño: contenido "detrás del emprendimiento", transiciones fluidas entre categorías.

### Fase 3 — Marketplace multi-vendedor (visión final)
Funcionalidades: onboarding de vendedores (verificación estudiantil), dashboard de vendedor, pagos divididos (Stripe Connect), buscador/filtros por categoría-facultad-precio, mensajería comprador-vendedor, moderación.
Diseño: vitrina personalizable por vendedor dentro de los límites de marca, feed de descubrimiento.

## Próximos pasos inmediatos
1. Cargar en `.env.local` las claves que faltan (ver `.env.local.example`): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y `SUPABASE_SECRET_KEY`. En local, el secret del webhook sale de `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. En Supabase → Authentication → URL Configuration: agregar `http://localhost:3000/auth/callback` (y el dominio real cuando se deploye) a las Redirect URLs
3. Probar una compra de punta a punta con tarjeta de test y verla en `/pedidos`
4. Opcional antes de Fase 3: limitar las reseñas a quienes compraron el producto, y marcar pedidos como reembolsados (evento `charge.refunded`)
