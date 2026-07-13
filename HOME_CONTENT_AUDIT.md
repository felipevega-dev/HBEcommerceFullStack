# Auditoría de contenido administrable del Home

## Estado actual

El Home se compone principalmente en `src/components/store/home-editorial-sections.tsx`.
La composición visual ya existe, pero las secciones de colecciones, productos,
Instagram y testimonios usan arrays, placeholders o textos de reserva definidos
en el componente.

## Secciones auditadas

| Sección | Estado actual | Soporte reutilizable | Decisión |
| --- | --- | --- | --- |
| Hero | Imagen y copy editorial del frontend | `HeroSlide` existe para otro flujo, pero el Hero actual no consume ese módulo | Mantener en código por ahora |
| Colecciones | Tres tarjetas hardcodeadas y placeholders | `Category` existe, pero solo tiene nombre, subcategorías y productos | Extender `Category` con metadatos de Home |
| Nuestra Historia | Texto e imagen placeholder editorial | `AboutContent`/Settings administra la página Nosotros | Mantener en código en Home, según alcance |
| Productos destacados | Cuatro tarjetas hardcodeadas y placeholders | `Product.bestSeller` ya existe; falta orden/visibilidad específica de Home | Crear configuración de selección Home reutilizable |
| Harry's Atelier | Copy, beneficios e imagen placeholder | No existe módulo equivalente | Mantener en código |
| Instagram | Seis placeholders y enlace fijo | `InstagramPost` y `InstagramManager` ya existen | Extender el modelo existente para publicación manual en Home |
| Testimonios | Testimonio de reserva hardcodeado | `Testimonial`, CRUD, estado y orden ya existen | Conectar directamente a testimonios APPROVED + activos |
| Visítanos | Copy, mapa e imagen placeholder | No existe módulo equivalente claro | Mantener en código |

## Modelos y módulos existentes

- `Category`: fuente real de categorías y relación de productos.
- `Product`: fuente real de productos, `active`, `bestSeller`, imágenes, stock y
  categoría.
- `InstagramPost`: ya cubre carga manual, caption, estado y orden operativo; se
  ampliará únicamente con datos de presentación pública del Home.
- `Testimonial`: ya cubre nombre, avatar, comentario, rating, activo, estado y
  orden; no se crea otro módulo.
- `HeroSlide`: pertenece al flujo existente de hero/admin y no se mezcla con las
  secciones editoriales protegidas por esta tarea.
- `Settings`: se conserva para configuración editorial ya existente de Nosotros,
  pero no se usará para mover Visítanos, Atelier ni Nuestra Historia del Home.

## Modelos nuevos previstos

- Metadatos de Home en `Category`: slug, imagen, texto secundario, destino,
  visibilidad y orden.
- `HomeProduct`: selección explícita de productos del Home, orden y visibilidad.
- `HomeCategoryBlock`: bloques configurables por categoría, selección automática o
  manual, cantidad y orden.

La migración será aditiva y no eliminará categorías, productos, testimonios ni
publicaciones existentes. Los fallbacks de frontend solo se usarán mientras no
haya contenido administrado, sin mostrar placeholders de desarrollo en producción
cuando exista una sección sin contenido válido.

## Criterio de implementación

Se conservarán exactamente los componentes visuales actuales. Solo cambiarán las
fuentes de datos y los estados vacíos. Las mutaciones Admin deberán pasar por la
autorización existente y validar imagen, URL, orden, visibilidad y relaciones.
