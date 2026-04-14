# Plan de Implementación: Rediseño UI/UX de Harry's Boutique

## Resumen

Implementación incremental del rediseño visual y funcional de Harry's Boutique. Se comienza por los tokens de diseño (base de todo), luego los componentes compartidos, después las páginas del frontend, el panel admin y finalmente los tests. No se requieren nuevas dependencias.

## Tareas

- [x] 1. Tokens de diseño y configuración base
  - Reemplazar el contenido de `harrys-boutique-next/src/app/globals.css` con la paleta cálida definida en el diseño: variables CSS para colores, tipografía, espaciado, bordes, sombras y transiciones
  - Importar la fuente `Playfair Display` desde Google Fonts en `harrys-boutique-next/src/app/layout.tsx` y aplicarla como variable CSS `--font-display`
  - Aplicar la misma paleta cálida en `admin/src/index.css` para coherencia de marca entre tienda y panel admin
  - Crear la función utilitaria `formatPrice(price: number): string` en `harrys-boutique-next/src/lib/utils.ts` que use `Intl.NumberFormat` con locale `es-CL` y símbolo `$`
  - Crear la función utilitaria `calculateContrastRatio(hex1: string, hex2: string): number` en `harrys-boutique-next/src/lib/utils.ts`
  - _Requisitos: 1.1, 1.2, 1.3, 15.7_

- [x] 2. Componentes UI reutilizables de la tienda
  - [x] 2.1 Crear componente `SkeletonCard` en `harrys-boutique-next/src/components/ui/skeleton-card.tsx`
    - Placeholder animado con `animate-pulse` para tarjetas de producto
    - _Requisitos: 4.7, 16.4_

  - [x] 2.2 Crear componente `StarRating` en `harrys-boutique-next/src/components/ui/star-rating.tsx`
    - Recibe `average: number` y `count: number`, renderiza estrellas SVG y el conteo
    - _Requisitos: 5.6, 7.6_

  - [x] 2.3 Crear componente `FilterChip` en `harrys-boutique-next/src/components/ui/filter-chip.tsx`
    - Chip con etiqueta y botón de eliminar, estilo `bg-accent-light text-accent-dark rounded-full`
    - _Requisitos: 6.3_

  - [x] 2.4 Crear componente `Toast` / configurar sistema de notificaciones en `harrys-boutique-next/src/components/ui/toast.tsx`
    - Notificaciones temporales para confirmaciones y errores en español
    - _Requisitos: 10.2, 15.6, 16.6_

