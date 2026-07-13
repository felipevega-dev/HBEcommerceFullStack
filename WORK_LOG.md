# WORK_LOG.md

Registro de avance del trabajo en este repositorio. La aplicacion activa esta
en `harrys-boutique-next/`.

## 2026-05-21 - P1 Preventa Co-Creada, Club Y Comunidad

- Rama usada: `codex/pet-culture-experience`.
- Objetivo de la fase: sumar mecanismos de recurrencia, comunidad y FOMO dentro
  de `Harry's World` sin migraciones ni dependencias nuevas.
- Archivos modificados:
  - `WORK_LOG.md`
  - `harrys-boutique-next/src/lib/pet-experience.ts`
  - `harrys-boutique-next/src/components/store/pet-experience-page-client.tsx`
- Cambios realizados:
  - Se agrego una votacion local de preventa co-creada para conceptos de drops
    inspirados en anime, gaming y k-pop.
  - Se agrego una seccion de desafios virales con Mascota del Mes, Matching
    Domingo y Unboxing Ritual.
  - Se agrego una seccion de Club Harry's con niveles de membresia, beneficios y
    CTA hacia el perfil.
  - Se estructuraron los contenidos nuevos en `pet-experience.ts` para que una
    futura fase pueda moverlos a admin sin rehacer la UI.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npx prettier --check` sobre los archivos tocados.
  - Verificacion HTTP local de `/experiencias` y Home.
  - `npm run test`.
  - `npm run build`.
  - `npm run lint`.
- Resultado:
  - Type-check y formato focalizado pasaron.
  - `/experiencias` y Home respondieron HTTP 200.
  - `npm run test`: 22 archivos y 277 tests pasaron.
  - `npm run build`: compilacion productiva exitosa.
  - `npm run lint` sigue fallando por 34 archivos preexistentes fuera de formato
    que no pertenecen a esta fase.
- Pendientes:
  - Persistir votos, desafios y membresia en base de datos si se aprueba la
    experiencia.
  - Crear moderacion/admin para UGC antes de aceptar fotos reales de clientes.
- Riesgos detectados:
  - La votacion es una simulacion local con `localStorage`; no representa demanda
    real hasta tener persistencia y control anti-abuso.

## 2026-05-21 - P1 Tracking Post-Compra Con Historia

- Rama usada: `codex/pet-culture-experience`.
- Objetivo de la fase: elevar la experiencia post-compra con una narrativa de
  tracking que use los datos existentes de pedidos sin tocar el modelo de base
  de datos.
- Archivos modificados:
  - `WORK_LOG.md`
  - `harrys-boutique-next/src/components/store/order-story-tracker.tsx`
  - `harrys-boutique-next/src/components/store/orders-list.tsx`
- Cambios realizados:
  - Se agrego un componente reutilizable de "Tracking con historia" para
    pedidos.
  - El detalle de cada pedido ahora muestra una mini aventura: pedido recibido,
    preparando el look, camino a casa y look entregado.
  - Se integraron courier, numero de seguimiento, fechas disponibles y alerta de
    pago pendiente o fallido.
  - Se agrego un estado respetuoso para pedidos cancelados.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npx prettier --check` sobre los archivos tocados.
  - `npm run test`.
  - `npm run build`.
  - `npm run lint`.
- Resultado:
  - Type-check y formato focalizado pasaron.
  - `npm run test`: 22 archivos y 277 tests pasaron.
  - `npm run build`: compilacion productiva exitosa.
  - `npm run lint` sigue fallando por 34 archivos preexistentes fuera de formato
    que no pertenecen a esta fase.
- Pendientes:
  - Conectar estados de tracking mas ricos cuando se agregue integracion real
    con operador logistico.
  - Agregar vista publica de tracking por token seguro si se decide compartir el
    avance fuera del perfil.
- Riesgos detectados:
  - La narrativa depende de los estados actuales del pedido; no reemplaza un
    tracking logistico real.

## 2026-05-21 - P1 HarryCoins Y Misiones

