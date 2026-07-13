# Deploy en VM Ubuntu (Docker)

Target: una VM con Ubuntu 22.04/24.04, Docker Engine y Docker Compose plugin.

## Que incluye el stack

| Servicio           | Archivo                   | Rol                                     |
| ------------------ | ------------------------- | --------------------------------------- |
| PostgreSQL 16      | `docker-compose.prod.yml` | Base de datos persistente               |
| Next.js standalone | `Dockerfile`              | App en `:3000`, migraciones al arrancar |

Dev local sigue usando `docker-compose.yml` (solo Postgres) + `npm run dev` en el host.

## Requisitos en la VM

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

Opcional pero recomendado delante de la app:

- Nginx o Caddy para TLS (`443`) y proxy a `127.0.0.1:3000`
- Firewall: abrir `22`, `80`, `443`; no exponer `5432`

## Primer deploy

```bash
git clone https://github.com/felipevega-dev/HBEcommerceFullStack.git
cd HBEcommerceFullStack/harrys-boutique-next

cp .env.production.example .env
nano .env   # completar secretos reales
```

Variables minimas:

- `POSTGRES_PASSWORD`
- `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- `NEXTAUTH_URL` y `NEXT_PUBLIC_FRONTEND_URL` con tu dominio HTTPS
- MercadoPago produccion
- Resend + dominio verificado
- `BLOB_READ_WRITE_TOKEN`
- Supabase public keys si las usas en cliente

Deploy:

```bash
chmod +x scripts/vm-deploy.sh
./scripts/vm-deploy.sh
```

O manual:

```bash
npm run docker:prod:build
npm run docker:prod:up
curl http://127.0.0.1:3000/api/health
```

Crear admin inicial (una vez):

```bash
docker compose -f docker-compose.prod.yml exec app npm run admin:create
```

## Operacion

```bash
# logs
npm run docker:prod:logs

# reiniciar app tras cambio de .env
npm run docker:prod:build
docker compose -f docker-compose.prod.yml up -d app

# backup DB
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U postgres harrys_boutique > backup.sql
```

## Dev local (Windows/macOS/Linux)

```bash
npm run dev
```

Eso levanta Postgres si hace falta y arranca Next en el host.

Si tenias un contenedor viejo `harrys-postgres` huerfano, el script lo reutiliza o lo limpia solo si bloquea Compose.

Credenciales Docker local:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/harrys_boutique"
DIRECT_URL="postgresql://postgres:password@localhost:5432/harrys_boutique"
```

## Checklist antes de produccion

Ver `PRODUCTION_CHECKLIST.md`:

- `npm run ci` en la rama a desplegar
- webhook MercadoPago apuntando a `https://tu-dominio/api/mercadopago/webhook`
- `/api/health` en monitorizacion
- backup automatico de Postgres

## Alternativa Supabase + VM solo app

Si prefieres Postgres gestionado:

1. Usa URLs de Supabase en `.env` (`DATABASE_URL` pooler, `DIRECT_URL` directo).
2. Comenta o elimina el servicio `db` en `docker-compose.prod.yml`.
3. Cambia `DATABASE_URL`/`DIRECT_URL` del servicio `app` para que lean del `.env` externo.

El `Dockerfile` y build args ya soportan variables publicas en build time.