- [x] 3. Navbar de la tienda
  - Modificar `harrys-boutique-next/src/components/store/navbar.tsx`:
    - Reemplazar texto plano por `<Image src="/harrys_logo.png">` con dimensiones fijas
    - Cambiar fondo a `bg-[var(--color-background)]/90 backdrop-blur-md` para efecto glassmorphism sticky
    - Actualizar indicador activo a color `--color-accent` (línea o subrayado)
    - Cambiar badge del carrito a fondo `--color-accent` con texto blanco
    - Mostrar iniciales del usuario en círculo de color acento cuando está autenticado
    - Agregar transición de hover en ítems de navegación ≤ 200ms
    - Implementar drawer mobile con `framer-motion` (`AnimatePresence`) con fondo `--color-surface` y logo en header
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 15.1_

  - [ ]* 3.1 Escribir test de propiedad: indicador activo único en el Navbar
    - **Propiedad 2: Indicador activo único en el Navbar**
    - **Valida: Requisito 2.2**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/navbar.property.test.tsx`

  - [ ]* 3.2 Escribir test de propiedad: badge del carrito refleja la cantidad correcta
    - **Propiedad 3: Badge del carrito refleja la cantidad correcta**
    - **Valida: Requisito 2.4**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/navbar.property.test.tsx`

  - [ ]* 3.3 Escribir tests de ejemplo para el Navbar
    - Verificar que muestra el logo como imagen
    - Verificar que muestra el nombre del usuario cuando está autenticado
    - Verificar que muestra el menú hamburguesa en viewport mobile
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/navbar.test.tsx`

- [x] 4. Hero Section
  - Modificar `harrys-boutique-next/src/components/store/hero-section.tsx`:
    - Aumentar altura a `h-[500px] sm:h-[600px]`
    - Agregar botones prev/next con posición absoluta cuando `slides.length > 1`
    - Implementar transición entre slides con `framer-motion` `AnimatePresence` (fade, 500ms)
    - Reemplazar overlay plano por gradiente `bg-gradient-to-r from-black/50 to-transparent`
    - Implementar fallback mejorado: logo + tagline "Moda para tu mejor amigo" + botón a `/collection`
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 4.1 Escribir test de propiedad: controles de navegación presentes con múltiples slides
    - **Propiedad 4: Controles de navegación del Hero presentes con múltiples slides**
    - **Valida: Requisito 3.2**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/hero-section.property.test.tsx`

  - [ ]* 4.2 Escribir test de propiedad: contenido del slide siempre visible
    - **Propiedad 5: Contenido del slide siempre visible**
    - **Valida: Requisito 3.3**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/hero-section.property.test.tsx`

  - [ ]* 4.3 Escribir tests de ejemplo para el Hero Section
    - Verificar que muestra el banner fallback cuando no hay slides
    - Verificar que muestra el botón CTA en el slide
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/hero-section.test.tsx`

- [x] 5. Product Card
  - Modificar `harrys-boutique-next/src/components/store/product-card.tsx`:
    - Agregar props `bestSeller?: boolean` y `originalPrice?: number` a la interfaz `Product`
    - Implementar badge "Best Seller" con posición `absolute top-2 left-2`, fondo `--color-gold`
    - Implementar segunda imagen en hover con dos `<Image>` y clases `opacity-0/100 group-hover:opacity-100/0`
    - Mostrar precio original tachado con `<span className="line-through">` cuando `originalPrice` existe
    - Integrar componente `StarRating` cuando `ratingCount > 0`
    - Agregar `shadow-sm hover:shadow-hover transition-shadow` y bordes redondeados
    - Cambiar visibilidad del botón wishlist a `opacity-0 group-hover:opacity-100`
    - Agregar placeholder de imagen cuando la imagen no carga (ícono + nombre del producto)
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 15.4_

  - [ ]* 5.1 Escribir test de propiedad: badge Best Seller aparece para productos marcados
    - **Propiedad 6: Badge Best Seller aparece para productos marcados**
    - **Valida: Requisitos 4.3, 5.4**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/product-card.property.test.tsx`

  - [ ]* 5.2 Escribir test de propiedad: segunda imagen presente en el DOM
    - **Propiedad 7: Segunda imagen presente en el DOM para productos con múltiples imágenes**
    - **Valida: Requisito 5.2**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/product-card.property.test.tsx`

  - [ ]* 5.3 Escribir test de propiedad: precio original tachado cuando hay descuento
    - **Propiedad 8: Precio original tachado cuando hay descuento**
    - **Valida: Requisito 5.3**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/product-card.property.test.tsx`

  - [ ]* 5.4 Escribir test de propiedad: estrellas visibles cuando hay calificaciones
    - **Propiedad 9: Estrellas visibles cuando hay calificaciones**
    - **Valida: Requisito 5.6**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/product-card.property.test.tsx`

  - [ ]* 5.5 Escribir test de ejemplo: placeholder cuando la imagen no carga
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/product-card.test.tsx`

- [x] 6. Checkpoint — Componentes base
  - Asegurarse de que todos los tests pasen. Consultar al usuario si surgen dudas.

- [x] 7. Página de Inicio
  - Modificar `harrys-boutique-next/src/app/(store)/page.tsx`:
    - Agregar `<CategoryGrid>` entre `HeroSection` y `LatestCollection`
    - Agregar `<Testimonials>` entre `BestSeller` y `OurPolicy`
    - Mostrar `<SkeletonCard>` mientras los productos cargan
  - Mejorar `harrys-boutique-next/src/components/store/category-grid.tsx`:
    - Mostrar categorías con imagen de fondo o ícono SVG representativo
    - Agregar overlay de color acento con opacidad en hover
  - Crear `harrys-boutique-next/src/components/store/testimonials.tsx`:
    - Grid de 3 columnas en desktop, 1 en mobile
    - 3 testimonios estáticos con foto placeholder, nombre y comentario
    - Tarjetas con `shadow-sm` y comillas decorativas en color acento
  - Actualizar `harrys-boutique-next/src/components/store/newsletter-box.tsx` con diseño de gradiente o imagen de fondo de color acento
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x]* 7.1 Escribir test de propiedad: Skeletons presentes en estado de carga
    - **Propiedad 13: Skeletons presentes en estado de carga**
    - **Valida: Requisitos 4.7, 16.4**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/latest-collection.property.test.tsx`

