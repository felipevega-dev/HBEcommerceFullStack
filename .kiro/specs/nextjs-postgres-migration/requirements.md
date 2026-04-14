# Requirements Document

## Introduction

Este documento describe los requisitos para la migración completa de Harry's Boutique — un e-commerce de ropa y accesorios para mascotas — desde su stack actual (React + Vite + Node.js/Express + MongoDB, tres aplicaciones separadas) hacia un stack unificado basado en Next.js 15 (App Router) con PostgreSQL gestionado en Railway y Prisma como ORM.

La migración consolida el frontend público (puerto 5173), el panel de administración (puerto 5174) y el backend Express (puerto 4000) en una única aplicación Next.js. Se mantienen los integradores externos existentes (MercadoPago, Cloudinary) y se incorporan nuevas capacidades: emails transaccionales con Resend + React Email, estado global con Zustand, fetching con TanStack Query v5, validación con React Hook Form + Zod, y Tailwind CSS v4.

El objetivo es lograr la migración sin downtime para los usuarios finales, preservando todos los datos existentes en MongoDB y garantizando paridad funcional completa antes del cutover.

---

## Glossary

- **Migration_System**: El conjunto de scripts y procesos responsables de trasladar datos de MongoDB a PostgreSQL.
- **Next_App**: La nueva aplicación Next.js 15 unificada que reemplaza las tres aplicaciones actuales.
- **Auth_System**: El subsistema de autenticación basado en NextAuth.js v5 con provider de credenciales y sesiones JWT.
- **Prisma_Client**: El cliente ORM singleton de Prisma que gestiona todas las interacciones con PostgreSQL.
- **API_Routes**: Las rutas de API de Next.js (`/api/*`) que reemplazan los endpoints Express actuales.
- **Store_Frontend**: El grupo de rutas públicas `(store)` del App Router, equivalente al frontend actual en puerto 5173.
- **Admin_Panel**: El grupo de rutas protegidas `(admin)` del App Router bajo `/admin/*`, equivalente a la app admin actual en puerto 5174.
- **Zustand_Store**: El store de estado global que reemplaza el `ShopContext` actual de React Context.
- **Email_Service**: El servicio de emails transaccionales basado en Resend + React Email.
- **Coupon**: Entidad nueva que representa un código de descuento con porcentaje, monto fijo, fecha de expiración y límite de usos.
- **Wishlist**: Entidad nueva que representa la lista de deseos de un usuario (tabla de unión User-Product).
- **Cart**: Entidad persistida en base de datos que reemplaza el campo `cartData` embebido en el modelo User de MongoDB.
- **Address**: Entidad normalizada que reemplaza el array `billingAddresses` embebido en el modelo User de MongoDB.
- **Railway**: Plataforma de deploy que aloja tanto la aplicación Next.js como la base de datos PostgreSQL.
- **Cutover**: El momento de cambio de DNS/deploy en que el tráfico de producción se redirige de la app actual a la nueva.
- **ObjectId**: Identificador único de MongoDB (24 caracteres hexadecimales) que debe mapearse a UUID o entero autoincremental en PostgreSQL.

---

## Requirements

### Requirement 1: Inicialización y configuración del proyecto Next.js 15

**User Story:** Como desarrollador, quiero inicializar el proyecto Next.js 15 con todas las dependencias y configuraciones necesarias, para que el entorno de desarrollo esté listo antes de comenzar la migración de código.

#### Acceptance Criteria

1. THE Next_App SHALL ser inicializado con Next.js 15, App Router, TypeScript estricto y Tailwind CSS v4.
2. THE Next_App SHALL incluir Prisma configurado con el provider `postgresql` apuntando a la variable de entorno `DATABASE_URL`.
3. THE Next_App SHALL incluir un archivo `.env.example` con todas las variables requeridas: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `RESEND_API_KEY`, `NEXT_PUBLIC_FRONTEND_URL`.
4. WHEN la aplicación inicia en modo desarrollo, THE Next_App SHALL conectarse a PostgreSQL a través del Prisma_Client singleton sin abrir conexiones duplicadas por hot-reload.
5. IF alguna variable de entorno requerida está ausente al iniciar, THEN THE Next_App SHALL registrar un error descriptivo en consola indicando qué variable falta y detener el inicio.
6. THE Next_App SHALL estructurarse con los grupos de rutas `(store)` para el frontend público y `(admin)` para el panel de administración dentro del directorio `app/`.