- Rama usada: `codex/pet-culture-experience`.
- Objetivo de la fase: agregar una capa inicial de gamificacion y loyalty sobre
  la experiencia pet-fashion sin crear aun un modelo persistente.
- Archivos modificados:
  - `WORK_LOG.md`
  - `harrys-boutique-next/src/lib/pet-experience.ts`
  - `harrys-boutique-next/src/components/store/pet-loyalty-panel.tsx`
  - `harrys-boutique-next/src/components/store/pet-experience-page-client.tsx`
  - `harrys-boutique-next/src/components/store/profile-page-client.tsx`
- Cambios realizados:
  - Se agregaron misiones de comunidad con recompensas en HarryCoins.
  - Se agregaron niveles `Fan`, `Muse`, `Icon` y `Legend` con progreso visual.
  - Se creo un panel reutilizable de loyalty para `/experiencias` y perfil.
  - El quiz de estilo guarda resultado en `localStorage` para que el perfil pueda
    marcar la mision como completada.
  - El perfil calcula misiones completadas segun pasaporte, cumpleanos, quiz,
    foto de perfil y direccion guardada.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npx prettier --check` sobre los archivos tocados.
  - `npm run test`.
  - `npm run build`.
  - `npm run lint`.
  - Verificacion HTTP local de `/experiencias`.
- Resultado:
  - Type-check, formato focalizado, tests y build pasaron.
  - `npm run test`: 22 archivos y 277 tests pasaron.
  - `npm run build`: compilacion productiva exitosa.
  - `/experiencias` respondio HTTP 200.
  - `npm run lint` sigue fallando por 35 archivos preexistentes fuera de formato
    que no pertenecen a esta fase.
- Pendientes:
  - Persistir HarryCoins y misiones en base de datos cuando se defina la regla de
    negocio definitiva.
  - Agregar eventos reales para UGC, compra, reviews y referidos.
- Riesgos detectados:
  - Los HarryCoins actuales son una representacion de UX calculada desde estado
    local y datos existentes; todavia no son saldos transaccionales.

## 2026-05-21 - P0 Experiencia Pet-Fashion Y Comunidad

- Rama usada: `codex/pet-culture-experience`.
- Objetivo de la fase: aterrizar el roadmap creativo en una primera experiencia
  publica y verificable sin migraciones grandes.
- Archivos modificados:
  - `WORK_LOG.md`
  - `harrys-boutique-next/src/app/(store)/page.tsx`
  - `harrys-boutique-next/src/app/(store)/experiencias/page.tsx`
  - `harrys-boutique-next/src/components/store/pet-culture-gateway.tsx`
  - `harrys-boutique-next/src/components/store/pet-experience-page-client.tsx`
  - `harrys-boutique-next/src/components/store/navbar.tsx`
  - `harrys-boutique-next/src/components/store/footer.tsx`
  - `harrys-boutique-next/src/components/store/product-info.tsx`
  - `harrys-boutique-next/src/components/store/profile-page-client.tsx`
  - `harrys-boutique-next/src/components/store/wishlist-page-client.tsx`
  - `harrys-boutique-next/src/lib/pet-experience.ts`
- Cambios realizados:
  - Se agrego la ruta publica `/experiencias` como "Harry's World" con quiz de
    estilo, shop by occasion, drops, atelier, UGC, birthday box y pack de
    adopcion.
  - Se agrego un bloque de entrada en Home hacia la nueva experiencia.
  - Se agregaron accesos desde navbar, footer, producto, wishlist y perfil.
  - Se agrego "Fit Lab" y CTA de Atelier en la ficha de producto.
  - Se transformo wishlist en una superficie de retorno con ideas de cumpleanos
    y fit check.
  - Se agrego un primer "Pasaporte Harry's" local en perfil para capturar
    mascota, talla, cumpleanos y personalidad sin tocar base de datos.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npx prettier --check` sobre los archivos tocados.
  - `npm run test`.
  - `npm run build`.
  - `npm run lint`.
  - Verificacion en navegador local de `/experiencias` y Home.
