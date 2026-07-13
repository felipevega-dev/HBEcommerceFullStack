# WORK_LOG.md

## 2026-07-13 - Home content data layer and Admin connection

- Rama usada: `codex/home-content-admin`.
- Objetivo: conectar el contenido comercial del Home con datos reales sin
  modificar su composición visual.
- Archivos principales:
  - `prisma/schema.prisma`
  - `prisma/migrations/20260713130000_add_home_content_management/migration.sql`
  - `src/lib/home-content.ts`
  - `src/components/store/home-editorial-sections.tsx`
  - `src/app/(store)/page.tsx`
  - `src/app/(admin)/admin/home/page.tsx`
  - `src/components/admin/home-content-manager.tsx`
  - `src/app/api/admin/home-content/route.ts`
  - `src/lib/instagram-automation.ts`
  - `src/app/api/instagram/posts/manual/route.ts`
- Cambios realizados:
  - Categorías del Home usan `Category` con metadatos de imagen, destino,
    visibilidad y orden.
  - Productos destacados usan `HomeProductSelection`, filtrando activos y con
    stock; existe fallback a best sellers reales.
  - Instagram usa `InstagramPost` extendido con URL pública, alt, caption,
    likes manuales, visibilidad y orden.
  - Testimonios usan `Testimonial` existente, solo activos y APPROVED.
  - Se añadió `/admin/home` y un endpoint protegido para administrar estos datos.
  - Las imágenes estáticas protegidas de Nuestra Historia y Harry's Atelier se
    mantienen en código, sin configuración Admin.
- Migración:
  - Aplicada con `npm run db:migrate:deploy` sobre la base configurada.
  - No elimina datos; inicializa las categorías existentes visibles en Home.
- Validaciones:
  - `npm run type-check`.
  - `npm run test` — 24 archivos, 284 tests.
  - `npm run build` — incluye `/admin/home` y `/api/admin/home-content`.
- Pendientes:
  - Completar UI específica para bloques de productos por categoría y creación
    directa de nuevas categorías desde `/admin/home`.
  - Resolver `prisma generate` normal bloqueado por `EPERM` del motor Windows;
    `--no-engine` generó correctamente el cliente tipado.

## 2026-07-13 - SimplificaciÃ³n del recorrido comercial

- Rama usada: `codex/ui-design-system-audit`.
- Objetivo: retirar Experiencias del producto principal y reforzar las pÃ¡ginas
  necesarias de marca y soporte.
- Cambios realizados:
  - Se eliminÃ³ Experiencias del Navbar, del menÃº de categorÃ­as y del Footer.
  - La ruta `/experiencias` conserva compatibilidad y redirige a `/collection`.
  - Se eliminaron los componentes exclusivos de esa pÃ¡gina que quedaron sin
    uso.
  - Las llamadas a personalizaciÃ³n ahora llevan a Contacto; accesos de perfil y
    favoritos llevan a ColecciÃ³n, Contacto o Novedades.
  - Contacto adopta `ui-container`, `ui-card`, `Input`, `Textarea` y `Button`.
  - Nosotros adopta contenedores, cards y botones del Design System para una
    composiciÃ³n mÃ¡s cercana al lenguaje de Home.
- Validaciones:
  - `npm run type-check`.
  - `npm run test` â€” 24 archivos, 284 tests.
  - `npm run build`.
  - `git diff --check`.
- Resultado: el recorrido pÃºblico queda mÃ¡s enfocado en compra, confianza,
  historia y contacto, sin romper enlaces antiguos.
- Pendientes: siguiente pasada sobre catÃ¡logo/producto, carrito/checkout y
  pruebas visuales responsive de Contacto y Nosotros.

## 2026-07-13 - Navbar indicator transition fix

- Rama usada: `codex/ui-design-system-audit`.
- Objetivo: corregir el salto del indicador discontinuo al navegar de Home a
  Tienda.
