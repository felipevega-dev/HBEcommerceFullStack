# AGENTS.md

Guia obligatoria de trabajo para agentes en este repositorio. La raiz Git es
`D:\Proyectos\HarrysBoutique` y la aplicacion activa vive en
`harrys-boutique-next/`.

## 1. Forma General De Trabajo

- Antes de modificar codigo, revisar rama actual, `git status` y estado de la
  unidad de trabajo existente.
- Entender la arquitectura vigente antes de proponer o aplicar cambios.
- No hacer cambios masivos sin una razon clara, explicada y acotada.
- No romper funcionalidades existentes ni revertir cambios ajenos sin pedido
  explicito.
- Priorizar estabilidad, mantenibilidad, escalabilidad, seguridad y preparacion
  real para produccion.
- Trabajar por fases pequenas, coherentes y verificables.
- Explicar brevemente que se hara antes de editar archivos.
- Preferir patrones existentes del proyecto sobre abstracciones nuevas.
- Mantener cada cambio conectado al objetivo de la fase; evitar refactors
  oportunistas.

## 2. Flujo Por Fases

Cada mejora debe dividirse en fases pequenas. Para cada fase:

1. Definir objetivo y criterio de termino.
2. Identificar archivos o modulos que se tocaran.
3. Revisar el codigo actual y riesgos de integracion.
4. Aplicar cambios acotados.
5. Ejecutar validaciones disponibles.
6. Corregir errores con el menor cambio razonable.
7. Documentar lo realizado en `WORK_LOG.md` cuando la fase sea relevante.
8. Avanzar a la siguiente fase solo si la actual queda estable o si el bloqueo
   queda documentado.

## 3. Git Workflow

- Antes de empezar, ejecutar `git status --short --branch`.
- No trabajar directamente sobre `main` salvo que no exista otra opcion. Si hay
  cambios locales previos, crear una rama sin descartarlos.
- Crear una rama por feature, fix o fase importante. Usar nombres claros:
  - `feature/admin-product-bulk-upload`
  - `feature/checkout-payment-flow`
  - `fix/cart-price-validation`
  - `refactor/product-components`
  - `chore/cleanup-dead-code`
- En Codex, si no se pide otro prefijo, usar ramas `codex/...`.
- Mantener cambios pequenos y coherentes.
- No mezclar funcionalidades no relacionadas en el mismo commit.
- No usar `git reset --hard`, `git checkout --` o comandos destructivos sin
  pedido explicito.
- Si el worktree esta sucio, separar mentalmente cambios propios y cambios
  preexistentes antes de tocar archivos.

## 4. Politica De Commits

Usar Conventional Commits:

- `feat(admin): add bulk product import`
- `fix(checkout): validate prices server-side`
- `refactor(products): split large product card component`
- `chore(cleanup): remove unused markdown files`
- `docs(workflow): add project methodology`
- `test(orders): add order status validation tests`

Hacer commit solo cuando:

- La fase este terminada.
- El proyecto compile o el bloqueo este justificado.
- Lint, typecheck, tests y build relevantes pasen.
- No existan errores criticos conocidos.
- El commit tenga un alcance concreto y cambios relacionados.

No hacer commits gigantes que mezclen documentacion, pagos, UI, migraciones y
limpieza sin una razon operativa fuerte.

## 5. Merge Workflow

- Las ramas feature se mergean a `main` solo cuando la fase esta completa.
- Antes de mergear deben pasar build, lint, typecheck y tests disponibles.
- No debe haber cambios sin revisar ni archivos accidentales.
- El resumen de cambios debe estar documentado en la respuesta final, PR o
  `WORK_LOG.md`.
- Si el entorno permite Pull Requests, preparar la rama como PR: descripcion,
  validaciones, riesgos y capturas si aplica.
- Si no hay PR, dejar instrucciones claras de merge manual.
- No forzar merges ni resolver conflictos sin entender el origen.

## 6. Validaciones Obligatorias

Desde `harrys-boutique-next/`, intentar ejecutar segun corresponda:

