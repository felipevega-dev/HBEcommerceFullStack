# Harry's Boutique

Proyecto e-commerce en `Next.js 16 + Prisma + PostgreSQL + NextAuth + MercadoPago + Resend`.

## Estructura activa

```text
harrys-boutique-next/   aplicación activa (Next.js 16 + Prisma)
```

## Setup local

```bash
cd harrys-boutique-next
npm install
cp .env.example .env.local
# Completa DATABASE_URL y DIRECT_URL con un proyecto o branch de Supabase que NO sea producción.
# `npm run dev` valida esas URLs antes de arrancar; no soporta Postgres local por Docker.
npm run db:generate
npm run db:migrate:deploy
npm run dev
```

App local: `http://localhost:3000`

## Comandos útiles

```bash
npm run dev
npm run lint
npm run type-check
npm run test
npm run build
npm run db:generate
npm run db:migrate:deploy
npm run db:studio
```

## Variables de entorno

Base: `harrys-boutique-next/.env.example`

Producción: `harrys-boutique-next/.env.production.example`

Ambos archivos listan todas las variables que usa el código; las marcadas como obligatorias se requieren en `vercel.json`/CI y en runtime.

VM Ubuntu con Docker: `harrys-boutique-next/VM_DEPLOY.md`

## Estado operativo actual

Cambios ya aplicados en esta fase:

- pedido recalculado server-side desde base de datos
- webhook de MercadoPago validando monto y moneda antes de marcar pago
- corrección de IDOR en actualización de carrito
- uploads endurecidos y compatibles con admin y perfil de usuario
- `Dockerfile` corregido para compilar con dependencias reales
- migraciones separadas del `start` del proceso web
- limpieza de documentación histórica dispersa
- base inicial para automatización de publicaciones en Instagram desde admin + worker

## Plan operativo de 30 días

### Semana 1

- cerrar integridad de pagos, órdenes y carrito
- terminar hardening de auth, rate limiting y uploads
- rotar y ordenar secretos

### Semana 2

- estabilizar build/deploy
- separar migraciones del runtime
- dejar healthchecks, logs y error tracking base

### Semana 3

- definir estrategia `SSR/SSG/ISR`
- cachear catálogo/producto correctamente
- optimizar consultas Prisma e índices más críticos

### Semana 4

- unificar flujo de administración de productos
- reorganizar por dominios
- retirar deuda técnica y features incompletas

## Checklist de producción

- `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- `BLOB_READ_WRITE_TOKEN`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_FRONTEND_URL`
- recomendado para producción multi-instancia: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `INSTAGRAM_USER_ID`, `INSTAGRAM_ACCESS_TOKEN`
- staging con migraciones probadas antes de producción
- backups automáticos de PostgreSQL
- Sentry o equivalente para errores
- healthcheck activo en `/api/health`
- despliegue con migración ejecutada fuera del proceso web
- checklist operativo: `harrys-boutique-next/PRODUCTION_CHECKLIST.md`

## Deploy

- CI activo: `.github/workflows/nextjs-ci.yml`
- ruta recomendada ahora: Vercel + Supabase, documentada en `harrys-boutique-next/SUPABASE_VERCEL_DEPLOY.md`
- Deploy VPS manual: `.github/workflows/deploy-vps.yml`
- Railway queda disponible a futuro: `harrys-boutique-next/railway.toml` ejecuta `npm run db:migrate:deploy` antes de iniciar
- El proceso web debe iniciar con `npm start`; no debe ejecutar migraciones durante `start`

## Instagram automation

- Admin: `harrys-boutique-next/src/app/(admin)/admin/instagram/page.tsx`
- Cola y estado: tablas `instagram_automation_settings`, `instagram_posts`, `instagram_post_attempts`
- Worker: `npm run instagram:process`
- Flujo manual: upload al storage del proyecto o uso de una URL existente, con programación exacta por `datetime`
- Borradores editables: título, descripción base, caption, imagen y fecha de publicación
- Recomendado: ejecutar el worker desde un cron externo una vez por minuto o una vez al día, según el nivel de control que quieran