---

### Requirement 2: Schema Prisma — modelos de datos

**User Story:** Como desarrollador, quiero definir el schema completo de Prisma que represente fielmente todos los datos actuales de MongoDB más las entidades nuevas, para que la base de datos PostgreSQL esté correctamente estructurada antes de la migración.

#### Acceptance Criteria

1. THE Prisma_Client SHALL definir un modelo `User` con campos: `id` (UUID), `name`, `email` (único), `password` (bcrypt hash), `role` (enum: `OWNER`, `ADMIN`, `MODERATOR`, `USER`, default `USER`), `profileImage`, `createdAt`, `updatedAt`; con relaciones a `Address[]`, `Cart`, `Order[]`, `Review[]`, `Wishlist[]`, `AuditLog[]`.
2. THE Prisma_Client SHALL definir un modelo `Address` con campos: `id`, `userId`, `firstname`, `lastname`, `phone`, `street`, `city`, `region`, `postalCode`, `country`, `isDefault` (boolean); con restricción de máximo 2 registros por usuario aplicada a nivel de aplicación.
3. THE Prisma_Client SHALL definir un modelo `Product` con campos: `id` (UUID), `name`, `description`, `price` (Decimal), `images` (String[]), `categoryId` (FK a `Category`), `subCategory`, `colors` (String[]), `sizes` (Json), `bestSeller` (boolean, default false), `ratingAverage` (Float, default 0), `ratingCount` (Int, default 0), `createdAt`; con relaciones a `Category`, `Review[]`, `OrderItem[]`, `Wishlist[]`, `HeroSlide[]`.
4. THE Prisma_Client SHALL definir un modelo `Category` con campos: `id`, `name` (único), `subcategories` (String[]), `createdAt`; con relación a `Product[]`.
5. THE Prisma_Client SHALL definir un modelo `Order` con campos: `id` (UUID), `userId`, `amount` (Decimal), `addressSnapshot` (Json — copia de la dirección al momento de la compra), `status` (enum: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, default `PENDING`), `paymentMethod`, `payment` (boolean, default false), `createdAt`; con relaciones a `User` y `OrderItem[]`.
5. THE Prisma_Client SHALL definir un modelo `OrderItem` con campos: `id`, `orderId`, `productId`, `name`, `price` (Decimal), `quantity`, `size`, `color`, `image`.
6. THE Prisma_Client SHALL definir un modelo `Review` con campos: `id`, `userId`, `productId`, `rating` (Int, 1–5), `comment` (máx. 500 caracteres), `createdAt`, `updatedAt`; con índice único compuesto `(userId, productId)`.
7. THE Prisma_Client SHALL definir un modelo `AuditLog` con campos: `id`, `userId`, `action`, `resource`, `resourceId`, `changes` (Json), `ip`, `userAgent`, `createdAt`.
8. THE Prisma_Client SHALL definir un modelo `Settings` con campos: `id`, `key` (único), `value` (String), `description`, `updatedAt`.
9. THE Prisma_Client SHALL definir un modelo `HeroSlide` con campos: `id`, `title`, `subtitle`, `image`, `productId` (FK a `Product`), `order` (Int, default 0), `createdAt`, `updatedAt`.
10. THE Prisma_Client SHALL definir un modelo `Cart` con campos: `id`, `userId` (único — un carrito por usuario), `updatedAt`; con relación a `CartItem[]`.
11. THE Prisma_Client SHALL definir un modelo `CartItem` con campos: `id`, `cartId`, `productId`, `quantity`, `size`, `color`.
12. THE Prisma_Client SHALL definir un modelo `Wishlist` con campos: `id`, `userId`, `productId`, `createdAt`; con índice único compuesto `(userId, productId)`.
13. THE Prisma_Client SHALL definir un modelo `Coupon` con campos: `id`, `code` (único, case-insensitive), `discountType` (enum: `PERCENTAGE`, `FIXED`), `discountValue` (Decimal), `minOrderAmount` (Decimal, nullable), `maxUses` (Int, nullable), `usedCount` (Int, default 0), `expiresAt` (DateTime, nullable), `active` (boolean, default true), `createdAt`.
14. WHEN se ejecuta `prisma migrate deploy`, THE Prisma_Client SHALL aplicar todas las migraciones pendientes sin errores en un entorno PostgreSQL limpio.

