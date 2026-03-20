# HB Ecommerce Full Stack

Monorepo con tres aplicaciones:

- `frontend`: tienda pública React + Vite 8
- `admin`: panel administrativo React + Vite 8
- `backend`: API Express

## Requisitos

- Node `20.19+` o `22.12+`
- npm `10+`

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev:frontend
npm run dev:admin
npm run dev:backend
```

Puertos por defecto:

- `frontend`: `5173`
- `admin`: `5174`
- `backend`: `4000`

## Validación

```bash
npm run lint
npm run build
```

## Variables de entorno

Cada proyecto incluye su propio `.env.example` con las claves requeridas.
