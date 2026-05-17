# WORK_LOG.md

Registro de avance del trabajo en este repositorio. La aplicacion activa esta
en `harrys-boutique-next/`.

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