- [x] 8. Página de Colección
  - Modificar `harrys-boutique-next/src/app/(store)/collection/page.tsx`:
    - Agregar encabezado con título, descripción y breadcrumb `Inicio > Colecciones`
    - Mostrar conteo de resultados actualizado en tiempo real
    - Implementar estado vacío ilustrado cuando no hay productos con los filtros aplicados
    - Agregar opciones de ordenamiento (más reciente, precio asc/desc, mejor valorado)
    - Implementar paginación con números de página, botones anterior/siguiente
  - Modificar `harrys-boutique-next/src/components/store/collection-filters.tsx`:
    - Integrar componente `FilterChip` para mostrar chips de filtros activos
    - Agregar botón "Limpiar todos" cuando hay filtros activos
    - Implementar drawer deslizante en mobile para los filtros
  - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 8.1 Escribir test de propiedad: chips de filtros activos reflejan los filtros aplicados
    - **Propiedad 10: Chips de filtros activos reflejan los filtros aplicados**
    - **Valida: Requisito 6.3**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/collection-filters.property.test.tsx`

  - [ ]* 8.2 Escribir test de propiedad: paginación correcta según el número de páginas
    - **Propiedad 11: Paginación correcta según el número de páginas**
    - **Valida: Requisito 6.7**
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/product-grid.property.test.tsx`

  - [ ]* 8.3 Escribir test de ejemplo: estado vacío cuando no hay productos con filtros
    - Archivo: `harrys-boutique-next/src/components/store/__tests__/collection-filters.test.tsx`

