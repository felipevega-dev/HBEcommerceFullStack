# 🛍️ Harry's Boutique - Guía de Despliegue

## 🎯 ¿Qué se ha configurado?

He preparado tu proyecto Next.js con PostgreSQL para que puedas desplegarlo fácilmente en cualquier plataforma. Ahora tienes:

### ✅ Archivos Creados

1. **`Dockerfile`** - Para crear una imagen Docker de tu aplicación
2. **`docker-compose.yml`** - Para correr PostgreSQL + Next.js localmente
3. **`DEPLOYMENT.md`** - Guía completa de despliegue (en inglés)
4. **`QUICK_START.md`** - Inicio rápido con comparación de opciones
5. **`COMMANDS.md`** - Referencia de comandos útiles
6. **`DEPLOYMENT_CHECKLIST.md`** - Checklist para no olvidar nada
7. **`README.md`** - Documentación general del proyecto
8. **`.github/workflows/ci.yml`** - Tests automáticos en cada push
9. **`.github/workflows/deploy.yml`** - Despliegue automático a VPS
10. **Scripts de inicio:**
    - `start-local.bat` (Windows)
    - `start-local.sh` (Mac/Linux)

---

## 🚀 Opciones de Despliegue

### 1. Railway (⭐ RECOMENDADO - Más Fácil)

**Ideal para:** Lanzar rápido sin complicaciones  
**Costo:** $5/mes gratis, luego ~$10-20/mes  
**Tiempo:** 5 minutos

```
1. Ve a railway.app
2. Conecta tu GitHub
3. Selecciona tu repositorio
4. Agrega PostgreSQL (1 click)
5. Configura variables de entorno
6. ¡Listo! 🚀
```

**Ventajas:**
- ✅ PostgreSQL incluido (no necesitas configurar nada)
- ✅ SSL automático (HTTPS)
- ✅ Cada push a `main` despliega automáticamente
- ✅ Muy fácil de usar

---

### 2. Vercel + Supabase (Más Rápido)

**Ideal para:** Mejor rendimiento para Next.js  
**Costo:** Gratis hasta cierto límite  
**Tiempo:** 5 minutos

```
1. Crea base de datos en supabase.com (gratis)
2. Despliega en vercel.com
3. Conecta tu GitHub
4. Configura variables de entorno
5. ¡Listo! 🚀
```

**Ventajas:**
- ✅ Vercel es el creador de Next.js (mejor soporte)
- ✅ Tier gratuito generoso
- ✅ Despliegue ultra rápido

---

### 3. VPS con Docker (Más Control)

**Ideal para:** Control total y bajo costo  
**Costo:** $5-10/mes (DigitalOcean, Linode, AWS)  
**Tiempo:** 30-60 minutos

```bash
# En tu servidor
git clone <tu-repo>
cd harrys-boutique-next
docker-compose up -d
```

**Ventajas:**
- ✅ Control total del servidor
- ✅ Costo predecible
- ✅ Puedes alojar múltiples aplicaciones

---

### 4. Desarrollo Local (Para Probar)

**Ideal para:** Desarrollo y pruebas  
**Costo:** Gratis  
**Tiempo:** 2 minutos

**Windows:**
```bash
start-local.bat
```

**Mac/Linux:**
```bash
chmod +x start-local.sh
./start-local.sh
```

O manualmente:
```bash
docker-compose up -d
```

Accede a: http://localhost:3000

---

## 🔑 Variables de Entorno Necesarias

Todas las opciones requieren estas variables. Copia `.env.example` a `.env` y configura:

```env
# Base de datos (Railway/Supabase te la dan)
DATABASE_URL="postgresql://user:password@host:5432/harrys_boutique"

# NextAuth (genera con: openssl rand -base64 32)
NEXTAUTH_SECRET="tu-secret-aqui-min-32-caracteres"
NEXTAUTH_URL="https://tu-dominio.com"

# Vercel Blob Storage (gratis en Vercel Dashboard)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# MercadoPago (obtén en mercadopago.com/developers)
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-..."
MERCADOPAGO_WEBHOOK_SECRET="..."

# Resend (gratis hasta 3000 emails/mes)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@tu-dominio.com"
```

---

## 📖 Documentación Completa

