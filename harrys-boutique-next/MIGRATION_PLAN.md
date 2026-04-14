# Plan de Migración: MongoDB → PostgreSQL + Next.js

## Rama de trabajo

`migration/nextjs-postgres` — nunca hacer merge a `main` hasta completar el cutover.

---

## Pre-requisitos

- [ ] PostgreSQL provisionado en Railway con `DATABASE_URL` disponible
- [ ] Variables de entorno configuradas en Railway (ver `.env.example`)
- [ ] Resend API key configurada
- [ ] Cloudinary credentials configuradas
- [ ] MercadoPago access token configurado

---

## Pasos del Cutover

### Paso 1 — Ejecutar script de migración de datos

```bash
# En la máquina local con acceso a ambas bases de datos
cd harrys-boutique-next
cp .env.example .env.local
# Completar MONGO_URI y DATABASE_URL en .env.local

npm install
npx prisma migrate deploy
npx tsx scripts/migrate-from-mongo.ts
```

**Verificar:** El script debe imprimir un reporte sin errores y los conteos de MongoDB y PostgreSQL deben coincidir.

### Paso 2 — Verificar integridad de datos

```bash
# El script imprime automáticamente los conteos de validación
# Verificar manualmente en Prisma Studio:
npx prisma studio
```

Verificar:

- [ ] Usuarios migrados correctamente (passwords bcrypt intactos)
- [ ] Productos con imágenes y categorías correctas
- [ ] Órdenes con items y direcciones
- [ ] Reviews con referencias correctas

### Paso 3 — Deploy en Railway

```bash
# Conectar repositorio a Railway
# Configurar variables de entorno en Railway dashboard
# Railway ejecutará automáticamente:
#   npm ci && npm run db:generate && npm run build
#   npx prisma migrate deploy && npm start
```

### Paso 4 — Verificar funcionamiento post-deploy

- [ ] `GET /api/health` retorna `{ status: "ok", db: "connected" }`
- [ ] Login de usuario existente funciona
- [ ] Catálogo de productos carga correctamente
- [ ] Panel admin accesible con credenciales de admin

### Paso 5 — Redirigir tráfico

- [ ] Actualizar DNS o configuración de dominio para apuntar al nuevo deploy en Railway
- [ ] Verificar que el dominio resuelve correctamente
- [ ] Monitorear logs en Railway por 30 minutos

---

## Procedimiento de Rollback

Si se detectan problemas críticos post-cutover, revertir en menos de 15 minutos:

1. **Revertir DNS** al deploy anterior (Vercel/Railway anterior)
2. **Notificar** al equipo del rollback
3. **Investigar** el problema en la rama `migration/nextjs-postgres`
4. **No hacer rollback de datos** — la base de datos MongoDB no fue modificada

```bash
# El deploy anterior sigue activo en main
# Solo es necesario revertir el DNS/dominio
```

---

## Checklist post-cutover (primeras 24 horas)

- [ ] Monitorear errores en Railway logs
- [ ] Verificar que los emails transaccionales se envían correctamente
- [ ] Verificar que MercadoPago webhook funciona
- [ ] Verificar que las imágenes de Cloudinary cargan
- [ ] Verificar que el panel admin funciona para el equipo
- [ ] Hacer backup de la base de datos PostgreSQL en Railway

---

## Estimación de tiempo

| Paso                       | Tiempo estimado                   |
| -------------------------- | --------------------------------- |
| Script de migración        | 5-30 min (según volumen de datos) |
| Verificación de integridad | 15 min                            |
| Deploy en Railway          | 5-10 min                          |
| Verificación post-deploy   | 15 min                            |
| Redirección de DNS         | 5 min (propagación: hasta 24h)    |
| **Total**                  | **~1 hora**                       |
