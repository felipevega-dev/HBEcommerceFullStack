# Auditoría y plan de mejora del ecommerce

Fecha: 2026-10-18. Rama de referencia: `main` (`94e03ea`).

## 1. Estado actual (lo que ya existe y funciona)

Validado en esta fecha: `type-check` OK, `test` 309/309 (29 archivos),
`build` OK. `lint` global falla por formato preexistente (ver 3.1).

| Área                | Estado                                                                                                                                                                                                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catálogo            | Categorías, productos, variantes talla/color, stock por variante, búsqueda, filtros con `unstable_cache`, Tienda con `revalidate = 300`.                                                                                                                                                                   |
| Canal Mercado Libre | Un producto con URL oficial válida (`src/lib/mercado-libre.ts`) se vende solo en ML: CTA en card/ficha, fuera del carrito y de órdenes (409 `MERCADOLIBRE_ONLY`), precio marcado como referencial, sin `availability` en JSON-LD. Eventos de analytics `click_mercadolibre` y `invalid_mercadolibre_link`. |
| Compra directa      | Carrito server-side, cupones con redención, pedidos recalculados en servidor, reserva de stock con expiración, Checkout Pro de MercadoPago.                                                                                                                                                                |
| Webhook MercadoPago | Firma HMAC-SHA256 con comparación en tiempo constante, validación de monto y moneda, idempotencia, liberación de stock y cupón en rechazos/reembolsos, historial de estados.                                                                                                                               |
| Emails (Resend)     | Bienvenida, confirmación de pedido, cambio de estado, reset de contraseña.                                                                                                                                                                                                                                 |
| Admin               | Productos (wizard, edición, duplicar, carga masiva CSV), pedidos (estados, tracking, cancelar, reembolso, export CSV), clientes, cupones, reseñas, testimonios, hero, contenido Home, Nosotros, Instagram, ajustes de tienda (envío, umbral gratis, contacto).                                             |
| Seguridad           | NextAuth con roles OWNER/ADMIN/MODERATOR, `src/proxy.ts` protege `/admin` y rutas de usuario, rate limit Upstash, CSP y cabeceras duras, audit log, uploads endurecidos.                                                                                                                                   |
| SEO                 | Metadata, JSON-LD de tienda y producto, sitemap dinámico con productos y categorías, robots, imagen OG.                                                                                                                                                                                                    |
| Observabilidad      | Sentry configurado (client/edge/server), `/api/health`.                                                                                                                                                                                                                                                    |
| Calidad             | Vitest + Testing Library + fast-check, husky + lint-staged, 21 skills de diseño en `.claude/skills`.                                                                                                                                                                                                       |

## 2. Qué falta (ordenado por impacto)

### 2.0 URGENTE: credenciales en el historial de Git (repositorio público)

- El repositorio `felipevega-dev/HBEcommerceFullStack` es público: la API de
  GitHub responde 200 sin autenticación.
- Entre abril y julio de 2026 se commitearon `.env.example` y
  `.env.production.example` con valores opacos que parecen credenciales reales
  (commits `9a5192c`, `3e90e28`, `3961584`, `919e649`; borrados en
  `147c1d3` el 2026-07-13). Siguen visibles en el historial.
- Acción inmediata y manual: rotar `NEXTAUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`,
  `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `RESEND_API_KEY`,
  `UPSTASH_REDIS_REST_TOKEN`, la contraseña de Postgres en Supabase
  (`DATABASE_URL` y `DIRECT_URL`), la clave publishable de Supabase,
  `INSTAGRAM_ACCESS_TOKEN` y el DSN de Sentry. Actualizar Vercel y
  `.env.local`.
- Después de rotar: purgar el historial con `git filter-repo` y forzar push, o
  hacer privado el repositorio. Es destructivo (todos los clones deben
  volver a clonarse) y solo se hace con aprobación explícita.

### 2.1 Mercado Libre: hoy es solo un enlace

- No hay OAuth ni app registrada en Mercado Libre. Precio, stock y estado de
  la publicación no se sincronizan; el precio local es referencial.
- No se importan órdenes de ML, ni preguntas, ni se detecta cuando una
  publicación se pausa o se agota (el CTA seguiría mandando tráfico a una
  publicación muerta).
- Propuesta por fases:
  1. Registrar app en ML, guardar `ML_CLIENT_ID`/`ML_CLIENT_SECRET` en Vercel,
     flujo OAuth desde `/admin/settings` y tokens cifrados en `Settings`.
  2. Job (cron de Vercel) que lee `GET /items/{id}` por cada
     `mercadoLibreItemId` y persiste `price`, `available_quantity > 0`,
     `status` en campos de caché (`mercadoLibreSyncedAt`, etc.). Ficha y cards
     pasan a mostrar precio y disponibilidad reales.
  3. Opcional: importar órdenes de ML a `Order` con `paymentProvider =