---

### Requirement 3: Script de migración de datos MongoDB → PostgreSQL

**User Story:** Como administrador del sistema, quiero ejecutar un script de migración que traslade todos los datos existentes de MongoDB a PostgreSQL, para que no se pierda ningún dato histórico durante el cambio de stack.

#### Acceptance Criteria

1. THE Migration_System SHALL leer todos los documentos de las colecciones `users`, `products`, `orders`, `categories`, `reviews`, `auditlogs`, `settings` y `heroslides` desde MongoDB usando la URI de conexión existente.
2. WHEN el Migration_System procesa un documento de MongoDB, THE Migration_System SHALL mapear el campo `_id` (ObjectId) a un UUID v4 determinístico derivado del ObjectId, preservando la trazabilidad entre sistemas.
3. THE Migration_System SHALL migrar el campo `cartData` (objeto anidado en `User`) a registros normalizados en las tablas `Cart` y `CartItem` de PostgreSQL.
4. THE Migration_System SHALL migrar el array `billingAddresses` (embebido en `User`) a registros individuales en la tabla `Address` de PostgreSQL, preservando el campo `isDefault`.
5. THE Migration_System SHALL migrar los hashes de contraseña bcrypt existentes sin modificación, dado que son compatibles con la nueva implementación.
6. WHEN el Migration_System encuentra una referencia a un `productId` o `userId` en colecciones relacionadas (orders, reviews, heroslides), THE Migration_System SHALL resolver la referencia al UUID correspondiente ya migrado.
7. WHEN el Migration_System completa la migración, THE Migration_System SHALL imprimir un reporte con: cantidad de documentos leídos por colección, cantidad de registros insertados en PostgreSQL, y lista de errores o registros omitidos.
8. IF el Migration_System encuentra un documento con datos inválidos o referencias rotas, THEN THE Migration_System SHALL registrar el error con el `_id` del documento afectado y continuar con el siguiente documento sin detener la migración completa.
9. THE Migration_System SHALL ser idempotente: ejecutarlo múltiples veces sobre una base de datos PostgreSQL ya migrada SHALL no crear duplicados (usar `upsert` con la clave derivada del ObjectId).
10. WHEN el Migration_System finaliza, THE Migration_System SHALL ejecutar consultas de validación que comparen los conteos de documentos en MongoDB con los conteos de registros en PostgreSQL para cada entidad, reportando discrepancias.

---

### Requirement 4: API Routes — migración de endpoints Express

**User Story:** Como desarrollador, quiero que todas las rutas del backend Express estén disponibles como API Routes de Next.js, para que el frontend pueda consumir la misma interfaz de API sin cambios en los contratos.

#### Acceptance Criteria

1. THE API_Routes SHALL implementar todos los endpoints actuales del backend Express bajo el prefijo `/api/` con los mismos métodos HTTP y contratos de request/response.
2. THE API_Routes SHALL incluir los siguientes grupos de rutas: `/api/auth`, `/api/products`, `/api/orders`, `/api/cart`, `/api/wishlist`, `/api/reviews`, `/api/coupons`, `/api/settings`, `/api/admin`, `/api/upload`, `/api/mercadopago`.
3. WHEN una API Route recibe una request, THE API_Routes SHALL validar el body usando un schema Zod específico para ese endpoint antes de procesar la lógica de negocio.
4. IF la validación Zod falla, THEN THE API_Routes SHALL retornar HTTP 400 con un objeto JSON que contenga el campo `errors` con los detalles de validación.
5. WHEN una API Route requiere autenticación, THE API_Routes SHALL verificar la sesión de NextAuth o el JWT antes de ejecutar la lógica, retornando HTTP 401 si la sesión es inválida o inexistente.
6. WHEN una API Route requiere rol de administrador, THE API_Routes SHALL verificar que el rol del usuario en sesión sea `OWNER`, `ADMIN` o `MODERATOR`, retornando HTTP 403 si el rol es insuficiente.
7. IF ocurre un error no controlado en una API Route, THEN THE API_Routes SHALL retornar HTTP 500 con un mensaje genérico sin exponer detalles internos del stack, y registrar el error completo en el sistema de logs.
8. THE API_Routes SHALL aplicar rate limiting de 100 requests por minuto por IP para endpoints generales, y 10 requests por minuto por IP para los endpoints de autenticación `/api/auth/login` y `/api/auth/register`.
9. THE API_Routes SHALL implementar el webhook de MercadoPago en `/api/mercadopago/webhook` verificando la firma del payload antes de procesar el evento de pago.
10. WHEN el webhook de MercadoPago recibe un evento de pago aprobado, THE API_Routes SHALL actualizar el estado de la orden correspondiente a `PROCESSING` y marcar `payment` como `true` en la misma transacción de base de datos.