- [x] 9. Página de Producto
  - Modificar `harrys-boutique-next/src/components/store/product-gallery.tsx`:
    - Agregar thumbnails clicables con borde de color acento cuando están seleccionados
    - Implementar zoom en hover en desktop con `transform: scale(1.5)` y `overflow: hidden`
  - Modificar `harrys-boutique-next/src/components/store/product-info.tsx`:
    - Agregar breadcrumb `Inicio > {categoría} > {nombre del producto}`
    - Mostrar precio original tachado y porcentaje de descuento cuando `originalPrice` existe
    - Actualizar selectores de talla/color con estado seleccionado en color acento e indicación de no disponible
    - Agregar animación de carga en botón "Agregar al carrito" con `framer-motion`
  - Verificar que la sección de reseñas muestre distribución de calificaciones (barras de porcentaje por estrella)
  - Verificar que la sección de productos relacionados esté presente al final de la página
  - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 10. Cart Drawer
  - Modificar `harrys-boutique-next/src/components/store/cart-drawer.tsx`:
    - Implementar animación de entrada/salida con `framer-motion` `AnimatePresence` (`x: '100%' → 0 → '100%'`, 300ms)
    - Agregar estado vacío con ícono de carrito y botón "Explorar colección"
    - Implementar barra de progreso de envío gratis con umbral configurable (`freeShippingThreshold?: number`, default 50000)
    - Actualizar botón "Ir al checkout" con fondo `--color-primary` y texto blanco
    - Cambiar badge de cantidad a color `--color-accent`
    - Verificar que cada ítem muestre imagen, nombre, talla, color, cantidad y precio unitario
    - Verificar que los botones +/- actualicen el subtotal en tiempo real
  - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 11. Footer de la tienda
  - Modificar `harrys-boutique-next/src/components/store/footer.tsx`:
    - Agregar logo de Harry's Boutique como imagen en la primera columna
    - Agregar íconos de redes sociales (Instagram, Facebook) con links
    - Agregar columna "Ayuda" con links a Envíos, Devoluciones, FAQ
    - Agregar íconos SVG inline de métodos de pago (MercadoPago, Visa, Mastercard)
    - Integrar formulario de newsletter
    - Cambiar fondo a `--color-surface`
    - Implementar layout responsivo: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
    - Agregar copyright con año actual dinámico
  - _Requisitos: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 12. Página "Nosotros"
  - Reemplazar el contenido de `harrys-boutique-next/src/app/(store)/about/page.tsx` con:
    - Hero de la página: imagen de fondo + título "Nuestra Historia"
    - Historia narrativa: texto en 2 columnas con imagen lateral
    - Sección Misión y Visión: dos tarjetas con ícono y texto
    - Grid de 4 valores con ícono SVG y descripción
    - Sección de Harry (la mascota): foto + historia
    - Estadísticas: 4 números destacados (clientes, productos, años, reseñas)
    - CTA final: botón a `/collection`
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 13. Página de Contacto
  - Reemplazar el contenido de `harrys-boutique-next/src/app/(store)/contact/page.tsx` con:
    - Layout de 2 columnas en desktop (formulario | info de contacto)
    - Formulario con campos nombre, email, asunto, mensaje y validación en tiempo real
    - Toast de confirmación al enviar y limpieza del formulario tras envío exitoso
    - Columna de info: email, teléfono, redes sociales con íconos y horario de atención
  - _Requisitos: 10.1, 10.2, 10.3, 10.4_

- [x] 14. Checkpoint — Frontend completo
  - Asegurarse de que todos los tests pasen. Consultar al usuario si surgen dudas.

- [x] 15. Panel Admin — Layout y navegación
  - Modificar `admin/src/components/Sidebar.jsx`:
    - Reemplazar imágenes PNG por íconos SVG inline para cada sección
    - Traducir etiquetas al español: "Agregar Producto", "Productos", "Hero Slides", "Órdenes", "Configuración"
    - Aplicar estilo de ítem activo: fondo `--color-accent-light`, texto `--color-accent-dark`, borde izquierdo de color acento
    - Implementar colapso a solo íconos en pantallas < 768px
  - Modificar `admin/src/components/Navbar.jsx`:
    - Mostrar logo como imagen (`harrys_logo.png`)
    - Agregar nombre del administrador (desde localStorage o hardcoded)
    - Agregar botón logout con ícono SVG de salida
  - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5, 15.2_

  - [x]* 15.1 Escribir test de ejemplo: Sidebar muestra textos en español
    - Archivo: `admin/src/__tests__/sidebar.test.jsx`

- [x] 16. Panel Admin — Dashboard
  - Crear `admin/src/pages/Dashboard.jsx`:
    - Grid de 4 tarjetas de métricas: Total órdenes, Ingresos del mes, Productos activos, Órdenes pendientes
    - Tabla de últimas órdenes
    - Conectar a los endpoints existentes del backend para obtener los datos
  - Actualizar `admin/src/App.jsx` para que la ruta `/` apunte al Dashboard en lugar de redirigir a `/list`
  - _Requisitos: 12.6_