- **`QUICK_START.md`** - Inicio rápido con comparación de opciones
- **`DEPLOYMENT.md`** - Guía detallada paso a paso
- **`DEPLOYMENT_CHECKLIST.md`** - Checklist para no olvidar nada
- **`COMMANDS.md`** - Comandos útiles de Docker, NPM, etc.
- **`README.md`** - Documentación general del proyecto

---

## 🎯 Flujo de Trabajo Recomendado

### 1. Desarrollo Local

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Hacer cambios en tu código
# ...

# Detener servicios
docker-compose down
```

### 2. Subir Cambios

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

### 3. Despliegue Automático

- **Railway/Vercel:** Despliegan automáticamente en 2-3 minutos
- **VPS:** Usa GitHub Actions (ya configurado en `.github/workflows/deploy.yml`)

---

## 🐳 Comandos Docker Útiles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f app

# Detener servicios
docker-compose down

# Reconstruir después de cambios
docker-compose up -d --build

# Acceder a la base de datos
docker-compose exec db psql -U postgres -d harrys_boutique

# Ver servicios corriendo
docker-compose ps

# Ejecutar migraciones
docker-compose exec app npx prisma migrate deploy

# Abrir Prisma Studio (UI para ver/editar datos)
docker-compose exec app npx prisma studio
```

---

## 🆘 Problemas Comunes

### "Cannot connect to database"
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps
docker-compose logs db
```

### "Port 3000 already in use"
```bash
# Detener servicios
docker-compose down
```

### "Prisma Client not generated"
```bash
# Regenerar Prisma Client
docker-compose exec app npx prisma generate
```

### Ver logs de errores
```bash
docker-compose logs -f app
```

---

## ✅ Checklist Antes de Producción

Antes de lanzar a producción, asegúrate de:

- [ ] Generar `NEXTAUTH_SECRET` único: `openssl rand -base64 32`
- [ ] Configurar credenciales de MercadoPago de **PRODUCCIÓN** (no test)
- [ ] Configurar Vercel Blob Storage
- [ ] Configurar Resend con dominio verificado
- [ ] Probar flujo completo de compra
- [ ] Configurar webhooks de MercadoPago
- [ ] Hacer backup de la base de datos
- [ ] Cambiar contraseña de admin por defecto

Ver `DEPLOYMENT_CHECKLIST.md` para el checklist completo.

---

## 🎉 ¡Listo para Desplegar!

### Opción Rápida (Railway)

1. Ve a [railway.app](https://railway.app)
2. Conecta tu GitHub
3. Selecciona tu repositorio
4. Agrega PostgreSQL
5. Configura variables de entorno
6. ¡Despliega!

### Opción Local (Probar Primero)

```bash
# Windows
start-local.bat

# Mac/Linux
./start-local.sh
```

Accede a: http://localhost:3000

---

## 📞 ¿Necesitas Ayuda?

1. Revisa `DEPLOYMENT.md` para guías detalladas
2. Revisa `COMMANDS.md` para comandos útiles
3. Revisa los logs: `docker-compose logs -f app`
4. Verifica las variables de entorno en `.env`

---

## 🔄 Actualizar Después de Cambios

```bash
# 1. Hacer cambios en tu código
# 2. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 3. Railway/Vercel despliegan automáticamente
# 4. Para VPS con Docker:
ssh user@servidor
cd /opt/harrys-boutique/harrys-boutique-next
git pull origin main
docker-compose up -d --build
```

---

## 📊 Comparación Rápida

| Opción | Facilidad | Costo/mes | PostgreSQL | SSL | Auto-deploy |
|--------|-----------|-----------|------------|-----|-------------|
| **Railway** | ⭐⭐⭐⭐⭐ | $10-20 | ✅ Incluido | ✅ Auto | ✅ Sí |
| **Vercel+Supabase** | ⭐⭐⭐⭐ | Gratis-$20 | ⚠️ Separado | ✅ Auto | ✅ Sí |
| **VPS Docker** | ⭐⭐ | $5-10 | ✅ Incluido | ⚠️ Manual | ⚠️ Con CI/CD |
| **Local** | ⭐⭐⭐⭐⭐ | Gratis | ✅ Incluido | ❌ N/A | ❌ N/A |

---

## 🚀 Mi Recomendación

1. **Primero:** Prueba localmente con `docker-compose up -d`
2. **Luego:** Despliega en Railway (más fácil)
3. **Opcional:** Migra a VPS cuando necesites más control

---

¡Éxito con tu despliegue! 🎉