- Archivos modificados:
  - `harrys-boutique-next/src/components/store/navbar.tsx`
  - `harrys-boutique-next/src/components/store/home-editorial-hero.tsx`
- Causa: Home montaba una instancia independiente de `Navbar` dentro del hero,
  mientras el resto de rutas montaba otra desde el layout. `layoutId` no podÃ­a
  interpolar entre instancias distintas.
- SoluciÃ³n:
  - Se eliminÃ³ el Navbar duplicado del hero.
  - El layout mantiene una Ãºnica instancia persistente.
  - El Navbar calcula su modo overlay con la ruta actual y conserva el mismo
    indicador Framer Motion para que pueda deslizarse entre enlaces.
- Validaciones:
  - `npm run type-check`.
  - `git diff --check`.
  - Build y tests de la fase anterior permanecen correctos.
- Pendiente: repetir la prueba visual de navegaciÃ³n cuando el navegador local
  vuelva a exponer la pestaÃ±a interactiva.

## 2026-07-13 - Admin wizard modal and control migration

- Rama usada: `codex/ui-design-system-audit`.
- Objetivo: continuar la migraciÃ³n de superficies Admin que todavÃ­a usaban
  overlays, botones y paneles independientes.
- Archivos modificados:
  - `harrys-boutique-next/src/components/admin/product-wizard/index.tsx`
  - `harrys-boutique-next/src/components/admin/product-wizard/modals/error-modal.tsx`
  - `harrys-boutique-next/src/components/admin/product-wizard/modals/success-modal.tsx`
  - `harrys-boutique-next/src/components/admin/global-search.tsx`
- Cambios realizados:
  - El wizard usa paneles, botones, estados y progreso con tokens de marca.
  - Los modales de error y éxito sustituyen superficies y botones aislados por
    primitives compatibles, manteniendo las clases legacy solo como alias para
    tests y la capa de compatibilidad visual.
  - La búsqueda global usa overlay cÃ¡lido, panel de marca y semÃ¡ntica de dialog.
- Validaciones:
  - `npm run type-check`.
  - `npm run test` â€” 24 archivos, 284 tests.
  - `git diff --check`.
- Resultado: la fase queda estable sin cambios en lÃ³gica de negocio,
  persistencia ni permisos.
- Pendientes: migrar los pasos internos del wizard y los restantes managers de
  contenido Admin; hacer la revisiÃ³n visual autenticada por viewport.

## 2026-07-13 - Full viewport fix and legacy controls normalization

- Rama usada: `codex/ui-design-system-audit`.
- Objetivo: corregir el ancho incompleto visible en Home y continuar la
  normalizaciÃ³n de controles globales y navegaciÃ³n mÃ³vil.
- Archivos modificados:
  - `harrys-boutique-next/src/app/(store)/layout.tsx`
  - `harrys-boutique-next/src/app/globals.css`
  - `harrys-boutique-next/src/components/store/navbar.tsx`
  - `harrys-boutique-next/src/components/ui/design-system.tsx`
- Cambios realizados:
  - Se restaurÃ³ el contrato de padding del layout de tienda para que los
    mÃ¡rgenes negativos editoriales de Home alcancen todo el viewport.
  - Se normalizaron inputs, selects y textareas con tokens de marca, alturas,
    radios y focus visible.
  - El menÃº mÃ³vil ahora tiene semÃ¡ntica de dialog, cierre con Escape y overlay
    cÃ¡lido; tambiÃ©n restaura el scroll del documento al cerrar.
- Validaciones:
  - Navegador local: viewport de 1235px; `main` y hero ocupan 1220px hasta el
    borde visible, sin bandas laterales.
  - `npm run type-check`, `npm run test`, `npm run build` y `git diff --check`.
- Resultado: Home a ancho completo y build de producciÃ³n correcto.
- Pendientes: migrar modales del wizard Admin y formularios legacy; completar
  revisiÃ³n responsive autenticada; resolver Prettier y auditar dependencias en
  una fase separada.