- [x] 17. Panel Admin — Gestión de Productos
  - Modificar `admin/src/pages/Add.jsx`:
    - Organizar el formulario en secciones con separadores visuales: Imágenes, Información básica, Categorización, Variantes, Precio
    - Agregar soporte drag-and-drop en zonas de carga de imágenes con `onDragOver`/`onDrop`
    - Aplicar estilos consistentes a todos los inputs: `border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 focus:ring-2 focus:ring-accent`
    - Mostrar mensajes de error descriptivos cuando falla el guardado
  - Modificar `admin/src/pages/List.jsx`:
    - Agregar columna "Estado" (activo/inactivo) con badge de color semántico
    - Agregar buscador por nombre en la parte superior
    - Agregar filtro por categoría (select)
    - Mejorar modal de confirmación de eliminación mostrando el nombre del producto
    - Agregar indicadores de carga (skeleton o spinner) mientras se obtienen datos
  - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 15.5_

- [x] 18. Panel Admin — Gestión de Órdenes
  - Modificar `admin/src/pages/Orders.jsx`:
    - Agregar filtros por estado con contadores (tabs o pills en la parte superior)
    - Formatear fechas en español: `toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })`
    - Aplicar colores semánticos al selector de estado: amarillo=pendiente, azul=procesando, verde=enviado, morado=entregado
    - Mostrar ID abreviado (últimos 8 caracteres del `_id`)
    - Agregar estado vacío con mensaje descriptivo cuando no hay órdenes
    - Implementar panel expandible o modal para ver detalles del pedido
  - _Requisitos: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 19. Panel Admin — Manejo de errores y sesión
  - Agregar interceptor de axios en `admin/src/App.jsx` (o en un archivo `admin/src/lib/api.js`):
    - Detectar respuestas 401, limpiar token del localStorage, redirigir al login con toast explicativo
    - Mostrar mensajes de error descriptivos del servidor en lugar de "Error" genérico
  - _Requisitos: 15.6, 13.7_

- [x] 20. Checkpoint — Panel Admin completo
  - Asegurarse de que todos los tests pasen. Consultar al usuario si surgen dudas.

- [x] 21. Tests de propiedades — Funciones utilitarias
  - [ ]* 21.1 Escribir test de propiedad: contraste de color suficiente
    - **Propiedad 1: Contraste de color suficiente**
    - **Valida: Requisito 1.4**
    - Archivo: `harrys-boutique-next/src/lib/__tests__/utils.property.test.ts`

  - [ ]* 21.2 Escribir test de propiedad: formato de precio correcto
    - **Propiedad 12: Formato de precio correcto**
    - **Valida: Requisito 15.7**
    - Archivo: `harrys-boutique-next/src/lib/__tests__/utils.property.test.ts`

- [x] 22. Accesibilidad y correcciones finales
  - Revisar todas las páginas de la tienda y agregar atributos `alt` descriptivos en todas las imágenes
  - Verificar que todos los elementos interactivos tengan indicador de foco visible al navegar con teclado
  - Verificar uso de etiquetas semánticas HTML correctas (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) en todas las páginas
  - Verificar que todas las imágenes de producto usen `next/image` con `sizes` apropiados y lazy loading
  - Verificar que los precios en toda la tienda usen la función `formatPrice` con símbolo `$` y separadores de miles
  - _Requisitos: 1.4, 1.5, 15.3, 15.7, 16.1, 16.2, 16.3, 16.5_

- [x] 23. Checkpoint final — Verificación integral
  - Asegurarse de que todos los tests pasen. Consultar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints garantizan validación incremental
- Los tests de propiedades usan `fast-check` (ya instalado en `harrys-boutique-next`)
- Los tests de ejemplo usan Vitest + React Testing Library
- No se requieren nuevas dependencias: Next.js 16, Tailwind CSS v4 y framer-motion ya están instalados