## Prioridades técnicas abiertas

1. aplicar índices Prisma para carrito, reviews, direcciones y wishlist
2. sacar `auth()` de páginas públicas cacheables
3. unificar wizard/form clásico de productos
4. centralizar settings de negocio como envío y moneda

## Canal de compra y Mercado Libre

La tienda funciona como catálogo premium con dos canales excluyentes por producto:

- Con una `mercadoLibreUrl` oficial y válida, el producto se compra únicamente desde su publicación de Mercado Libre. Cards y ficha muestran el CTA externo y el producto queda fuera del carrito y del checkout propio.
- Sin `mercadoLibreUrl`, el producto conserva variantes, carrito, MercadoPago y pago contra entrega de Harry's Boutique.

En Admin, la URL se configura desde las opciones del producto. El item ID queda disponible como dato opcional para una futura integración OAuth; el estado visible “Publicado en Mercado Libre” se deriva de la URL. La lista de productos puede filtrarse por productos con o sin publicación.

La fase actual no crea carritos externos ni transfiere talla, color o varios productos hacia Mercado Libre. Mientras no exista OAuth, la ficha no muestra stock, variantes ni cantidad locales para esos productos; el precio se presenta como referencial y la disponibilidad se confirma en la publicación. El stock de los recursos públicos de Mercado Libre es referencial por rangos, por lo que no debe utilizarse como stock exacto.

### Sincronización con Mercado Libre (fase 2)

Con la cuenta vendedora conectada por OAuth, la tienda sincroniza precio, estado (activa, pausada, finalizada) y disponibilidad de cada publicación vinculada:

- Conexión: `/admin/settings` → panel "Mercado Libre" → "Conectar con Mercado Libre". Los tokens se guardan cifrados (AES-256-GCM con `MERCADOLIBRE_TOKEN_SECRET` o, en su defecto, `NEXTAUTH_SECRET`) y se refrescan solos.
- Sincronización manual: botón "Sincronizar ahora" (`POST /api/admin/mercadolibre/sync`).
- Sincronización automática: `GET /api/cron/mercadolibre-sync` programado en `vercel.json` (diario, 08:00 UTC) y protegido con `CRON_SECRET`.
- Efecto en la tienda: el precio local se reemplaza por el de Mercado Libre; una publicación pausada, finalizada o agotada deja de enlazar a Mercado Libre y muestra su estado en cards y ficha; el JSON-LD expone `availability` solo cuando hay sincronización.
- El stock exacto de Mercado Libre nunca se copia al stock local: solo se guarda si hay o no unidades.

Requisitos: crear la aplicación en el portal de desarrolladores de Mercado Libre Chile con `offline_access`, registrar como redirect URI `https://<dominio>/api/admin/mercadolibre/callback`, y definir `MERCADOLIBRE_CLIENT_ID`, `MERCADOLIBRE_CLIENT_SECRET` y `CRON_SECRET` (ver `.env.production.example`). Antes de desplegar, aplicar la migración `20261018120000_add_mercado_libre_sync` con `npm run db:migrate:deploy`.

La fase 3 podrá importar órdenes y preguntas, y crear o actualizar publicaciones.

Antes de desplegar esta fase, ejecutar fuera del proceso web:

```powershell
cd harrys-boutique-next
npm run db:migrate:deploy
```

Esto registra/aplica de forma idempotente la migración que permite usar URL sin exigir item ID ni estado técnico sincronizado. En producción fue aplicada mediante Supabase MCP el 15 de julio de 2026; otros entornos todavía deben ejecutar sus migraciones.

## Tienda editorial

- La ruta pública y canónica del catálogo es `/tienda`.
- `/collection` conserva compatibilidad mediante una redirección permanente que mantiene filtros y parámetros de búsqueda.
- La cabecera, categorías rápidas y bloque del atelier reutilizan el contenido visual administrable del Home.
- Los controles de búsqueda, orden y filtros mantienen la lógica existente con una presentación integrada al estilo handmade de la marca.