'mercadolibre'` para tener ventas unificadas en el dashboard.

### 2.2 Pipeline de calidad roto en verde

- `npm run lint` falla en 94 archivos por formato Prettier (CRLF y archivos
  antiguos). Como `check` y `ci` encadenan `type-check && lint && test`, los
  tests nunca llegan a correr en esos scripts.
- Fix de una sola fase: `npm run format` en un commit `chore(format)` aislado,
  más `.gitattributes` con `* text=auto eol=lf` para que no vuelva a pasar.

### 2.3 Documentación y entorno desactualizados

- `README.md` instruye `cp .env.example .env.local`, pero `.env.example` y
  `.env.production.example` no existen en el repo (aunque `.gitignore` los
  excepciona). Hay que recrearlos con todas las variables de `src/lib/env.ts`.
- `README.md` menciona una carpeta `legacy/` que ya no existe.

### 2.4 Cobertura de tests en el flujo de dinero

- No hay tests para `api/mercadopago/webhook` ni `create-preference`. Son las
  rutas con más lógica de negocio (idempotencia, liberación de stock, cupones)
  y ningún test las cubre. Agregar tests unitarios con Prisma mockeado para los
  escenarios: aprobado, rechazado, reembolsado, duplicado, monto distinto,
  stock ya liberado.
- No hay pruebas E2E. Un smoke con Playwright (home, tienda, ficha, carrito,
  checkout hasta la redirección a MP) cerraría el checklist de producción.

### 2.5 Conversión y experiencia de compra

- Checkout exige cuenta (`/checkout` redirige a login). Evaluar checkout como
  invitado o registro posterior al pago; para una tienda pequeña es la fricción
  más cara.
- Home, Nosotros, FAQ, Envíos y Devoluciones usan `force-dynamic` y pegan a la
  base en cada visita. Pasar a ISR con `revalidateTag` disparado desde el
  admin cuando se guarda contenido.
- 15 `<img>` crudos frente a 26 usos de `next/image`. Migrarlos donde sean
  imágenes de producto o hero.
- Pendientes ya anotados en `WORK_LOG.md`: auditoría mobile-native, estados de
  carrito/checkout y revisión de motion usando las skills instaladas.

### 2.6 Marketing y medición

- GA4 solo se activa si existe `NEXT_PUBLIC_GA_ID`; confirmar que esté en
  Vercel. No hay Meta Pixel ni eventos de ecommerce estándar (`add_to_cart`,
  `begin_checkout`, `purchase`) más allá de los propios.
- No hay newsletter ni recuperación de carrito abandonado (hay carritos
  persistidos, así que es viable con Resend).

## 3. Herramientas para el proyecto

### 3.1 Skills ya instaladas (`harrys-boutique-next/.claude/skills`)

Diseño: `better-*` (accessibility, colors, interface, layout, typography, ui,
writing), `interface-review`, `no-ai-design-slop`, `audit-ai-design-slop`,
`emil-design-eng`, `mobile-native`, `animate`, `animation-performance`,
`review-animations`, `improve-animations`, `find-animation-opportunities`,
`state-machine`, `break`. Datos: `supabase`, `supabase-postgres-best-practices`.
Plugin `design` (accessibility-review, design-critique, design-handoff,
design-system, ux-copy) disponible a nivel usuario.

### 3.2 Skills y MCP recomendados (no instalados)

| Herramienta                                                                 | Para qué                                                                                                  | Instalación                                                                                                                                                |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plugin oficial MercadoPago                                                  | Skills `mp-integrate`, `mp-webhooks`, `mp-review`, `mp-test-setup`; hook que bloquea tokens hardcodeados. | `/plugin marketplace add https://github.com/mercadopago/mercadopago-claude-marketplace.git` y `/plugin install mercadopago@mercadopago-claude-marketplace` |
| MCP oficial Mercado Libre (devsite)                                         | Consultar la API y docs de ML con OAuth mientras se construye la sincronización de 2.1.                   | `claude mcp add --transport http mercadolibre-devsite-mcp https://mcp.mercadolibre.com/devsite/v1/mcp -s project`                                          |
| `frontend-design` (Anthropic)                                               | Dirección visual fuerte al crear páginas nuevas; complementa `no-ai-design-slop`.                         | `npx skills add https://github.com/anthropics/skills --skill frontend-design -a claude-code --copy`                                                        |
| `react-best-practices` y `web-design-guidelines` (vercel-labs/agent-skills) | Reglas de rendimiento React/Next (server vs client, data fetching) y auditoría de 100 reglas de UI.       | `npx skills add vercel-labs/agent-skills -a claude-code --copy`                                                                                            |
| Playwright MCP                                                              | Capturas por breakpoint y smoke E2E real del checkout.                                                    | `claude mcp add playwright npx @playwright/mcp@latest -s project`                                                                                          |
| Context7 MCP                                                                | Docs actualizadas de Next 16, Prisma 6, NextAuth v5 beta.                                                 | `claude mcp add context7 npx @upstash/context7-mcp -s project`                                                                                             |

Descartados por ahora: Figma MCP (no hay archivo de diseño), shadcn MCP (la UI
ya tiene primitives propios), MCP comunitarios de ML (usar el oficial).

## 4. Orden sugerido de fases

1. `chore/format-and-eol`: Prettier masivo + `.gitattributes`, `check` en verde.
2. `docs/env-examples`: recrear `.env.example` y `.env.production.example`,
   corregir README.
3. `test/mercadopago-webhook`: tests del webhook y de create-preference.
4. `feature/mercadolibre-oauth-sync`: fases 2.1.1 y 2.1.2.
5. `feature/home-isr-revalidate`: ISR + `revalidateTag` desde admin.
6. `feature/guest-checkout` (decisión de negocio previa).
7. `feature/storefront-mobile-audit`: aplicar `mobile-native` y `better-*`.
