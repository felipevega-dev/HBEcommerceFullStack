# WORK_LOG.md

Registro de avance del trabajo en este repositorio. La aplicacion activa esta
en `harrys-boutique-next/`.

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
