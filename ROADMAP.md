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
| Pagos | Wompi (COP) | PSE, tarjetas y Nequi con checkout alojado. Stripe se descartó: no opera en Colombia ni tiene PSE. Para el split de la Fase 3 evaluar Wompi vs Mercado Pago |
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
Funcionalidades: catálogo (listado + detalle), carrito, checkout real (empezó con Stripe, hoy Wompi en COP), mobile-first, SEO básico.
Diseño: hero 3D interactivo, grid de productos con hover, checkout simple sin sacrificar conversión.

### Fase 2 — Comunidad y descubrimiento (funcionalidad completa)
Funcionalidades: cuentas de usuario (favoritos/historial), reviews, categorías/tags. (Newsletter descartado por ahora.)

Hecho:
- Cuentas con Supabase Auth (email + contraseña, confirmación por mail), tabla `profiles` con nombre visible, página `/cuenta`, sesión refrescada por `src/proxy.ts`
- Categorías con filtro en el catálogo (heredado de Fase 1)
- Favoritos: tabla `favorites` con RLS por usuario, corazón en cada card y en el detalle (optimista), página `/favoritos` enlazada desde `/cuenta`
- Reseñas: tabla `reviews` (una por usuario y producto, 1–5 estrellas + comentario opcional), promedio y listado en el detalle del producto, alta/edición/borrado con Server Actions. Por ahora puede opinar cualquier usuario logueado; cuando exista el historial de pedidos se puede limitar a quienes compraron

- Historial de pedidos: tablas `orders` + `order_items` (nombre y precio congelados al comprar). El pedido nace `pending` al tocar "Finalizar compra" (`create_pending_order`, precios leídos de la base) y su id es la referencia de Wompi. Se confirma por dos vías idempotentes que llaman a `apply_payment_result`: el evento firmado `transaction.updated` en `/api/wompi/events` y la página de retorno `/carrito/exito` (verifica que la transacción sea de nuestro comercio). Al pagarse descuenta stock de lo que no es por encargo. Página `/pedidos` enlazada desde `/cuenta`. Comprar sin cuenta sigue permitido

Falta: probar una compra de punta a punta en el sandbox de Wompi — **en pausa** (Wompi no se va a usar de momento; el código queda listo pero sin llaves).
Diseño: contenido "detrás del emprendimiento", transiciones fluidas entre categorías.

- Transiciones entre categorías (hecho): en `/productos` el filtro corre en el cliente (`CategoryCatalog`) y cambia la URL con `pushState`, sin ir al servidor. Con `<ViewTransition>` de React las cards que salen se achican, las que entran aparecen con rebote y las que se quedan se deslizan; el fondo del chip activo es una píldora que se desliza entre chips. Respeta `prefers-reduced-motion`. El botón "atrás" del navegador cambia el filtro sin animar (React no anima navegaciones del historial)
- Detrás del emprendimiento (hecho): tabla `ventures` (historia, foto, Instagram, WhatsApp) y `products.venture_id`. Páginas `/emprendimientos` y `/emprendimientos/[slug]` (historia + sus productos), tarjeta "Hecho por" en la ficha y sección "Detrás de cada producto" en la home. Primeros emprendimientos reales de la universidad: Prensaditos, Flovera y STUD (fotos y textos de sus publicaciones). Las camisetas y los zuecos son productos propios, sin emprendimiento asociado
- Botón "Pedir por WhatsApp" por emprendimiento, visible solo si `ventures.whatsapp` tiene número (indicativo + número, solo dígitos)
- Carrito por WhatsApp (mientras Wompi está en pausa): sin llaves de Wompi, "Finalizar compra" pasa a "Pedir por WhatsApp". El pedido se registra con `create_whatsapp_order` (estado `requested`, canal `whatsapp`, precios de la base) y se arma un mensaje por destinatario: cada emprendimiento con su número, y la tienda (`STORE_WHATSAPP`) para los productos propios o emprendimientos sin número. Se ve en `/pedidos` como "Pedido por WhatsApp". Con las llaves de Wompi vuelve solo al pago en línea

### Fase 3 — Marketplace multi-vendedor (visión final)
Funcionalidades: onboarding de vendedores (verificación estudiantil), dashboard de vendedor, pagos divididos (proveedor a definir: Wompi o Mercado Pago), buscador/filtros por categoría-facultad-precio, mensajería comprador-vendedor, moderación.
Diseño: vitrina personalizable por vendedor dentro de los límites de marca, feed de descubrimiento.

## Próximos pasos inmediatos
1. Confirmar nombres de los emprendimientos (Prensaditos y STUD son provisionales) y completar sus historias en Supabase
2. Cargar el producto de Flovera (falta el precio de los ramos)
3. Reemplazar el WhatsApp de prueba (`573000000000`, en los tres emprendimientos y en `STORE_WHATSAPP`) por el real de cada uno cuando confirme que quiere aparecer

### En pausa: pagos con Wompi
La integración está hecha pero Wompi no se va a usar de momento. Cuando se retome:
1. Crear cuenta en comercios.wompi.co y cargar en `.env.local` las llaves de prueba: `WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET` (ver `.env.local.example`). La migración `20261120180000_orders_for_wompi.sql` ya está aplicada
2. Probar una compra en el sandbox (PSE con "Banco que aprueba", o tarjeta `4242 4242 4242 4242`) y verla en `/pedidos`
3. Al deployar: configurar en Wompi la URL de eventos `https://<dominio>/api/wompi/events` (sandbox y producción por separado) y agregar el dominio a las Redirect URLs de Supabase Auth
4. Después: limitar las reseñas a quienes compraron, y limpiar pedidos `pending` abandonados
