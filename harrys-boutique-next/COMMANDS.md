# 🛠️ Comandos Útiles - Harry's Boutique

Referencia rápida de comandos para desarrollo y despliegue.

---

## 🐳 Docker

### Comandos Básicos

```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar con logs visibles
docker-compose up

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra la DB)
docker-compose down -v

# Reconstruir después de cambios en Dockerfile
docker-compose up -d --build

# Reconstruir sin caché
docker-compose build --no-cache
docker-compose up -d
```

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo la app
docker-compose logs -f app

# Solo la base de datos
docker-compose logs -f db

# Últimas 100 líneas
docker-compose logs --tail=100 app

# Logs desde hace 10 minutos
docker-compose logs --since 10m app
```

### Estado de Servicios

```bash
# Ver servicios corriendo
docker-compose ps

# Ver uso de recursos
docker stats

# Inspeccionar un contenedor
docker inspect harrys-app
```

### Acceso a Contenedores

```bash
# Ejecutar comando en la app
docker-compose exec app npm run db:studio

# Abrir shell en la app
docker-compose exec app sh

# Acceder a PostgreSQL
docker-compose exec db psql -U postgres -d harrys_boutique

# Ejecutar comando SQL
docker-compose exec db psql -U postgres -d harrys_boutique -c "SELECT * FROM users LIMIT 5;"
```

---

## 🗄️ Base de Datos

### Prisma

```bash
# Generar Prisma Client
npm run db:generate
# o
docker-compose exec app npx prisma generate

# Crear nueva migración
npm run db:migrate
# o
docker-compose exec app npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npm run db:push
# o
docker-compose exec app npx prisma migrate deploy

# Abrir Prisma Studio (UI para ver/editar datos)
npm run db:studio
# o
docker-compose exec app npx prisma studio

# Ver estado de migraciones
docker-compose exec app npx prisma migrate status

# Resetear base de datos (⚠️ borra todos los datos)
docker-compose exec app npx prisma migrate reset
```

### PostgreSQL Directo

```bash
# Conectar a la base de datos
docker-compose exec db psql -U postgres -d harrys_boutique

# Crear backup
docker-compose exec db pg_dump -U postgres harrys_boutique > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T db psql -U postgres harrys_boutique < backup.sql

# Ver tablas
docker-compose exec db psql -U postgres -d harrys_boutique -c "\dt"

# Ver tamaño de la base de datos
docker-compose exec db psql -U postgres -d harrys_boutique -c "SELECT pg_size_pretty(pg_database_size('harrys_boutique'));"

# Ver conexiones activas
docker-compose exec db psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

---

## 📦 NPM

### Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start

# Limpiar caché de Next.js
rm -rf .next
npm run build
```

### Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test -- --coverage

# Tests de un archivo específico
npm run test -- src/components/Button.test.tsx
```

### Calidad de Código

```bash
# Ejecutar linter
npm run lint

# Arreglar problemas de lint automáticamente
npm run lint:fix

# Verificar tipos TypeScript
npm run type-check

# Ejecutar todos los checks (CI)
npm run ci
```

---

## 🚀 Despliegue

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Vincular proyecto
railway link

# Ver logs
railway logs

# Ejecutar comando en Railway
railway run npm run db:migrate

# Abrir dashboard
railway open
```

### Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar a preview
vercel

# Desplegar a producción
vercel --prod

# Ver logs
vercel logs

# Ver variables de entorno
vercel env ls
```

### VPS (SSH)

```bash
# Conectar al servidor
ssh user@your-server-ip

# Actualizar código
cd /opt/harrys-boutique/harrys-boutique-next
git pull origin main
docker-compose up -d --build

# Ver logs
docker-compose logs -f app

# Reiniciar servicios
docker-compose restart

# Ver uso de disco
df -h

# Ver uso de memoria
free -h
```

---

## 🔍 Debugging

### Ver Variables de Entorno

```bash
# En Docker
docker-compose exec app env | grep DATABASE_URL

# En local
echo $DATABASE_URL
```

### Verificar Conectividad

```bash
# Ping a la base de datos
docker-compose exec app ping db

# Verificar puerto de PostgreSQL
docker-compose exec app nc -zv db 5432

# Verificar que la app esté respondiendo
curl http://localhost:3000/api/health
```

### Limpiar Todo

```bash
# Detener y eliminar contenedores, redes, volúmenes
docker-compose down -v

# Eliminar imágenes de Docker
docker rmi harrys-boutique-next-app

# Limpiar caché de Docker
docker system prune -a

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitoreo

### Logs en Producción

```bash
# Railway
railway logs --tail 100

# Vercel
vercel logs --follow

# VPS
ssh user@server "cd /opt/harrys-boutique/harrys-boutique-next && docker-compose logs -f app"
```

### Métricas

```bash
# Ver uso de recursos en Docker
docker stats harrys-app harrys-postgres

# Ver procesos en el contenedor
docker-compose exec app ps aux

# Ver espacio en disco
docker-compose exec app df -h
```

---

## 🔐 Seguridad

### Generar Secretos

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# UUID
uuidgen

# Password seguro
openssl rand -base64 24
```

### Rotar Credenciales

```bash
# 1. Generar nuevo secret
NEW_SECRET=$(openssl rand -base64 32)

# 2. Actualizar en .env
echo "NEXTAUTH_SECRET=$NEW_SECRET" >> .env

# 3. Reiniciar servicios
docker-compose restart app
```

---

## 🧹 Mantenimiento

### Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas las dependencias
npm update

# Actualizar una dependencia específica
npm install next@latest

# Actualizar dependencias de desarrollo
npm update --dev
```

### Limpiar Logs

```bash
# Limpiar logs de Docker
docker-compose logs --tail=0 app > /dev/null

# Rotar logs (en VPS)
sudo logrotate -f /etc/logrotate.conf
```

### Backup Automático

```bash
# Crear script de backup (backup.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U postgres harrys_boutique > "backups/backup_$DATE.sql"
find backups/ -name "*.sql" -mtime +7 -delete  # Eliminar backups > 7 días

# Hacer ejecutable
chmod +x backup.sh

# Agregar a crontab (ejecutar diariamente a las 2 AM)
crontab -e
# Agregar: 0 2 * * * /opt/harrys-boutique/backup.sh
```

---

## 🆘 Comandos de Emergencia

### App No Responde

```bash
# 1. Ver logs
docker-compose logs --tail=50 app

# 2. Reiniciar app
docker-compose restart app

# 3. Si no funciona, reconstruir
docker-compose up -d --build --force-recreate app
```

### Base de Datos Corrupta

```bash
# 1. Detener servicios
docker-compose down

# 2. Restaurar desde backup
docker-compose up -d db
docker-compose exec -T db psql -U postgres harrys_boutique < backup.sql

# 3. Reiniciar app
docker-compose up -d app
```

### Disco Lleno

```bash
# Ver uso de disco
df -h

# Limpiar logs de Docker
docker system prune -a --volumes

# Limpiar builds de Next.js
rm -rf .next

# Limpiar node_modules
rm -rf node_modules
npm install
```

---

## 📚 Referencias

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference)
- [Next.js CLI](https://nextjs.org/docs/app/api-reference/next-cli)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Vercel CLI](https://vercel.com/docs/cli)

---

💡 **Tip:** Guarda este archivo en tus favoritos para acceso rápido a comandos comunes.