- Resultado:
  - Type-check, formato focalizado, tests y build pasaron.
  - `npm run test`: 22 archivos y 277 tests pasaron.
  - `npm run build`: compilacion productiva exitosa; `/experiencias` quedo como
    ruta estatica.
  - `/experiencias` cargo correctamente, el quiz cambio resultado a
    `Mini Royal` con progreso 100%, Home mostro el bloque `Harry's World` y no
    hubo errores de consola en esas vistas.
  - `npm run lint` sigue fallando por 35 archivos preexistentes fuera de formato
    que no pertenecen a esta fase.
- Pendientes:
  - Convertir pasaporte, puntos, drops y UGC a modelos persistentes cuando se
    valide el producto.
  - Crear admin editable para campañas/drops si esta experiencia queda aprobada.
- Riesgos detectados:
  - El pasaporte actual persiste en `localStorage`; no sincroniza entre
    dispositivos hasta una futura migracion.
  - La experiencia UGC aun es editorial/CTA; no hay carga ni moderacion de fotos
    de clientes en esta fase.
  - `npm run dev` no arranco por conflicto de contenedor Docker existente
    `harrys-postgres`; se verifico con `npx next dev --turbopack -p 3000`.

## 2026-05-17 - P1 Auditoria De Settings Admin

- Rama usada: `codex/docs-workflow-methodology`.
- Objetivo de la fase: empezar a usar `AuditLog` en cambios administrativos de
  configuracion de tienda.
- Archivos modificados:
  - `WORK_LOG.md`
  - `harrys-boutique-next/src/app/api/settings/route.ts`
- Cambios realizados:
  - Se registra `settings.update` cuando un admin cambia valores reales.
  - Se guardan valores anteriores y nuevos por clave, IP y user-agent.
  - Se evita registrar valores grandes de contenido como `about_page_content`;
    solo se marca que cambiaron.
  - Se mantiene el upsert de settings dentro de una transaccion junto con el
    log de auditoria.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npm run lint`.
  - `npm run test`.
  - `npm run build`.
- Resultado:
  - Validaciones completas en verde.
  - `npm run test`: 22 archivos y 277 tests pasaron.
  - `npm run build`: compilacion productiva exitosa.
- Pendientes:
  - Extender auditoria a productos, cupones, inventario e Instagram settings en
    fases separadas.
- Riesgos detectados:
  - `AuditLog` aun no cubre productos, cupones, inventario ni settings externos
    de Instagram; esta fase solo cubre una superficie critica y acotada.

## 2026-05-17 - P1 Clientes Paginados Server-Side

- Rama usada: `codex/docs-workflow-methodology`.
- Objetivo de la fase: mover la segmentacion y paginacion del admin de clientes
  desde memoria de Node hacia consultas SQL paginadas.
- Archivos modificados:
  - `WORK_LOG.md`
  - `harrys-boutique-next/src/app/(admin)/admin/customers/page.tsx`
  - `harrys-boutique-next/src/components/admin/customer-list.tsx`
- Cambios realizados:
  - Se reemplazo la carga completa de usuarios y ordenes por CTEs SQL con CLV,
    cantidad de pedidos, ultima orden, pedidos recientes y segmento.
  - Se aplican `search`, `segment`, `limit` y `offset` desde la base de datos.
  - Se preservan `search` y `segment` al paginar.
  - Se resetea `page` al cambiar filtros de segmento.
  - Se corrigieron textos con caracteres corruptos en metadata y tabla.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npm run lint`.
  - `npm run test`.
  - `npm run build`.
- Resultado:
  - Validaciones completas en verde.
  - `npm run test`: 22 archivos y 277 tests pasaron.
  - `npm run build`: compilacion productiva exitosa.
- Pendientes:
  - Continuar con el siguiente P1: auditoria de eventos `AuditLog` o filtros
    avanzados de pedidos.
- Riesgos detectados:
  - La consulta usa SQL especifico de PostgreSQL, consistente con Prisma/Postgres
    y Supabase, pero no portable a SQLite.

## 2026-05-17 - P1 Settings Tipados De Tienda