- Riesgos: la validaciÃ³n visual autenticada requiere sesiones y datos
  representativos; no se alterÃ³ lÃ³gica de negocio ni persistencia.

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

## 2026-07-13 - Auth Prod Fix

- Rama usada: `main`.
- Objetivo de la fase: eliminar el `503` de registro en produccion cuando
  Upstash no esta disponible y dejar claro el problema de conexion a Supabase
  en login.
- Archivos modificados:
  - `harrys-boutique-next/src/lib/rate-limiter.ts`
  - `harrys-boutique-next/src/lib/api-utils.ts`
  - `harrys-boutique-next/src/lib/__tests__/rate-limiter.test.ts`
  - `WORK_LOG.md`
- Cambios realizados:
  - `getRateLimitState` ahora cae al limiter local si Upstash no esta
    configurado, incluso en produccion.
  - `protectMutation` deja de devolver `503` solo por falta de Upstash.
  - Se actualizo la prueba para reflejar el fallback local en produccion.
- Validaciones ejecutadas:
  - `npx vitest --run src/lib/__tests__/rate-limiter.test.ts`
  - `npm run type-check`
- Resultado:
  - Registro deja de bloquearse por el rate limiter distribuido ausente.
  - El login sigue dependiendo de que `DATABASE_URL` apunte al pooler correcto
    de Supabase y que Supabase acepte la conexion.
- Pendientes:
  - Corregir `DATABASE_URL` en Vercel si apunta al host directo o si el password
    no esta URL-encoded.
- Riesgos detectados:
  - El fallback local no es distribuido; si el trafico sube mucho, conviene
    reinstalar Upstash en cuanto se pueda.

## 2026-07-13 - Design System Visual Audit Phase 1

- Rama usada: `codex/ui-design-system-audit`.
- Objetivo de la fase: establecer fundaciones visuales comunes y eliminar la
  segunda paleta fría que aparecía en tienda, cuenta y Admin.
- Archivos modificados:
  - `harrys-boutique-next/src/app/globals.css`
  - `harrys-boutique-next/src/app/layout.tsx`
  - `harrys-boutique-next/src/app/(store)/layout.tsx`
  - `harrys-boutique-next/src/app/(admin)/layout.tsx`
  - `harrys-boutique-next/src/components/ui/design-system.tsx`
  - Componentes de navegación, catálogo, carrito, cuenta y clientes Admin.
- Cambios realizados:
  - Se añadieron tokens de controles, focus, contenedores y dimensiones.
  - Se añadieron primitives de Button, Input, Select, Card, Badge y EmptyState.
  - Se unificó la tipografía global en el elemento `html`.
  - Se normalizaron layouts de tienda y Admin con contenedor compartido.
  - Se añadió una capa de compatibilidad para que utilidades legacy rendericen
    la paleta cálida de Harry's Boutique durante la migración incremental.
  - Se migraron estados vacíos, paginación, carrito, perfil, navegación Admin y
    segmentos de clientes a primitives/tokens de marca.
- Validaciones ejecutadas:
  - `npm run type-check`.
- Resultado:
  - TypeScript pasa correctamente.
  - La Fase 1 queda estable para continuar con componentes globales y páginas.
- Pendientes:
  - Migrar completamente Navbar, Footer, Checkout y superficies Admin.
  - Ejecutar tests, lint y build después de las siguientes fases.
- Riesgos detectados:
  - La capa de compatibilidad reduce la fragmentación visual, pero debe retirarse
    gradualmente para eliminar clases legacy del código fuente.

## 2026-07-13 - Design System Visual Audit Phase 2

- Rama usada: `codex/ui-design-system-audit`.
- Objetivo de la fase: extender la identidad a navegación, catálogo, carrito,
  checkout, cuenta y primeras superficies operativas de Admin.