---

### Requirement 5: Autenticación con NextAuth.js v5

**User Story:** Como usuario, quiero poder registrarme e iniciar sesión con email y contraseña, para que mis datos de sesión, carrito y órdenes estén asociados a mi cuenta de forma segura.

#### Acceptance Criteria

1. THE Auth_System SHALL implementar NextAuth.js v5 con el provider `Credentials` que valide email y contraseña contra los registros de la tabla `User` en PostgreSQL usando bcrypt.
2. WHEN un usuario se autentica exitosamente, THE Auth_System SHALL emitir un JWT de sesión que incluya los campos `id`, `email`, `name`, `role` y `profileImage`.
3. WHEN un usuario intenta iniciar sesión con credenciales incorrectas, THE Auth_System SHALL retornar un error genérico sin indicar si el email existe o no en el sistema.
4. THE Auth_System SHALL configurar las sesiones JWT con expiración de 7 días, renovándose automáticamente en cada request autenticado.
5. WHEN un usuario accede a una ruta protegida sin sesión activa, THE Auth_System SHALL redirigir al usuario a `/login` preservando la URL de destino como parámetro `callbackUrl`.
6. THE Auth_System SHALL proteger mediante middleware de Next.js todas las rutas bajo `/admin/*`, `/checkout`, `/orders`, `/profile` y `/wishlist`, verificando la existencia y validez de la sesión.
7. WHEN un usuario sin rol de administrador intenta acceder a una ruta bajo `/admin/*`, THE Auth_System SHALL redirigir al usuario a la página principal `/` con un mensaje de acceso denegado.
8. THE Auth_System SHALL exponer el endpoint `/api/auth/register` que cree un nuevo usuario con rol `USER`, hasheando la contraseña con bcrypt (salt rounds: 12) antes de persistir.
9. IF el email ya existe al registrarse, THEN THE Auth_System SHALL retornar HTTP 409 con el mensaje "El email ya está registrado".
10. THE Auth_System SHALL incluir protección CSRF en todos los formularios de autenticación mediante los tokens que provee NextAuth.js v5.

---

### Requirement 6: Frontend público migrado al App Router (Store)

**User Story:** Como cliente de Harry's Boutique, quiero navegar el catálogo, ver productos, gestionar mi carrito y realizar compras en la nueva aplicación, para que mi experiencia de compra sea idéntica o mejor que la actual.

#### Acceptance Criteria

