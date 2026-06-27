# Harry's Boutique

Proyecto e-commerce en `Next.js 16 + Prisma + PostgreSQL + NextAuth + MercadoPago + Resend`.

## Estructura activa

```text
harrys-boutique-next/   aplicación activa
legacy/                 código histórico, pendiente de retiro definitivo
```

## Setup local

```bash
cd harrys-boutique-next
npm install
cp .env.example .env.local
# Docker Postgres local: postgres / password
npx prisma migrate dev
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
5. retirar `legacy/` y dependencias residuales no usadas