- Rama usada: `codex/docs-workflow-methodology`.
- Objetivo de la fase: reemplazar la configuracion key-value libre del admin
  por definiciones tipadas y validacion server-side para ajustes operativos.
- Archivos modificados:
  - `WORK_LOG.md`
  - `harrys-boutique-next/src/app/(admin)/admin/settings/page.tsx`
  - `harrys-boutique-next/src/app/api/settings/route.ts`
  - `harrys-boutique-next/src/components/admin/settings-client.tsx`
  - `harrys-boutique-next/src/lib/commerce-settings.ts`
  - `harrys-boutique-next/src/lib/store-settings.ts`
- Cambios realizados:
  - Se agrego catalogo tipado de settings con grupos, defaults, tipos y limites.
  - Se corrigio el default de `shipping_fee` para usar el valor CLP productivo.
  - Se agrego validacion server-side para numeros, emails, URLs y booleanos.
  - Se preservo compatibilidad con `about_page_content`.
  - Se rehizo el formulario admin en secciones operativas: tienda, envios,
    contacto e integraciones.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npm run lint`.
  - `npm run test`.
  - `npm run build`.
- Resultado:
  - Validaciones completas en verde.
  - Se corrigio un error inicial de TypeScript en el tipo de `STORE_SETTING_MAP`
    ajustandolo a `ReadonlyMap<string, StoreSettingDefinition>`.
- Pendientes:
  - Commitear la fase.
- Riesgos detectados:
  - Esta fase no cambia el modelo de datos; mantiene `Settings` como key-value
    para evitar una migracion innecesaria en este punto.

## 2026-05-17 - SEO Tecnico Con Datos Estructurados

- Rama usada: `codex/docs-workflow-methodology`.
- Objetivo de la fase: mejorar SEO tecnico con JSON-LD reutilizable para la
  tienda y para la pagina de preguntas frecuentes.
- Archivos modificados:
  - `WORK_LOG.md`
  - `harrys-boutique-next/src/app/layout.tsx`
  - `harrys-boutique-next/src/app/(store)/faq/page.tsx`
  - `harrys-boutique-next/src/lib/structured-data.ts`
- Cambios realizados:
  - Se agrego helper central para serializar JSON-LD de forma segura.
  - Se agregaron schemas `Organization` y `PetStore` en el layout raiz.
  - Se agregaron schemas `BreadcrumbList` y `FAQPage` en FAQ.
  - Se actualizo el copy de FAQ a español chileno y contenido mas claro para
    envios, pagos, cambios y tallas.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npm run lint`.
  - `npm run build`.
- Resultado:
  - Validaciones completas en verde.
- Pendientes:
  - Commitear la fase.
- Riesgos detectados:
  - Los datos de direccion siguen siendo conservadores: Arica, Chile, sin calle
    exacta ni telefono hasta que el negocio confirme datos publicos.

## 2026-05-17 - Scripts Operativos De Validacion

- Rama usada: `codex/docs-workflow-methodology`.
- Objetivo de la fase: agregar scripts de validacion recomendados para hacer
  mas simple el flujo diario de calidad antes de nuevas fases.
- Archivos modificados:
  - `AGENTS.md`
  - `WORK_LOG.md`
  - `harrys-boutique-next/package.json`
- Cambios realizados:
  - Se agrego `npm run format` como alias explicito de Prettier write.
  - Se agrego `npm run check` para type-check, lint y tests sin build.
  - Se agrego `npm run audit` para `npm audit --omit=dev`.
  - Se actualizo `AGENTS.md` para reflejar los scripts reales.
- Validaciones ejecutadas:
  - `npm run check`.
  - `npm run audit`.
  - `npx prettier --check ..\AGENTS.md ..\WORK_LOG.md package.json`.
- Resultado:
  - Validaciones completas en verde: type-check, lint, 277 tests, audit y
    formato.
- Pendientes:
  - Commitear la fase.
- Riesgos detectados:
  - `format` y `lint:fix` hacen lo mismo; se mantiene por claridad operativa,
    no por necesidad tecnica.

