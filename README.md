# Harry's Boutique

E-commerce full stack construido con Next.js 16, PostgreSQL (Prisma), NextAuth, Cloudinary y MercadoPago.

## Estructura

```
harrys-boutique-next/   ← proyecto activo (Next.js)
legacy/                 ← código anterior (React + Express, ignorado)
```

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Base de datos:** PostgreSQL vía Prisma
- **Auth:** NextAuth v5
- **Pagos:** MercadoPago
- **Imágenes:** Cloudinary
- **Email:** Resend
- **Deploy:** Railway

## Requisitos

- Node `20.19+` o `22.12+`
- npm `10+`
- PostgreSQL

## Instalación

```bash
cd harrys-boutique-next
npm install
cp .env.example .env.local
# Completar variables en .env.local
npx prisma migrate dev
```

## Desarrollo

```bash
cd harrys-boutique-next
npm run dev
```

App disponible en `http://localhost:3000`

## Comandos útiles

```bash
npm run lint          # linting
npm run type-check    # TypeScript
npm run test          # tests (vitest)
npm run build         # build de producción
npm run db:studio     # Prisma Studio
```

## Variables de entorno

Ver `harrys-boutique-next/.env.example` para todas las claves requeridas.