1. THE Store_Frontend SHALL implementar todas las páginas actuales del frontend como rutas del App Router: `/` (Home), `/collection` (catálogo), `/product/[id]` (detalle), `/cart`, `/checkout`, `/orders`, `/profile`, `/wishlist`, `/about`, `/contact`, `/delivery`, `/politicas`, `/payment/success`, `/payment/failure`, `/payment/pending`.
2. THE Store_Frontend SHALL implementar las páginas `/collection` y `/product/[id]` como Server Components que obtengan datos directamente desde Prisma_Client, para que sean indexables por motores de búsqueda.
3. THE Store_Frontend SHALL usar la Metadata API de Next.js para definir `title`, `description` y `openGraph` en cada página, reemplazando el uso actual de `react-helmet-async`.
4. THE Store_Frontend SHALL usar el componente `next/image` para todas las imágenes de productos y assets, reemplazando las etiquetas `<img>` actuales.
5. THE Store_Frontend SHALL implementar el Zustand_Store con slices para: `cart` (items, total, acciones), `auth` (usuario en sesión), `ui` (modales, sidebar, searchbar), reemplazando el `ShopContext` actual.
6. WHEN el usuario agrega un producto al carrito, THE Store_Frontend SHALL persistir el carrito en la tabla `Cart` de PostgreSQL via `/api/cart` si el usuario está autenticado, o en `localStorage` si no lo está.
7. WHEN un usuario autenticado inicia sesión, THE Store_Frontend SHALL fusionar el carrito de `localStorage` con el carrito persistido en base de datos, sumando cantidades para items duplicados.
8. THE Store_Frontend SHALL implementar los filtros de catálogo (categoría, subcategoría, precio, color, talla, ordenamiento) como Client Components que actualicen los parámetros de URL sin recargar la página.
9. WHEN el usuario realiza una búsqueda de productos, THE Store_Frontend SHALL usar TanStack Query v5 para obtener resultados con debounce de 300ms y mostrar un estado de carga durante la búsqueda.
10. THE Store_Frontend SHALL implementar los formularios de checkout, registro y perfil usando React Hook Form con validación Zod, mostrando errores de validación inline junto a cada campo.

---

### Requirement 7: Panel de administración integrado

**User Story:** Como administrador de Harry's Boutique, quiero gestionar productos, órdenes, clientes, cupones y configuraciones desde el panel integrado en la misma aplicación Next.js, para que no necesite mantener una aplicación separada.

#### Acceptance Criteria

1. THE Admin_Panel SHALL implementar todas las páginas actuales del admin como rutas bajo `/admin/*`: `/admin/dashboard`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/orders`, `/admin/customers`, `/admin/coupons`, `/admin/settings`, `/admin/hero`.
2. THE Admin_Panel SHALL implementar el dashboard `/admin/dashboard` como Server Component que muestre: total de órdenes, ingresos del mes, productos activos, clientes registrados y últimas 5 órdenes.
3. WHEN un administrador crea o edita un producto, THE Admin_Panel SHALL subir las imágenes a Cloudinary via `/api/upload` y almacenar las URLs resultantes en el campo `images` del producto.
4. THE Admin_Panel SHALL implementar la gestión de cupones con formulario que permita crear cupones con: código, tipo de descuento (porcentaje o monto fijo), valor, monto mínimo de orden, máximo de usos y fecha de expiración.
5. WHEN un administrador actualiza el estado de una orden, THE Admin_Panel SHALL persistir el cambio en PostgreSQL y disparar el envío del email de cambio de estado al cliente via Email_Service.
6. THE Admin_Panel SHALL implementar la gestión de hero slides con previsualización en tiempo real del orden de aparición.
7. THE Admin_Panel SHALL implementar la gestión de categorías y subcategorías con operaciones CRUD completas.
8. WHEN un administrador realiza una acción de escritura (crear, editar, eliminar), THE Admin_Panel SHALL registrar la acción en la tabla `AuditLog` con: userId, acción, recurso, resourceId, cambios (diff JSON), IP y userAgent.
9. THE Admin_Panel SHALL mostrar la lista de clientes con: nombre, email, fecha de registro, cantidad de órdenes y monto total gastado, con paginación de 20 registros por página.
10. WHEN un administrador accede al Admin_Panel sin el rol requerido (`OWNER`, `ADMIN` o `MODERATOR`), THE Auth_System SHALL redirigir al usuario a `/` sin mostrar ningún contenido del panel.

---

### Requirement 8: Emails transaccionales con Resend + React Email

**User Story:** Como cliente, quiero recibir emails automáticos cuando realizo una compra o cuando el estado de mi pedido cambia, para que esté informado sobre el estado de mis órdenes.

#### Acceptance Criteria

1. THE Email_Service SHALL implementar plantillas de email en JSX usando React Email para: confirmación de orden, cambio de estado de orden, y bienvenida al registrarse.
2. WHEN una orden es creada y el pago es confirmado por MercadoPago, THE Email_Service SHALL enviar el email de confirmación de orden al email del cliente dentro de los 60 segundos siguientes a la confirmación del pago.
3. WHEN el estado de una orden cambia, THE Email_Service SHALL enviar el email de cambio de estado al cliente con el nuevo estado y los detalles de la orden.
4. WHEN un nuevo usuario completa el registro, THE Email_Service SHALL enviar el email de bienvenida al email registrado.
5. THE Email_Service SHALL usar Resend como proveedor de envío, configurado con la variable de entorno `RESEND_API_KEY`.
6. IF el envío de un email falla, THEN THE Email_Service SHALL registrar el error en el sistema de logs con el tipo de email, el destinatario y el mensaje de error, sin interrumpir el flujo principal de la aplicación.
7. THE Email_Service SHALL incluir en el email de confirmación de orden: número de orden, lista de productos con imágenes y precios, subtotal, total y dirección de envío.
8. THE Email_Service SHALL incluir en el email de cambio de estado: número de orden, estado anterior, nuevo estado y enlace directo a `/orders` para que el cliente pueda ver el detalle.

---

### Requirement 9: Deploy en Railway

**User Story:** Como operador del sistema, quiero desplegar la aplicación Next.js y la base de datos PostgreSQL en Railway, para que la infraestructura de producción esté centralizada y sea fácil de gestionar.

#### Acceptance Criteria

1. THE Next_App SHALL incluir un archivo `railway.toml` o configuración equivalente que defina el comando de build (`next build`) y el comando de start (`next start`).
2. WHEN Railway ejecuta el deploy, THE Next_App SHALL ejecutar automáticamente `prisma migrate deploy` antes de iniciar el servidor, aplicando las migraciones pendientes sin intervención manual.
3. THE Next_App SHALL soportar la variable de entorno `DATABASE_URL` en formato de connection string de PostgreSQL provisto por Railway (`postgresql://user:pass@host:port/db`).
4. THE Next_App SHALL configurar variables de entorno separadas para los entornos `development`, `staging` y `production` usando los servicios de Railway o archivos `.env.local`, `.env.staging`, `.env.production`.
5. WHEN el deploy en Railway falla por error en las migraciones de Prisma, THE Next_App SHALL detener el proceso de inicio y registrar el error completo, sin iniciar el servidor con una base de datos en estado inconsistente.
6. THE Next_App SHALL configurar el health check endpoint en `/api/health` que retorne HTTP 200 con `{ status: "ok", db: "connected" }` cuando la aplicación y la base de datos estén operativas.