## 2026-05-17 - Cierre P0 De Produccion, Pagos Y Chile

- Rama usada: `codex/docs-workflow-methodology`.
- Objetivo de la fase: cerrar y commitear la unidad pendiente del plan P0/P1
  enfocada en produccion, MercadoPago, reservas de stock/cupones, contenido
  Chile/CLP y preparacion Supabase/Vercel.
- Archivos modificados:
  - `.gitignore`
  - `harrys-boutique-next/.env.example`
  - `harrys-boutique-next/.env.production.example`
  - `harrys-boutique-next/PRODUCTION_CHECKLIST.md`
  - `harrys-boutique-next/SUPABASE_VERCEL_DEPLOY.md`
  - `harrys-boutique-next/docker-compose.yml`
  - `harrys-boutique-next/package.json`
  - Rutas de pedidos, MercadoPago, reviews y admin orders.
  - Componentes de pedidos, checkout, emails y feedback de pago.
  - `harrys-boutique-next/src/lib/order-lifecycle.ts`
  - `harrys-boutique-next/src/lib/commerce.ts`
- Cambios realizados:
  - Se separo el estado funcional de orden del estado de pago en las rutas y UI
    admin.
  - Se agrego liberacion de reservas expiradas/fallidas y manejo idempotente de
    cupones.
  - Se agregaron datos operativos de envio, tracking y auditoria basica de
    pedidos.
  - Se corrigieron textos y moneda hacia Chile/CLP y se ajusto el costo de
    envio base.
  - Se documento el uso de `DATABASE_URL` pooler y `DIRECT_URL` directo para
    Supabase.
  - Se normalizo `.env.production.example` en ASCII para evitar caracteres
    corruptos.
- Validaciones ejecutadas:
  - `git diff --check`.
  - `npm run ci` desde `harrys-boutique-next/`, con type-check, lint, 277
    tests y build.
  - `npm audit --omit=dev`.
- Resultado:
  - Validaciones completas en verde.
  - `npm audit --omit=dev` reporto 0 vulnerabilidades.
- Pendientes:
  - Commitear solo los archivos reales de esta fase.
  - Continuar con la siguiente fase del plan en un commit separado.
- Riesgos detectados:
  - El worktree muestra muchos archivos modificados por fin de linea aunque el
    diff real de esta fase es mas acotado. Staging debe hacerse por archivos
    concretos.

## 2026-05-16 - Metodologia De Trabajo Del Proyecto

- Rama usada: `codex/docs-workflow-methodology`.
- Objetivo de la fase: crear una guia obligatoria de metodologia de trabajo y
  un registro de progreso para futuras fases del e-commerce.
- Archivos modificados:
  - `AGENTS.md`
  - `WORK_LOG.md`
- Cambios realizados:
  - Se documento el flujo general de trabajo por fases.
  - Se definio politica Git, ramas, commits convencionales y merge workflow.
  - Se definieron validaciones obligatorias antes de cerrar fases.
  - Se documento politica de seguridad, manejo de errores y criterios de
    calidad.
  - Se registro el stack real detectado desde `harrys-boutique-next/package.json`.
  - Se listaron scripts disponibles y scripts recomendados.
- Validaciones ejecutadas:
  - `npx prettier --check ..\AGENTS.md ..\WORK_LOG.md` desde
    `harrys-boutique-next/`.
  - `npm run ci` desde `harrys-boutique-next/`, que ejecuta
    `type-check`, `lint`, `test` y `build`.
- Resultado:
  - Documentacion base creada.
  - Validaciones completas en verde: Prettier, TypeScript, lint, 277 tests y
    build de Next.js.
- Pendientes:
  - Mantener los cambios funcionales previos fuera del commit de esta fase.
  - Evaluar en una fase posterior si conviene agregar scripts `audit`,
    `format` y `check`.
- Riesgos detectados:
  - La rama fue creada desde `main` con muchos cambios previos sin commitear de
    la fase de produccion/pagos. El commit de esta fase debe incluir solo
    documentacion para no mezclar alcances.