- Archivos modificados:
  - `harrys-boutique-next/src/components/store/navbar.tsx`
  - `harrys-boutique-next/src/components/store/product-grid.tsx`
  - `harrys-boutique-next/src/components/store/search-input.tsx`
  - `harrys-boutique-next/src/components/store/sort-select.tsx`
  - `harrys-boutique-next/src/components/store/checkout-progress.tsx`
  - `harrys-boutique-next/src/components/store/cart-page-client.tsx`
  - `harrys-boutique-next/src/components/store/profile-page-client.tsx`
  - `harrys-boutique-next/src/components/admin/navbar.tsx`
  - `harrys-boutique-next/src/components/admin/sidebar.tsx`
  - Encabezados de Dashboard, Productos y Clientes Admin.
- Cambios realizados:
  - Se reemplazaron botones, paginación, búsqueda, ordenamiento y empty states
    por primitives/tokens compartidos.
  - Se normalizaron estados de navegación de cuenta y Admin.
  - Se mejoró la semántica del progreso de checkout con navegación accesible.
  - Se ajustaron encabezados operativos para compartir la jerarquía editorial.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npm run test` — 24 archivos, 284 tests.
  - `npm run build`.
  - `git diff --check`.
  - `npm run lint` — continúa bloqueado por 43 archivos preexistentes fuera de
    esta fase.
- Resultado:
  - Build, TypeScript y tests permanecen estables.
  - La paleta fría legacy ya no domina visualmente las superficies migradas.
- Pendientes:
  - Completar migración de Footer, Checkout completo, CRUD Admin, modales y
    tablas restantes.
  - Reducir progresivamente la capa de compatibilidad y limpiar las clases
    legacy del código fuente.
- Riesgos detectados:
  - La auditoría visual final en navegador con sesiones autenticadas sigue
    siendo necesaria para validar responsive, modales y datos reales.

## 2026-07-13 - Design System Visual Audit Phase 3

- Rama usada: `codex/ui-design-system-audit`.
- Objetivo de la fase: completar la segunda pasada sobre Footer, Cart Drawer,
  checkout, tablas Admin y componentes de estados/modales.
- Archivos modificados:
  - `harrys-boutique-next/src/components/store/footer.tsx`
  - `harrys-boutique-next/src/components/store/cart-drawer.tsx`
  - `harrys-boutique-next/src/components/store/checkout-page-client.tsx`
  - `harrys-boutique-next/src/components/admin/hero-manager.tsx`
  - `harrys-boutique-next/src/components/admin/product-list.tsx`
  - `harrys-boutique-next/src/components/admin/order-list.tsx`
  - `harrys-boutique-next/src/components/admin/coupon-list.tsx`
  - `harrys-boutique-next/src/components/ui/design-system.tsx`
  - `harrys-boutique-next/src/app/globals.css`
- Cambios realizados:
  - Footer usa el contenedor y botones del Design System.
  - Cart Drawer usa overlay, dialog semantics, focus labels y botones de marca.
  - Checkout reutiliza el campo global y mantiene estados de dirección/pago.
  - Tablas de productos y cupones usan el wrapper responsive compartido.
  - Hero Admin deja de usar el gradiente purple/pink y adopta el acento de marca.
  - Se añadieron `Textarea`, `FormField`, `ModalShell` y `StatusBadge`.
  - Se mapearon gradientes y bordes legacy restantes hacia la paleta cálida.
- Validaciones ejecutadas:
  - `npm run type-check`.
  - `npm run test` — 24 archivos, 284 tests.
  - `npm run build`.
  - `git diff --check`.
  - `npm run lint` — quedan 40 archivos legacy sin formato.
- Resultado:
  - Build, TypeScript y tests pasan después de esta fase.
  - Las superficies globales y operativas principales ya no muestran la paleta
    fría como lenguaje visual dominante.
- Pendientes:
  - Limpieza final de clases legacy en formularios Admin y wizard.
  - Revisión visual en navegador con sesiones autenticadas y viewports reales.
  - Resolver las 40 advertencias Prettier y las vulnerabilidades de `npm audit`
    en una fase separada para no introducir upgrades breaking sin revisión.
- Riesgos detectados:
  - El `ModalShell` define el contrato visual y semántico, pero los modales
    legacy todavía deben migrarse uno por uno para aprovecharlo completamente.

## 2026-07-13 - Home Content Management Phase 2

- Rama usada: `codex/home-content-admin`.
- Objetivo de la fase: completar la administración de categorías, productos por
  categoría e Instagram sin alterar la composición visual del Home.
- Archivos principales modificados:
  - `harrys-boutique-next/prisma/schema.prisma`
  - `harrys-boutique-next/prisma/migrations/20260713130000_add_home_content_management/migration.sql`
  - `harrys-boutique-next/src/lib/home-content.ts`
  - `harrys-boutique-next/src/app/(store)/page.tsx`
  - `harrys-boutique-next/src/components/store/home-editorial-sections.tsx`
  - `harrys-boutique-next/src/app/(admin)/admin/home/page.tsx`
  - `harrys-boutique-next/src/components/admin/home-content-manager.tsx`
  - `harrys-boutique-next/src/app/api/admin/home-content/route.ts`
  - `harrys-boutique-next/src/components/admin/instagram-manager.tsx`
- Cambios realizados:
  - Las colecciones, productos destacados, Instagram y testimonios ya leen
    contenido real desde Prisma con fallbacks de catálogo válidos.
  - Se añadió administración de bloques por categoría con modo automático o
    manual, máximo, orden y visibilidad.
  - Se añadió alta de categorías desde el módulo de Home y edición de sus
    metadatos de portada.
  - Las mutaciones requieren sesión Admin, rate limit y validación Zod; la
    selección manual valida que los productos pertenezcan a la categoría y
    estén activos.
  - Visítanos conserva contenido en código y dejó de mostrar placeholders de
    desarrollo.
- Validaciones ejecutadas:
  - `npx prisma generate --no-engine`.
  - `npm run db:migrate:deploy` — migración aplicada correctamente al entorno
    configurado.
  - `npm run type-check`.
  - `npm run test` — 24 archivos, 284 tests.
  - `npm run build`.
  - `git diff --check`.
- Resultado:
  - La fase de conexión de datos y administración queda implementada y el
    proyecto compila.
- Pendientes:
  - Falta una verificación visual autenticada del nuevo panel en navegador.
  - `prisma generate` normal sigue bloqueado por un archivo de motor retenido
    por otro proceso de Windows; se usó `--no-engine` sin modificar lógica.
  - Lint/Prettier global mantiene advertencias legacy fuera de esta fase.
- Riesgos detectados:
  - Los bloques por categoría ya están disponibles para el Home, pero no se
    añadió una nueva sección visual porque el alcance exige conservar la
    estructura editorial actual.

## 2026-07-13 - Home Content Management Phase 3

- Rama usada: `codex/home-content-admin`.
- Objetivo de la fase: permitir seleccionar imágenes locales desde el Admin para
  las portadas de Colecciones.
- Archivos modificados:
  - `harrys-boutique-next/src/components/admin/home-content-manager.tsx`
  - `harrys-boutique-next/src/components/store/home-editorial-sections.tsx`
- Decisión de almacenamiento:
  - Las imágenes no se guardan en Git ni como binarios en Supabase.
  - Se reutiliza `POST /api/upload`, protegido para Admin, con Vercel Blob.
  - Supabase conserva únicamente la URL pública en `Category.homeImage`.
  - El selector valida JPG, PNG y WEBP hasta 5 MB; muestra vista previa y
    permite reemplazar la URL antes de guardar la categoría.
- Validaciones ejecutadas:
  - `npm run build`.
  - `npm run type-check`.
  - `npm run test` — 24 archivos, 284 tests.
- Resultado:
  - El flujo de carga y vista previa queda integrado sin alterar el diseño del
    Home.

## 2026-07-13 - Home Placeholder Cleanup

- Rama usada: `codex/home-content-admin`.
- Objetivo: eliminar textos de placeholder visibles y evitar que se dibujen
  sobre imágenes reales.
- Archivo modificado:
  - `harrys-boutique-next/src/components/store/home-editorial-sections.tsx`
- Resultado:
  - Las imágenes reales se renderizan directamente desde `Placeholder`.
  - Los fallbacks sin imagen conservan solo el fondo visual, sin “IMAGEN
    PENDIENTE” ni textos de desarrollo.
- Validaciones: `npm run type-check`, `npm run build`, `npm run test` y
  `git diff --check` correctos.

## 2026-07-13 - Featured Products Admin Control

- Rama usada: `codex/home-content-admin`.
- Objetivo: alinear la selección visible del Admin con los cuatro productos que
  aparecían por fallback en el Home.
- Archivos modificados:
  - `harrys-boutique-next/src/app/(admin)/admin/home/page.tsx`
  - `harrys-boutique-next/src/components/admin/home-content-manager.tsx`
  - `harrys-boutique-next/src/app/api/admin/home-content/route.ts`
- Cambios realizados:
  - Si aún no existe configuración persistida, Admin preselecciona cuatro
    productos activos y disponibles.
  - Se añadieron miniaturas y estado de disponibilidad al selector.
  - Cliente y servidor impiden guardar menos de cuatro productos visibles.
  - El guardado posterior convierte la selección en la fuente explícita del
    Home.
- Validaciones: `npm run type-check`, `npm run build`, `npm run test` y
  `git diff --check` correctos.

## 2026-07-13 - Featured Products Ordering UI

- Rama usada: `codex/home-content-admin`.
- Objetivo: simplificar el Admin y hacer explícito el control de orden de los
  productos destacados.
- Archivo principal modificado:
  - `harrys-boutique-next/src/components/admin/home-content-manager.tsx`
- Cambios realizados:
  - Se ocultó del panel la sección de bloques por categoría, que no aportaba a
    la operación actual.
  - Productos destacados separados de productos disponibles.
  - Cada seleccionado muestra miniatura, posición, botones subir/bajar y quitar.
  - Se puede introducir directamente la posición 1, 2, 3, etc.
  - Se conserva el mínimo obligatorio de cuatro productos.
- Validaciones: `npm run type-check`, `npm run build`, `npm run test` y
  `git diff --check` correctos.

## 2026-07-13 - Collections Ordering and Featured Grid

- Rama usada: `codex/home-content-admin`.
- Objetivo: permitir reordenar colecciones y mejorar la densidad del selector
  de productos destacados.
- Archivo modificado:
  - `harrys-boutique-next/src/components/admin/home-content-manager.tsx`
- Cambios realizados:
  - Colecciones ahora muestran posición y controles subir/bajar, además del
    campo numérico existente.
  - Productos seleccionados se muestran en dos columnas desde tablet/desktop.
  - Mobile conserva una sola columna para facilitar la operación táctil.
- Validaciones: `npm run type-check`, `npm run build`, `npm run test` y
  `git diff --check` correctos.

- Se añadió la acción protegida `categories` para guardar el orden completo de
  las colecciones en una sola operación transaccional.

## 2026-07-13 - Editorial About and Contact Pages

- Rama usada: `codex/home-content-admin`.
- Objetivo: alinear Nosotros y Contacto con el lenguaje editorial del Home.
- Archivos modificados:
  - `harrys-boutique-next/src/components/store/about-page-client.tsx`
  - `harrys-boutique-next/src/app/(store)/contact/page.tsx`
- Cambios realizados:
  - Nosotros pasó de una secuencia predominantemente textual a una composición
    editorial con hero visual, imágenes reales, historia breve, valores,
    timeline y cierre fotográfico.
  - Contacto ahora tiene hero visual, formulario destacado, canales de atención,
    ubicación y enlaces de ayuda con los primitives compartidos.
  - Se reutilizaron imágenes existentes del proyecto sin agregar dependencias ni
    cambiar el flujo de contacto.
- Validaciones: `npm run type-check`, `npm run build`, `npm run test` y
  `git diff --check` correctos.