- `npm install` solo si faltan dependencias o cambio el lockfile.
- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`
- `npm audit --omit=dev` antes de produccion o cambios de dependencias.
- Revisar errores de consola y logs relevantes.
- Revisar que no se rompan rutas principales: home, catalogo, producto,
  carrito, checkout, pedidos y admin.

Si un comando no existe:

- No inventarlo.
- Revisar `package.json`.
- Usar scripts disponibles.
- Recomendar el script faltante si aporta valor.

## 7. Documentacion Interna

Mantener documentacion util, breve y accionable. Documentos permitidos si hacen
falta:

- `README.md`
- `DEVELOPMENT_WORKFLOW.md`
- `ROADMAP.md`
- `PRODUCTION_CHECKLIST.md`
- `CHANGELOG.md`
- `ENVIRONMENT.md`
- `DATABASE.md`
- `ADMIN_PANEL_PLAN.md`
- `ECOMMERCE_IMPROVEMENT_PLAN.md`

No llenar el proyecto con documentos duplicados, obsoletos o de bajo valor.
Actualizar documentos existentes antes de crear nuevos cuando sea razonable.

## 8. Registro De Progreso

Usar `WORK_LOG.md` para fases relevantes. Cada entrada debe incluir:

- Fecha.
- Rama usada.
- Objetivo de la fase.
- Archivos modificados.
- Cambios realizados.
- Validaciones ejecutadas.
- Resultado.
- Pendientes.
- Riesgos detectados.

## 9. Manejo De Errores

Si aparece un error:

- No taparlo.
- No hacer cambios aleatorios.
- Analizar causa probable.
- Proponer solucion.
- Corregir con el menor cambio posible.
- Documentar error y solucion en `WORK_LOG.md` si fue relevante.

## 10. Seguridad

Nunca:

- Exponer secrets, tokens o claves privadas.
- Hardcodear credenciales.
- Subir tokens reales.
- Usar variables privadas en cliente.
- Dejar endpoints admin sin proteccion.
- Validar precios, stock, pagos o permisos solo en frontend.

Siempre:

- Revisar variables de entorno.
- Separar claves publicas y privadas.
- Validar acciones sensibles en servidor.
- Revisar permisos de admin.
- Considerar produccion desde el inicio.

## 11. Criterios De Calidad

Cada cambio debe respetar:

- TypeScript estricto si el proyecto lo usa.
- Componentes reutilizables y responsabilidades claras.
- Separacion entre logica, UI, datos y efectos externos.
- Estilos centralizados cuando tenga sentido.
- Mobile-first.
- Accesibilidad basica: labels, foco visible, contraste y estados de error.
- Performance: imagenes optimizadas, caching razonable y pocos client
  components innecesarios.
- SEO en paginas publicas.
- Codigo claro, mantenible y sin duplicacion innecesaria.
- Evitar archivos enormes; dividir cuando haya responsabilidades mezcladas.
- Evitar sobreingenieria para una tienda pequena/mediana.

## 12. Forma De Responder Al Usuario

En tareas de implementacion, responder con:

- Diagnostico breve.
- Plan por fases.
- Rama sugerida o creada.
- Archivos que se tocaran.
- Riesgos.
- Validaciones que se ejecutaran.
- Resultado final.
- Commits realizados o sugeridos.
- Pendientes.

Para tareas pequenas, mantener la respuesta proporcional y directa, sin perder
trazabilidad.

## 13. Stack Y Scripts Detectados

Aplicacion activa: `harrys-boutique-next/`.

Stack actual detectado:

- Next.js App Router 16.
- React 19.
- TypeScript.
- Prisma ORM.
- PostgreSQL local por Docker y Supabase Postgres para produccion.
- NextAuth para autenticacion y roles.
- MercadoPago para pagos.
- Resend para emails transaccionales.
- Vercel Blob para imagenes.
- Upstash Redis/rate limiting.
- Sentry preparado para observabilidad.
- Vitest y Testing Library para pruebas.
- Prettier como lint/formato.

Scripts disponibles:

- `npm run dev`
- `npm run build`
- `npm run vercel:build`
- `npm run start`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run type-check`
- `npm run check`
- `npm run db:migrate`
- `npm run db:migrate:deploy`
- `npm run db:push`
- `npm run db:studio`
- `npm run db:generate`
- `npm run admin:create`
- `npm run instagram:process`
- `npm run test`
- `npm run test:watch`
- `npm run audit`
- `npm run ci`
- `npm run prepare`

Scripts operativos recomendados ya disponibles:

- `audit`: alias para `npm audit --omit=dev`.
- `format`: alias legible para `prettier --write .`.
- `check`: alias rapido para `npm run type-check && npm run lint && npm run test`.