## 2026-07-13 - Seed Reproducible Contra Supabase

- Rama usada: `codex/seed-supabase-bootstrap`.
- Objetivo de la fase: dejar un seed reproducible para poblar Supabase con
  admin, categorias y productos base.
- Archivos modificados:
  - `harrys-boutique-next/package.json`
  - `harrys-boutique-next/scripts/seed-supabase.mjs`
  - `WORK_LOG.md`
- Cambios realizados:
  - Se agrego el script `db:seed` para ejecutar el seed desde `npm`.
  - Se configuro `prisma.seed` para compatibilidad con `prisma db seed`.
  - Se creo un seed idempotente contra Supabase que hace upsert de admin,
    categorias y productos base.
  - Se resetean las variantes de los productos semilla en cada corrida para
    mantener el estado reproducible.
- Validaciones ejecutadas:
  - `npm run db:seed`
- Resultado:
  - Seed funcional y repetible contra Supabase.
  - La base queda con admin `admin@harrys-boutique.com`, categorias `Perros`
    y `Gatos`, y tres productos iniciales.
- Pendientes:
  - Definir si se quieren mas productos semilla o solo usar este seed como base
    minima.
- Riesgos detectados:
  - El seed usa una contraseña por defecto si `ADMIN_PASSWORD` no se define.
    Conviene sobrescribirla en entornos compartidos o de produccion.
## 2026-07-13 - Seed Real Desde Docker Local

- Rama usada: `codex/seed-supabase-bootstrap`.
- Objetivo de la fase: reemplazar el bootstrap minimo por un sync real del
  catalogo local contra Supabase.
- Archivos modificados:
  - `harrys-boutique-next/scripts/seed-supabase.mjs`
  - `WORK_LOG.md`
- Cambios realizados:
  - El seed ahora lee desde el Postgres local del Docker activo por defecto.
  - Se copian `categories`, `users` y `products` con sus IDs originales.
  - Se preservan passwords hashed, roles, imagenes, tallas, colores y slugs del
    catalogo real.
  - Se mantiene el admin funcional `admin@harrys-boutique.com` para login
    inmediato.
  - Se elimino la salida de password en consola.
- Validaciones ejecutadas:
  - `npm run db:seed`
- Resultado:
  - Supabase quedo sincronizado con 3 categorias, 15 usuarios y 13 productos
    del Docker local.
  - El seed es repetible mientras exista la fuente local o se defina
    `SOURCE_DATABASE_URL`.
- Pendientes:
  - Extender el import a tablas de contenido extra si se quiere clonar el
    entorno completo.
- Riesgos detectados:
  - Si el Docker local no esta disponible, el seed necesita
    `SOURCE_DATABASE_URL` para apuntar a otra fuente valida.

## 2026-07-13 - Seed Desacoplado Del Docker

- Rama usada: `codex/seed-supabase-bootstrap`.
- Objetivo de la fase: dejar de depender del Docker local como fuente de seed
  y usar un snapshot versionado en el repo.
- Archivos modificados:
  - `harrys-boutique-next/scripts/seed-snapshot.json`
  - `harrys-boutique-next/scripts/seed-supabase.mjs`
  - `WORK_LOG.md`
- Cambios realizados:
  - Se congelo el catalogo local en `scripts/seed-snapshot.json`.
  - El seed ahora lee ese snapshot por defecto y ya no requiere Docker para
    poblar Supabase.
  - Se mantuvo el admin funcional para acceso inmediato al panel.
- Validaciones ejecutadas:
  - `npm run db:seed`
- Resultado:
  - Supabase puede repoblarse sin levantar Docker.
  - El snapshot contiene 3 categorias, 15 usuarios y 13 productos reales del
    entorno local original.
- Pendientes:
  - Si el catalogo cambia, refrescar el snapshot con una exportacion nueva.
- Riesgos detectados:
  - El snapshot refleja el estado capturado hoy; si se quiere verdad historica
    de otras tablas no copiadas, hace falta exportarlas aparte.
