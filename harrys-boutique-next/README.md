# 🛍️ Harry's Boutique - Next.js E-commerce

Aplicación de e-commerce completa construida con Next.js 15, PostgreSQL, Prisma, NextAuth y MercadoPago.

## 🚀 Inicio Rápido

### Desarrollo Local con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd harrys-boutique-next

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# 3. Iniciar servicios (PostgreSQL + Next.js)
docker-compose up -d

# 4. Ver logs
docker-compose logs -f app

# 5. Acceder a la aplicación
# http://localhost:3000
```

**Windows:** Ejecuta `start-local.bat`  
**Mac/Linux:** Ejecuta `./start-local.sh`

### Desarrollo Local sin Docker

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar PostgreSQL local
# Asegúrate de tener PostgreSQL corriendo en localhost:5432

# 3. Configurar .env
cp .env.example .env
# Edita DATABASE_URL y otras variables

# 4. Generar Prisma Client
npm run db:generate

# 5. Ejecutar migraciones
npm run db:migrate

# 6. Iniciar servidor de desarrollo
npm run dev
```

## 📦 Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticación:** NextAuth v5
- **Pagos:** MercadoPago
- **Storage:** Vercel Blob
- **Emails:** Resend
- **UI:** Tailwind CSS + Framer Motion
- **Testing:** Vitest + Testing Library

## 🏗️ Estructura del Proyecto

```
harrys-boutique-next/
├── src/
│   ├── app/
│   │   ├── (store)/          # Tienda (cliente)
│   │   ├── (admin)/          # Panel de administración
│   │   └── api/              # API Routes (backend)
│   ├── components/           # Componentes reutilizables
│   ├── lib/                  # Utilidades y configuración
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma         # Esquema de base de datos
│   └── migrations/           # Migraciones
├── public/                   # Archivos estáticos
├── docker-compose.yml        # Configuración Docker
├── Dockerfile                # Imagen Docker
└── DEPLOYMENT.md             # Guía completa de despliegue
```

## 🌐 Despliegue

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para guías detalladas de despliegue en:

- **Railway** (Recomendado) - PostgreSQL incluido
- **Vercel + Supabase** - Despliegue ultra rápido
- **VPS** (DigitalOcean, AWS, etc.) - Control completo
- **Docker** - Cualquier plataforma

### Despliegue Rápido en Railway

1. Crea cuenta en [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Agrega PostgreSQL desde el dashboard
4. Configura variables de entorno
5. ¡Despliega! 🚀

Cada push a `main` desplegará automáticamente.

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar servidor de producción

# Base de datos
npm run db:migrate       # Ejecutar migraciones
npm run db:push          # Push schema sin migración
npm run db:studio        # Abrir Prisma Studio
npm run db:generate      # Generar Prisma Client

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch

# Calidad de código
npm run lint             # Ejecutar linter
npm run lint:fix         # Arreglar problemas de lint
npm run type-check       # Verificar tipos TypeScript
npm run ci               # Ejecutar todos los checks
```

## 🐳 Comandos Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app
docker-compose logs -f db

# Detener servicios
docker-compose down

# Reconstruir después de cambios
docker-compose up -d --build

# Acceder a la base de datos
docker-compose exec db psql -U postgres -d harrys_boutique

# Iniciar con pgAdmin (UI para PostgreSQL)
docker-compose --profile tools up -d
# Acceder: http://localhost:5050
```

## 🔐 Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@host:5432/harrys_boutique"

# NextAuth
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="tu-token-de-vercel"

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN="tu-access-token"
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="tu-public-key"

# Resend (emails)
RESEND_API_KEY="tu-api-key"
RESEND_FROM_EMAIL="noreply@tu-dominio.com"
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test -- --coverage
```

## 📝 Características

### Tienda (Cliente)
- ✅ Catálogo de productos con filtros
- ✅ Carrito de compras
- ✅ Checkout con MercadoPago
- ✅ Autenticación de usuarios
- ✅ Historial de pedidos
- ✅ Sistema de reseñas

### Panel de Administración
- ✅ Gestión de productos (CRUD)
- ✅ Gestión de categorías
- ✅ Gestión de pedidos
- ✅ Dashboard con estadísticas
- ✅ Gestión de hero slides
- ✅ Configuración de la tienda

### Backend (API Routes)
- ✅ RESTful API
- ✅ Autenticación con NextAuth
- ✅ Integración con MercadoPago
- ✅ Upload de imágenes a Vercel Blob
- ✅ Envío de emails transaccionales
- ✅ Rate limiting
- ✅ Manejo de errores

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 📞 Soporte

Para problemas o preguntas:
- Revisa [DEPLOYMENT.md](./DEPLOYMENT.md)
- Revisa los logs: `docker-compose logs -f`
- Verifica las variables de entorno en `.env`

---

Hecho con ❤️ para Harry's Boutique
