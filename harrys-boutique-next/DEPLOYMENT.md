# 🚀 Guía de Despliegue - Harry's Boutique

Esta guía cubre múltiples opciones para desplegar tu aplicación Next.js con PostgreSQL.

---

## 📋 Tabla de Contenidos

1. [Desarrollo Local con Docker](#-desarrollo-local-con-docker)
2. [Despliegue en Railway (Recomendado)](#-despliegue-en-railway-recomendado)
3. [Despliegue en Vercel + Supabase](#-despliegue-en-vercel--supabase)
4. [Despliegue en VPS (DigitalOcean, AWS, etc.)](#-despliegue-en-vps)
5. [CI/CD con GitHub Actions](#-cicd-con-github-actions)

---

## 🐳 Desarrollo Local con Docker

### Requisitos Previos
- Docker Desktop instalado
- Git configurado

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo>
   cd harrys-boutique-next
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` con tus credenciales:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@db:5432/harrys_boutique"
   NEXTAUTH_SECRET="tu-secret-generado"
   BLOB_READ_WRITE_TOKEN="tu-token-vercel-blob"
   # ... resto de variables
   ```

3. **Iniciar servicios**
   ```bash
   # Iniciar PostgreSQL + Next.js
   docker-compose up -d
   
   # Ver logs
   docker-compose logs -f app
   
   # Acceder a la app
   # http://localhost:3000
   ```

4. **Comandos útiles**
   ```bash
   # Detener servicios
   docker-compose down
   
   # Reconstruir después de cambios
   docker-compose up -d --build
   
   # Acceder a la base de datos
   docker-compose exec db psql -U postgres -d harrys_boutique
   
   # Ver logs de un servicio específico
   docker-compose logs -f app
   docker-compose logs -f db
   
   # Iniciar con pgAdmin (UI para PostgreSQL)
   docker-compose --profile tools up -d
   # Acceder a pgAdmin: http://localhost:5050
   # Email: admin@harrys.com / Password: admin
   ```

---

## 🚂 Despliegue en Railway (Recomendado)

Railway es ideal porque maneja PostgreSQL y Next.js automáticamente.

### Ventajas
- ✅ PostgreSQL incluido (sin configuración extra)
- ✅ SSL automático
- ✅ Despliegue desde GitHub
- ✅ Variables de entorno fáciles
- ✅ $5/mes de crédito gratis

### Pasos

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Conecta tu cuenta de GitHub

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio `harrys-boutique-next`

3. **Agregar PostgreSQL**
   - En tu proyecto, click en "+ New"
   - Selecciona "Database" → "PostgreSQL"
   - Railway creará automáticamente la variable `DATABASE_URL`

4. **Configurar variables de entorno**
   
   En el servicio de Next.js, ve a "Variables" y agrega:
   
   ```env
   # NextAuth
   NEXTAUTH_SECRET=<genera con: openssl rand -base64 32>
   NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   
   # Vercel Blob
   BLOB_READ_WRITE_TOKEN=<tu-token-de-vercel>
   
   # MercadoPago
   MERCADOPAGO_ACCESS_TOKEN=<tu-access-token>
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=<tu-public-key>
   MERCADOPAGO_WEBHOOK_SECRET=<tu-webhook-secret>
   
   # Resend
   RESEND_API_KEY=<tu-api-key>
   RESEND_FROM_EMAIL=noreply@tu-dominio.com
   
   # App
   NEXT_PUBLIC_FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   ```

5. **Configurar dominio personalizado (opcional)**
   - En "Settings" → "Domains"
   - Agrega tu dominio personalizado
   - Configura los DNS según las instrucciones

6. **Desplegar**
   - Railway desplegará automáticamente
   - Cada push a `main` desplegará automáticamente

### Actualizar después de cambios

```bash
# Hacer cambios en tu código
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# Railway desplegará automáticamente en ~2-3 minutos
```

---

## ▲ Despliegue en Vercel + Supabase

### Ventajas
- ✅ Vercel es el creador de Next.js (mejor soporte)
- ✅ Despliegue ultra rápido
- ✅ Supabase tiene tier gratuito generoso

### Pasos

1. **Crear base de datos en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Copia la `DATABASE_URL` desde "Project Settings" → "Database"

2. **Desplegar en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Import Project"
   - Conecta tu repositorio de GitHub
   - Configura las variables de entorno (igual que Railway)

3. **Configurar Vercel Blob Storage**
   - En tu proyecto de Vercel, ve a "Storage"
   - Crea un "Blob Store"
   - Copia el `BLOB_READ_WRITE_TOKEN`

4. **Configurar webhooks de MercadoPago**
   - URL del webhook: `https://tu-dominio.vercel.app/api/webhooks/mercadopago`

### Actualizar después de cambios

```bash
git push origin main
# Vercel desplegará automáticamente en ~1 minuto
```

---

## 🖥️ Despliegue en VPS

Para desplegar en un servidor propio (DigitalOcean, AWS EC2, Linode, etc.)

### Requisitos
- VPS con Ubuntu 22.04+
- Dominio apuntando al servidor
- Acceso SSH

### Pasos

1. **Conectar al servidor**
   ```bash
   ssh root@tu-servidor-ip
   ```

2. **Instalar dependencias**
   ```bash
   # Actualizar sistema
   apt update && apt upgrade -y
   
   # Instalar Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Instalar Docker Compose
   apt install docker-compose -y
   
   # Instalar Nginx
   apt install nginx -y
   
   # Instalar Certbot (SSL gratis)
   apt install certbot python3-certbot-nginx -y
   ```

3. **Clonar repositorio**
   ```bash
   cd /opt
   git clone <tu-repo> harrys-boutique
   cd harrys-boutique/harrys-boutique-next
   ```

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   nano .env
   # Edita las variables necesarias
   ```

5. **Iniciar servicios**
   ```bash
   docker-compose up -d
   ```

6. **Configurar Nginx como proxy reverso**
   ```bash
   nano /etc/nginx/sites-available/harrys-boutique
   ```
   
   Contenido:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com www.tu-dominio.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   
   Activar configuración:
   ```bash
   ln -s /etc/nginx/sites-available/harrys-boutique /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

7. **Configurar SSL con Let's Encrypt**
   ```bash
   certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
   ```

8. **Configurar auto-despliegue con webhook**
   
   Crear script de actualización:
   ```bash
   nano /opt/harrys-boutique/deploy.sh
   ```
   
   Contenido:
   ```bash
   #!/bin/bash
   cd /opt/harrys-boutique/harrys-boutique-next
   git pull origin main
   docker-compose up -d --build
   ```
   
   Hacer ejecutable:
   ```bash
   chmod +x /opt/harrys-boutique/deploy.sh
   ```

### Actualizar después de cambios

```bash
# Opción 1: Manual
ssh root@tu-servidor-ip
cd /opt/harrys-boutique/harrys-boutique-next
git pull origin main
docker-compose up -d --build

# Opción 2: Automático con GitHub Actions (ver siguiente sección)
```

---

## 🔄 CI/CD con GitHub Actions

Automatiza el despliegue cada vez que haces push a `main`.

### Para Railway/Vercel
Ya está configurado automáticamente. Cada push despliega automáticamente.

### Para VPS

1. **Generar clave SSH en el servidor**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions"
   cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
   cat ~/.ssh/id_ed25519  # Copiar esta clave privada
   ```

2. **Agregar secretos en GitHub**
   - Ve a tu repositorio → Settings → Secrets and variables → Actions
   - Agrega estos secretos:
     - `VPS_HOST`: IP de tu servidor
     - `VPS_USER`: usuario SSH (ej: `root`)
     - `VPS_SSH_KEY`: clave privada copiada arriba

3. **Crear workflow de GitHub Actions**
   
   El archivo ya está creado en `.github/workflows/deploy.yml`

### Actualizar después de cambios

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# GitHub Actions desplegará automáticamente
# Puedes ver el progreso en: https://github.com/tu-usuario/tu-repo/actions
```

---

## 🔧 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de la base de datos
docker-compose logs db

# Verificar la conexión
docker-compose exec db psql -U postgres -d harrys_boutique
```

### Error: "Prisma Client not generated"
```bash
# Regenerar Prisma Client
docker-compose exec app npx prisma generate

# O reconstruir el contenedor
docker-compose up -d --build
```

### Error: "Port 3000 already in use"
```bash
# Encontrar el proceso usando el puerto
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Matar el proceso o cambiar el puerto en docker-compose.yml
```

### Migraciones no se aplican
```bash
# Aplicar migraciones manualmente
docker-compose exec app npx prisma migrate deploy

# Ver estado de migraciones
docker-compose exec app npx prisma migrate status
```

---

## 📊 Monitoreo y Logs

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo la app
docker-compose logs -f app

# Solo la base de datos
docker-compose logs -f db

# Últimas 100 líneas
docker-compose logs --tail=100 app
```

### Acceder a la base de datos
```bash
# Desde Docker
docker-compose exec db psql -U postgres -d harrys_boutique

# Desde pgAdmin (si está corriendo)
# http://localhost:5050
# Email: admin@harrys.com / Password: admin
```

---

## 🔐 Seguridad

### Checklist antes de producción

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Generar `NEXTAUTH_SECRET` único: `openssl rand -base64 32`
- [ ] Configurar CORS correctamente
- [ ] Habilitar HTTPS/SSL
- [ ] Configurar rate limiting
- [ ] Hacer backup de la base de datos
- [ ] Configurar monitoreo de errores (Sentry)
- [ ] Revisar variables de entorno sensibles

### Backup de base de datos

```bash
# Crear backup
docker-compose exec db pg_dump -U postgres harrys_boutique > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres harrys_boutique < backup.sql
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica las variables de entorno en `.env`
3. Asegúrate de que todos los servicios estén corriendo: `docker-compose ps`
4. Revisa la documentación de Railway/Vercel según tu plataforma

---

## 🎉 ¡Listo!

Tu aplicación debería estar corriendo. Accede a:

- **App**: http://localhost:3000 (local) o tu dominio
- **Admin**: http://localhost:3000/admin
- **API Health**: http://localhost:3000/api/health
- **pgAdmin**: http://localhost:5050 (solo local con `--profile tools`)