---

### Requirement 10: Estrategia de migración sin downtime

**User Story:** Como propietario del negocio, quiero que la migración al nuevo stack no interrumpa el servicio para los clientes actuales, para que no se pierdan ventas durante el proceso de transición.

#### Acceptance Criteria

1. THE Migration_System SHALL desarrollarse en una rama git separada `migration/nextjs-postgres` sin afectar la rama `main` que contiene la aplicación actual en producción.
2. WHILE la rama `migration/nextjs-postgres` está en desarrollo, THE Migration_System SHALL mantener la aplicación actual en `main` completamente funcional y desplegable de forma independiente.
3. THE Migration_System SHALL incluir un script de migración de datos ejecutable una única vez (`scripts/migrate-from-mongo.ts`) que pueda correrse manualmente antes del cutover.
4. WHEN el script de migración se ejecuta, THE Migration_System SHALL completar la migración de todos los datos en menos de 30 minutos para un volumen de hasta 10.000 órdenes, 5.000 usuarios y 1.000 productos.
5. THE Migration_System SHALL incluir un documento `MIGRATION_PLAN.md` que describa los pasos del cutover: (1) ejecutar script de migración, (2) verificar integridad de datos, (3) actualizar variables de entorno de producción, (4) redirigir DNS o actualizar deploy en Railway, (5) verificar funcionamiento post-cutover.
6. WHEN se detecta que la migración de datos tiene discrepancias en el reporte de validación, THE Migration_System SHALL bloquear el cutover y requerir revisión manual antes de proceder.
7. THE Migration_System SHALL incluir un procedimiento de rollback documentado que permita revertir el tráfico a la aplicación anterior en menos de 15 minutos si se detectan problemas críticos post-cutover.
