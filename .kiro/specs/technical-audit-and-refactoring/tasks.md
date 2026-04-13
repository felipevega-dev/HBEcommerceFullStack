# Plan de Implementación: Auditoría Técnica y Refactorización — Harry's Boutique

## Overview

Implementación del roadmap de refactorización en 5 fases para el e-commerce Harry's Boutique. Cada fase construye sobre la anterior, comenzando por correcciones críticas de seguridad y avanzando hacia optimización de performance. El stack es Node.js/Express/MongoDB (backend), React/Vite (admin y frontend).

## Tasks

- [x] 1. Fase 1 — Quick Wins: Correcciones críticas de seguridad y base de datos
  - [x] 1.1 Corregir esquema de autenticación inseguro en adminAuth.js y userController.js
    - Reemplazar el payload del JWT admin de `{ email: ADMIN_EMAIL + ADMIN_PASSWORD }` por `{ adminId: 'admin', role: 'ADMIN' }`
    - Actualizar `adminAuth.js` para verificar `token_decode.role === 'ADMIN'` en lugar de comparar email+password
    - Agregar `expiresIn: '8h'` al `jwt.sign()` del token admin en `userController.js`
    - _Requirements: 1.2, 4.1, 4.6_

  - [x] 1.2 Eliminar logs con datos sensibles de auth.js
    - Remover todos los `console.log` que exponen headers, tokens parciales y estado de `JWT_SECRET` en `backend/middleware/auth.js`
    - _Requirements: 1.1, 10.2_

  - [x] 1.3 Corregir error tipográfico crítico en orderModel.js
    - Cambiar `mongoose.model.order` por `mongoose.models.order` en `backend/models/orderModel.js`
    - _Requirements: 3.1_

  - [x] 1.4 Agregar índices faltantes en productModel y orderModel
    - Agregar en `productModel.js`: índices compuestos en `{ category, subCategory }`, `{ bestSeller }`, `{ date: -1 }`, `{ 'rating.average': -1 }`
    - Agregar en `orderModel.js`: índices en `{ userId, date: -1 }` y `{ status }`
    - _Requirements: 3.2, 3.4, 3.5_

  - [x] 1.5 Configurar rate limiting con express-rate-limit
    - Instalar `express-rate-limit` en el backend
    - Crear middleware de rate limiting general (100 req/15min) y estricto para auth (5 req/15min)
    - Aplicar rate limiting estricto a `/api/user/login`, `/api/user/register` y rutas de admin
    - Aplicar rate limiting general a todas las rutas en `server.js`
    - _Requirements: 1.3, 4.7_

  - [ ]* 1.6 Escribir property test para protección brute force (Property 2)
    - **Property 2: Brute force protection via rate limiting**
    - **Validates: Requirements 4.7**
    - Instalar `fast-check` y `supertest` como devDependencies en el backend
    - Configurar Jest en `backend/package.json`
    - Implementar el test en `backend/tests/security/bruteForce.test.js` usando `fc.asyncProperty` con `fc.integer({ min: 6, max: 20 })` y `numRuns: 100`

- [ ] 2. Checkpoint — Fase 1 completa
  - Verificar que todos los tests pasen, que el servidor arranque sin errores y que el login admin funcione con el nuevo payload. Consultar al usuario si hay dudas.

