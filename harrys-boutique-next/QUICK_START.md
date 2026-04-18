# ⚡ Inicio Rápido - Harry's Boutique

## 🎯 Opciones de Despliegue

### 1️⃣ Railway (Más Fácil) ⭐ RECOMENDADO

**Tiempo:** 5 minutos  
**Costo:** $5/mes gratis, luego ~$10-20/mes  
**Ideal para:** Producción rápida

```bash
1. Ve a railway.app
2. Conecta tu GitHub
3. Selecciona tu repositorio
4. Agrega PostgreSQL (1 click)
5. Configura variables de entorno
6. ¡Listo! 🚀
```

**Ventajas:**
- ✅ PostgreSQL incluido
- ✅ SSL automático
- ✅ Auto-deploy en cada push
- ✅ Fácil de configurar

**Desventajas:**
- ❌ Costo mensual después del tier gratuito

---

### 2️⃣ Vercel + Supabase (Más Rápido)

**Tiempo:** 5 minutos  
**Costo:** Gratis hasta cierto límite  
**Ideal para:** Proyectos pequeños/medianos

```bash
1. Crea DB en supabase.com (gratis)
2. Despliega en vercel.com
3. Conecta tu GitHub
4. Configura variables de entorno
5. ¡Listo! 🚀
```

**Ventajas:**
- ✅ Tier gratuito generoso
- ✅ Despliegue ultra rápido
- ✅ Vercel es el creador de Next.js

**Desventajas:**
- ❌ Requiere configurar DB por separado

---

### 3️⃣ Docker en VPS (Más Control)

**Tiempo:** 30-60 minutos  
**Costo:** $5-10/mes (DigitalOcean, Linode)  
**Ideal para:** Control total, múltiples proyectos

```bash
# En tu servidor
git clone <tu-repo>
cd harrys-boutique-next
docker-compose up -d
```

**Ventajas:**
- ✅ Control total
- ✅ Costo predecible
- ✅ Puedes alojar múltiples apps

**Desventajas:**
- ❌ Requiere conocimientos de servidores
- ❌ Debes configurar SSL, backups, etc.

---

### 4️⃣ Desarrollo Local (Para Probar)

**Tiempo:** 2 minutos  
**Costo:** Gratis  
**Ideal para:** Desarrollo y pruebas

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

Todas las opciones requieren estas variables:

```env
# Base de datos (Railway/Supabase te la dan)
DATABASE_URL="postgresql://..."

# NextAuth (genera con: openssl rand -base64 32)
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="https://tu-dominio.com"

# Vercel Blob (gratis en Vercel Dashboard)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# MercadoPago (obtén en mercadopago.com/developers)
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-..."
MERCADOPAGO_WEBHOOK_SECRET="..."

# Resend (gratis hasta 3000 emails/mes)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@tu-dominio.com"
```

---

## 🚀 Flujo de Trabajo Recomendado

### Para Desarrollo
```bash
# 1. Trabaja localmente con Docker
docker-compose up -d

# 2. Haz cambios en tu código
# 3. Prueba localmente

# 4. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

### Para Producción
```bash
# Railway/Vercel despliegan automáticamente
# Solo haz push a main y espera 2-3 minutos
```

---

## 📊 Comparación Rápida

| Característica | Railway | Vercel+Supabase | VPS Docker | Local |
|---------------|---------|-----------------|------------|-------|
| Facilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Costo | $10-20/mes | Gratis-$20/mes | $5-10/mes | Gratis |
| PostgreSQL | ✅ Incluido | ⚠️ Separado | ✅ Incluido | ✅ Incluido |
| SSL | ✅ Auto | ✅ Auto | ⚠️ Manual | ❌ N/A |
| Auto-deploy | ✅ Sí | ✅ Sí | ⚠️ Con CI/CD | ❌ N/A |
| Escalabilidad | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

---

## 🎯 Recomendación por Caso de Uso

### "Quiero lanzar rápido y no complicarme"
→ **Railway** - Todo incluido, fácil de usar

### "Quiero el mejor rendimiento para Next.js"
→ **Vercel + Supabase** - Optimizado para Next.js

### "Quiero control total y bajo costo"
→ **VPS con Docker** - Máximo control

### "Solo quiero probar localmente"
→ **Docker local** - Rápido y fácil

---

## 📖 Documentación Completa

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía detallada de despliegue
- [README.md](./README.md) - Documentación general del proyecto

---

## 🆘 Ayuda Rápida

### Error: "Cannot connect to database"
```bash
# Verifica que PostgreSQL esté corriendo
docker-compose ps
docker-compose logs db
```

### Error: "Port 3000 already in use"
```bash
# Detén otros servicios en el puerto 3000
docker-compose down
```

### Error: "Prisma Client not generated"
```bash
# Regenera Prisma Client
docker-compose exec app npx prisma generate
```

### Ver logs en tiempo real
```bash
docker-compose logs -f app
```

---

## ✅ Checklist Pre-Producción

Antes de lanzar a producción:

- [ ] Generar `NEXTAUTH_SECRET` único
- [ ] Configurar dominio personalizado
- [ ] Obtener tokens de MercadoPago (producción)
- [ ] Configurar Vercel Blob Storage
- [ ] Configurar Resend con dominio verificado
- [ ] Probar flujo completo de compra
- [ ] Configurar webhooks de MercadoPago
- [ ] Hacer backup de la base de datos
- [ ] Configurar monitoreo de errores (opcional)

---

¿Listo para desplegar? Elige tu opción favorita arriba y sigue los pasos. 🚀