- [x] 3. Fase 2 — Seguridad y Arquitectura Base
  - [x] 3.1 Implementar sanitización NoSQL con express-mongo-sanitize
    - Instalar `express-mongo-sanitize` en el backend
    - Registrar el middleware en `server.js` antes de las rutas: `app.use(mongoSanitize())`
    - _Requirements: 1.5_

  - [ ]* 3.2 Escribir property test para resistencia a inyección NoSQL (Property 1)
    - **Property 1: NoSQL injection resistance**
    - **Validates: Requirements 1.5**
    - Implementar en `backend/tests/security/noSqlInjection.test.js` usando `fc.oneof` con operadores MongoDB (`$gt`, `$where`, `$regex`, `$ne`, `$in`) y `numRuns: 100`
    - Verificar que todos los endpoints de login y registro retornen `success: false` ante payloads maliciosos

  - [x] 3.3 Crear clases de error personalizadas y middleware de error handling global
    - Crear `backend/middleware/errorHandler.js` con la clase `AppError` y subclases: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`
    - Implementar el middleware `errorHandler(err, req, res, next)` con logging estructurado y respuestas diferenciadas por entorno
    - Registrar el middleware al final de `server.js` (después de todas las rutas)
    - _Requirements: 10.3, 10.4_

  - [x] 3.4 Configurar logger estructurado con Winston
    - Instalar `winston` en el backend
    - Crear `backend/config/logger.js` con transports para consola (formato simple en dev, JSON en prod) y archivos `logs/error.log` y `logs/combined.log`
    - Reemplazar todos los `console.log/error` restantes en el backend por llamadas al logger
    - Agregar `logs/` a `.gitignore`
    - _Requirements: 10.1, 10.2, 10.8_

  - [x] 3.5 Extraer capa de servicios del backend (productService y userService)
    - Crear directorio `backend/services/`
    - Crear `backend/services/productService.js` extrayendo la lógica de negocio de `productController.js` (gestión de categorías, validación de datos de producto)
    - Crear `backend/services/userService.js` extrayendo la lógica de registro, login y gestión de perfil de `userController.js`
    - Actualizar los controladores para delegar en los servicios
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.6 Configurar framework de testing (Jest para backend, Vitest para frontend/admin)
    - Configurar Jest en `backend/package.json` con script `"test": "jest --runInBand"`
    - Configurar Vitest en `frontend/vite.config.js` y `admin/vite.config.js`
    - Crear estructura de directorios `backend/tests/unit/`, `backend/tests/integration/`, `frontend/src/__tests__/`, `admin/src/__tests__/`
    - _Requirements: 9.4, 9.8_

  - [ ]* 3.7 Escribir tests unitarios para productService y userService
    - Crear `backend/tests/unit/productService.test.js` con tests para validación de inputs y transformaciones de datos
    - Crear `backend/tests/unit/userService.test.js` con tests para lógica de registro y login
    - _Requirements: 9.1_

- [ ] 4. Checkpoint — Fase 2 completa
  - Verificar que todos los tests pasen, que el logger funcione correctamente y que la capa de servicios esté integrada. Consultar al usuario si hay dudas.

- [x] 5. Fase 3 — Sistema de Roles y Admin Panel
  - [x] 5.1 Implementar sistema de roles RBAC en el modelo de usuario
    - Actualizar `backend/models/userModel.js`: agregar campo `role` con enum `['OWNER', 'ADMIN', 'MODERATOR', 'USER']` y default `'USER'`
    - Migrar a `{ timestamps: true }` en el schema para reemplazar `createdAt`/`updatedAt` manuales
    - _Requirements: 4.2, 4.8_

  - [x] 5.2 Crear middleware de autorización basado en roles (RBAC)
    - Crear `backend/middleware/rbac.js` con función `requireRole(...roles)` que verifica el rol del usuario autenticado
    - Aplicar el middleware a las rutas de admin en `backend/routes/`
    - _Requirements: 4.4, 4.9_

  - [x] 5.3 Crear modelo y servicio de Audit Log
    - Crear `backend/models/auditLogModel.js` con el schema definido en el diseño (userId, action, resource, resourceId, changes, ip, userAgent, timestamps)
    - Agregar índices en `{ userId, createdAt: -1 }` y `{ resource, createdAt: -1 }`
    - Crear `backend/services/auditLogService.js` con función `logAction(userId, action, resource, resourceId, changes, req)`
    - Integrar el audit log en las operaciones de creación, edición y eliminación de productos y órdenes
    - _Requirements: 5.3, 5.4, 5.8_

  - [ ]* 5.4 Escribir property test para clasificación exhaustiva de hallazgos (Property 3)
    - **Property 3: Exhaustive finding classification**
    - **Validates: Requirements 11.3, 11.4**
    - Implementar en `backend/tests/properties/findingClassification.test.js` usando `fc.array(fc.record({ description: fc.string({ minLength: 1 }), location: fc.string({ minLength: 1 }) }))` y `numRuns: 100`
    - Verificar que `classifyFindings()` retorne exactamente un `risk` de `{Crítico, Alto, Medio, Bajo}` y una `category` de `{Security, Architecture, Performance, DevOps, Testing, Dependencies}` por hallazgo

  - [x] 5.5 Agregar módulo de configuración centralizado en Admin Panel
    - Crear `admin/src/pages/Settings.jsx` con formulario para gestionar variables del sistema (nombre de tienda, configuración de envío, etc.)
    - Agregar ruta `/settings` en `admin/src/App.jsx` y enlace en `admin/src/components/Sidebar.jsx`
    - Crear endpoint `GET/PUT /api/settings` en el backend con su controlador y servicio
    - _Requirements: 5.2, 5.9_

  - [ ]* 5.6 Escribir tests de integración para flujo de autenticación con roles
    - Crear `backend/tests/integration/auth.test.js` con tests para: login → token → acceso a ruta protegida por rol
    - Verificar que un usuario con rol `USER` no pueda acceder a rutas de `ADMIN`
    - _Requirements: 4.1, 4.4, 9.2_

- [ ] 6. Checkpoint — Fase 3 completa
  - Verificar que el sistema de roles funcione correctamente, que los audit logs se registren y que el módulo de settings esté operativo. Consultar al usuario si hay dudas.

- [x] 7. Fase 4 — DevOps y Developer Experience
  - [x] 7.1 Crear Docker Compose para orquestación de servicios
    - Crear `docker-compose.yml` en la raíz del proyecto con servicios: `mongodb`, `backend`, `admin`, `frontend`
    - Crear `backend/Dockerfile`, `admin/Dockerfile` y `frontend/Dockerfile` con builds multi-stage
    - Crear `.env.docker` con variables de entorno para el entorno Docker
    - _Requirements: 8.1, 8.3, 8.8_

  - [x] 7.2 Configurar CI/CD con GitHub Actions
    - Crear `.github/workflows/ci.yml` con stages: `lint` → `test` → `build`
    - Configurar matrix para ejecutar lint y tests en los tres proyectos (backend, admin, frontend)
    - _Requirements: 8.5, 8.9_

  - [x] 7.3 Implementar sistema de migraciones con migrate-mongo
    - Instalar `migrate-mongo` en el backend
    - Crear `backend/migrate-mongo-config.js` con configuración de conexión
    - Crear migración inicial `backend/migrations/20240101-add-indexes.js` que aplica los índices de Fase 1
    - Crear migración `backend/migrations/20240102-add-role-field.js` para el campo `role` en usuarios
    - Agregar scripts `"migrate:up"` y `"migrate:down"` en `backend/package.json`
    - _Requirements: 3.7, 8.4_

  - [x] 7.4 Configurar pre-commit hooks con Husky y lint-staged
    - Instalar `husky` y `lint-staged` en la raíz del monorepo
    - Crear `package.json` raíz con configuración de `lint-staged` para archivos `.js/.jsx` (eslint --fix, prettier --write) y `.json/.md/.css` (prettier --write)
    - Inicializar Husky y crear hook `pre-commit` que ejecuta `lint-staged`
    - _Requirements: 9.6, 9.9_

- [ ] 8. Checkpoint — Fase 4 completa
  - Verificar que `docker-compose up` levante todos los servicios, que el pipeline de CI pase y que los pre-commit hooks funcionen. Consultar al usuario si hay dudas.

- [x] 9. Fase 5 — Performance y Optimización
  - [x] 9.1 Implementar paginación en endpoints de listado
    - Actualizar `productController.js` (y su servicio) para aceptar parámetros `page` y `limit` en `GET /api/product/list`
    - Actualizar `orderController.js` para paginar `GET /api/order/list` y `GET /api/order/userorders`
    - Retornar metadata de paginación: `{ data, total, page, limit, totalPages }`
    - Actualizar los componentes `admin/src/pages/List.jsx` y `admin/src/pages/Orders.jsx` para consumir la paginación
    - _Requirements: 3.2, 3.8_

  - [x] 9.2 Agregar lazy loading e imágenes optimizadas en el Frontend
    - Actualizar `frontend/src/components/ProductItem.jsx` para usar `loading="lazy"` en imágenes
    - Implementar lazy loading de rutas en `frontend/src/App.jsx` usando `React.lazy` y `Suspense`
    - Replicar lazy loading de rutas en `admin/src/App.jsx`
    - _Requirements: 6.3, 6.4, 6.8_

  - [ ]* 9.4 Escribir tests de integración para paginación
    - Crear `backend/tests/integration/pagination.test.js` verificando que los endpoints de listado retornen la estructura de paginación correcta con distintos valores de `page` y `limit`
    - _Requirements: 3.2, 9.2_

- [x] 10. Checkpoint final — Todas las fases completas
  - Ejecutar la suite completa de tests (`npm test` en backend, `npm run test -- --run` en frontend y admin). Verificar que no haya regresiones. Consultar al usuario si hay dudas.

## Notes

- Las sub-tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints garantizan validación incremental entre fases
- Los property tests (Properties 1, 2, 3) validan garantías universales de corrección usando `fast-check` con `numRuns: 100`
- Los tests unitarios y de integración validan ejemplos específicos y casos borde
- La Fase 1 debe completarse antes de desplegar a producción — contiene correcciones de seguridad críticas
