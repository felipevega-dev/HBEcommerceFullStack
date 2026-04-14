# Documento de Diseño — Rediseño UI/UX de Harry's Boutique

## Resumen

Este documento describe el diseño técnico para el rediseño completo de la interfaz de Harry's Boutique. Cubre dos superficies: el **Frontend** (Next.js 16 App Router en `harrys-boutique-next/`) y el **Panel de Administración** (React + Vite en `admin/`). No se requieren nuevas dependencias ni cambios de esquema de base de datos.

---

## Arquitectura

El proyecto mantiene su arquitectura actual sin cambios estructurales:

```
harrys-boutique-next/          ← Tienda pública (Next.js 16 App Router)
  src/
    app/
      globals.css              ← Tokens de diseño (CSS custom properties)
      (store)/                 ← Páginas de la tienda
    components/
      store/                   ← Componentes de la tienda
      ui/                      ← Componentes UI reutilizables
admin/                         ← Panel de administración (React + Vite)
  src/
    components/                ← Navbar, Sidebar, Login
    pages/                     ← Add, List, Orders, Settings, Hero
    index.css                  ← Tokens de diseño del admin
```

**Principios de implementación:**
- Los tokens de diseño se definen como CSS custom properties en `globals.css` (tienda) e `index.css` (admin)
- Tailwind CSS v4 en la tienda consume los tokens vía `@theme` o clases utilitarias
- Framer Motion (ya instalado) se usa para animaciones de entrada/salida
- No se crean nuevas dependencias

---

## Componentes e Interfaces

### 1. Sistema de Diseño — Tokens Visuales

**Archivo:** `harrys-boutique-next/src/app/globals.css`

Reemplazar el esquema actual de grises neutros por una paleta cálida que evoque el mundo de las mascotas y la moda:

```css
@import "tailwindcss";

:root {
  /* Paleta principal — tonos cálidos */
  --color-primary: #1a1a1a;
  --color-primary-hover: #333333;

  /* Acento — rosa palo elegante */
  --color-accent: #c9a0a0;
  --color-accent-light: #f0e0e0;
  --color-accent-dark: #a07070;

  /* Dorado suave para detalles premium */
  --color-gold: #c8a96e;
  --color-gold-light: #f5e6c8;

  /* Neutros cálidos (reemplazan grises fríos) */
  --color-background: #fdfaf7;
  --color-surface: #f7f2ed;
  --color-surface-2: #efe8e0;
  --color-border: #e8ddd5;
  --color-border-strong: #d4c4b8;

  /* Texto */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #6b5c52;
  --color-text-muted: #9e8e84;

  /* Semánticos */
  --color-success: #4a7c59;
  --color-error: #c0392b;
  --color-warning: #c8a96e;
  --color-info: #4a6fa5;

  /* Tipografía */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Geist', system-ui, sans-serif;

  /* Espaciado base */
  --spacing-section: 5rem;
  --spacing-section-sm: 3rem;

  /* Bordes */
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm: 0 1px 3px rgba(26, 10, 5, 0.06), 0 1px 2px rgba(26, 10, 5, 0.04);
  --shadow-md: 0 4px 12px rgba(26, 10, 5, 0.08), 0 2px 4px rgba(26, 10, 5, 0.04);
  --shadow-lg: 0 8px 24px rgba(26, 10, 5, 0.10), 0 4px 8px rgba(26, 10, 5, 0.06);
  --shadow-hover: 0 12px 32px rgba(26, 10, 5, 0.12);

  /* Transiciones */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

**Fuente de display:** Importar `Playfair Display` desde Google Fonts en `layout.tsx` para títulos de secciones. La fuente `Geist` existente se mantiene para el cuerpo.

**Archivo:** `admin/src/index.css`

Aplicar la misma paleta cálida al panel admin para coherencia de marca.

---

### 2. Navbar de la Tienda

**Archivo:** `harrys-boutique-next/src/components/store/navbar.tsx`

**Cambios respecto al estado actual:**

| Elemento | Estado actual | Estado nuevo |
|---|---|---|
| Logo | Texto `Harry's Boutique` | `<Image src="/harrys_logo.png">` con dimensiones fijas |
| Indicador activo | Línea negra bajo el ítem | Línea de color acento (`--color-accent`) |
| Badge carrito | Fondo negro | Fondo `--color-accent` |
| Fondo navbar | `bg-white/80` | `bg-[var(--color-background)]/90` con `backdrop-blur-md` |
| Hover ítems | `hover:text-black` | Transición a `--color-primary` en ≤ 200ms |
| Usuario autenticado | Solo ícono genérico | Iniciales del nombre en círculo de color acento |
| Mobile drawer | Fondo blanco básico | Fondo `--color-surface` con logo en header |

**Estructura del componente (pseudocódigo):**
```
<nav sticky backdrop-blur bg-background/90>
  <Logo imagen harrys_logo.png />
  <NavItems con indicador activo de color acento />
  <Actions>
    <SearchIcon />
    <ProfileDropdown con iniciales del usuario />
    <CartButton con badge de color acento />
    <HamburgerButton (solo mobile) />
  </Actions>
  <MobileDrawer animado con framer-motion />
</nav>
```

---

### 3. Hero Section

**Archivo:** `harrys-boutique-next/src/components/store/hero-section.tsx`

**Cambios:**

- Altura: `h-[500px] sm:h-[600px]` (aumentar de 400/500px actuales)
- Agregar flechas prev/next cuando `slides.length > 1`
- Transición entre slides: usar `framer-motion` con `AnimatePresence` y variante `fade` (opacity 0→1, 500ms)
- Fallback mejorado: mostrar logo, tagline "Moda para tu mejor amigo" y botón a `/collection`
- Overlay gradiente: `bg-gradient-to-r from-black/50 to-transparent` en lugar del overlay plano actual

**Interfaz de flechas:**
```tsx
// Botones prev/next con posición absoluta
<button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 
                   backdrop-blur-sm rounded-full p-3 transition-all">
  <ChevronLeftIcon />
</button>
```

---

### 4. Product Card

**Archivo:** `harrys-boutique-next/src/components/store/product-card.tsx`

**Cambios:**

- Agregar prop `bestSeller?: boolean` y `originalPrice?: number`
- Badge "Best Seller": posición `absolute top-2 left-2`, fondo `--color-gold`, texto blanco, `text-xs font-medium`
- Segunda imagen en hover: usar dos `<Image>` con `opacity-0 group-hover:opacity-100` y `opacity-100 group-hover:opacity-0`
- Estrellas: mostrar cuando `ratingCount > 0` con componente `StarRating`
- Precio tachado: `<span className="line-through text-muted">` cuando `originalPrice` existe
- Sombra y elevación: `shadow-sm hover:shadow-hover transition-shadow`
- Wishlist: cambiar visibilidad de `opacity-100` a `opacity-0 group-hover:opacity-100`

**Interfaz actualizada:**
```tsx
interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  ratingAverage?: number
  ratingCount?: number
  wishlisted?: boolean
  showWishlist?: boolean
  bestSeller?: boolean
}
```

---

### 5. Página de Inicio

**Archivo:** `harrys-boutique-next/src/app/(store)/page.tsx`

Agregar `CategoryGrid` entre `HeroSection` y `LatestCollection`:

```tsx
<main>
  <HeroSection slides={heroSlides} />
  <section className="space-y-[var(--spacing-section)]">
    <CategoryGrid categories={categories} />   {/* NUEVO */}
    <LatestCollection />
    <BestSeller />
    <Testimonials />                           {/* NUEVO */}
    <OurPolicy />
    <NewsletterBox />
  </section>
</main>
```

**Nuevo componente `Testimonials`:**
- Archivo: `harrys-boutique-next/src/components/store/testimonials.tsx`
- Datos estáticos (3 testimonios con foto placeholder, nombre y comentario)
- Layout: grid de 3 columnas en desktop, 1 en mobile
- Estilo: tarjetas con `shadow-sm`, comillas decorativas en color acento

**Componente `CategoryGrid` (ya existe, mejorar):**
- Archivo: `harrys-boutique-next/src/components/store/category-grid.tsx`
- Mostrar categorías con imagen de fondo o ícono SVG representativo
- Hover: overlay de color acento con opacidad

---

### 6. Página de Colección

**Archivo:** `harrys-boutique-next/src/app/(store)/collection/page.tsx`

Agregar breadcrumb en el encabezado:
```tsx
<nav aria-label="breadcrumb">
  <ol className="flex gap-2 text-sm text-muted">
    <li><Link href="/">Inicio</Link></li>
    <li>/</li>
    <li aria-current="page">Colecciones</li>
  </ol>
</nav>
```

**Archivo:** `harrys-boutique-next/src/components/store/collection-filters.tsx`

Agregar chips de filtros activos:
```tsx
{hasFilters && (
  <div className="flex flex-wrap gap-2 mb-4">
    {selectedCategories.map(cat => (
      <FilterChip key={cat} label={cat} onRemove={() => removeFilter('category', cat)} />
    ))}
    {/* ... otros filtros activos */}
    <button onClick={clearAll}>Limpiar todos</button>
  </div>
)}
```

**Nuevo componente `FilterChip`:**
```tsx
// Chip con etiqueta y botón X
<span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-light 
                 text-accent-dark rounded-full text-sm">
  {label}
  <button onClick={onRemove}>×</button>
</span>
```

---

### 7. Página de Producto

**Archivo:** `harrys-boutique-next/src/components/store/product-gallery.tsx`

- Agregar soporte para zoom en hover en desktop (CSS `transform: scale(1.5)` con `overflow: hidden`)
- Thumbnails clicables con borde de color acento cuando están seleccionados

**Archivo:** `harrys-boutique-next/src/components/store/product-info.tsx`

- Agregar breadcrumb: `Inicio > {categoría} > {nombre}`
- Mostrar precio original tachado y porcentaje de descuento cuando aplique
- Selectores de talla/color con estado seleccionado en color acento
- Botón "Agregar al carrito" con animación de carga usando `framer-motion`

---

### 8. Cart Drawer

**Archivo:** `harrys-boutique-next/src/components/store/cart-drawer.tsx`

**Cambios:**

- Animación de entrada/salida: usar `framer-motion` con `AnimatePresence`
  ```tsx
  <motion.div
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    transition={{ type: 'tween', duration: 0.3 }}
  />
  ```
- Estado vacío: agregar ícono de carrito vacío y botón "Explorar colección"
- Barra de progreso de envío gratis: mostrar cuánto falta para alcanzar el umbral
- Botón "Ir al checkout" prominente (fondo `--color-primary`, texto blanco)
- Color del badge de cantidad: `--color-accent`

---

### 9. Footer

**Archivo:** `harrys-boutique-next/src/components/store/footer.tsx`

**Cambios:**

- Agregar logo de Harry's Boutique (imagen) en la primera columna
- Agregar íconos de redes sociales (Instagram, Facebook) con links
- Agregar columna "Ayuda" con links a Envíos, Devoluciones, FAQ
- Agregar íconos de métodos de pago (MercadoPago, Visa, Mastercard) como SVG inline
- Agregar formulario de newsletter integrado (mover desde `NewsletterBox` o duplicar)
- Fondo: `--color-surface` en lugar de blanco puro
- Responsive: columnas apiladas en mobile con `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

---

### 10. Página "Nosotros"

**Archivo:** `harrys-boutique-next/src/app/(store)/about/page.tsx`

Reemplazar el contenido mínimo actual con secciones completas:

```
1. Hero de la página: imagen de fondo + título "Nuestra Historia"
2. Historia narrativa: texto en 2 columnas con imagen lateral
3. Misión y Visión: dos tarjetas con ícono y texto
4. Valores: grid de 4 valores con ícono SVG y descripción
5. Harry (la mascota): foto + historia de la mascota inspiradora
6. Estadísticas: 4 números destacados (clientes, productos, años, reseñas)
7. CTA final: botón a /collection
```

---

### 11. Página de Contacto

**Archivo:** `harrys-boutique-next/src/app/(store)/contact/page.tsx`

Reemplazar el contenido mínimo con:

```
Layout: 2 columnas en desktop (formulario | info de contacto)

Columna izquierda — Formulario:
  - Campos: nombre, email, asunto, mensaje
  - Validación en tiempo real (required, formato email)
  - Toast de confirmación al enviar
  - Limpiar formulario tras envío exitoso

Columna derecha — Info de contacto:
  - Email con ícono
  - Teléfono con ícono
  - Redes sociales con íconos
  - Horario de atención
```

---

### 12. Panel Admin — Layout y Navegación

**Archivo:** `admin/src/components/Sidebar.jsx`

**Cambios:**

- Reemplazar imágenes PNG por íconos SVG inline para cada sección
- Traducir etiquetas al español: "Agregar Producto", "Productos", "Hero Slides", "Órdenes", "Configuración"
- Ítem activo: fondo `--color-accent-light`, texto `--color-accent-dark`, borde izquierdo de color acento
- Responsive: colapsar a solo íconos en pantallas < 768px

**Archivo:** `admin/src/components/Navbar.jsx`

**Cambios:**

- Mostrar logo como imagen (`harrys_logo.png`)
- Agregar nombre del administrador (hardcoded o desde localStorage)
- Botón logout con ícono SVG de salida

**Nuevo componente `Dashboard`:**
- Archivo: `admin/src/pages/Dashboard.jsx`
- Ruta: `/` (reemplazar el redirect actual a `/list`)
- Métricas: Total órdenes, Ingresos del mes, Productos activos, Órdenes pendientes
- Layout: grid de 4 tarjetas de métricas + tabla de últimas órdenes

---

### 13. Panel Admin — Gestión de Productos

**Archivo:** `admin/src/pages/Add.jsx`

**Cambios:**

- Organizar en secciones con separadores visuales: Imágenes, Información básica, Categorización, Variantes, Precio
- Zonas de carga de imágenes: agregar soporte drag-and-drop con `onDragOver`/`onDrop`
- Preview inmediato de imagen seleccionada (ya existe, mejorar estilo)
- Inputs con estilos consistentes: `border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 focus:ring-2 focus:ring-accent`

**Archivo:** `admin/src/pages/List.jsx`

**Cambios:**

- Agregar columna "Estado" (activo/inactivo) con badge de color semántico
- Agregar buscador por nombre en la parte superior
- Agregar filtro por categoría (select)
- Mejorar el modal de confirmación de eliminación con el nombre del producto

---

### 14. Panel Admin — Gestión de Órdenes

**Archivo:** `admin/src/pages/Orders.jsx`

**Cambios:**

- Agregar filtros por estado con contadores: tabs o pills en la parte superior
- Formato de fecha en español: `new Date(order.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })`
- Colores semánticos del selector de estado:
  - `pending` → amarillo (`bg-yellow-100 text-yellow-800`)
  - `processing` → azul (`bg-blue-100 text-blue-800`)
  - `shipped` → verde (`bg-green-100 text-green-800`)
  - `delivered` → morado (`bg-purple-100 text-purple-800`)
- Estado vacío: mensaje descriptivo cuando no hay órdenes
- ID abreviado: mostrar solo los últimos 8 caracteres del `_id`

---

## Modelos de Datos

No se requieren cambios de esquema de base de datos. Los cambios son exclusivamente de presentación.

**Extensiones de props de componentes (TypeScript):**

```typescript
// product-card.tsx — props adicionales
interface Product {
  // ... props existentes
  originalPrice?: number    // Para mostrar precio tachado
  bestSeller?: boolean      // Para mostrar badge Best Seller
}

// hero-section.tsx — sin cambios de interfaz
// cart-drawer.tsx — agregar umbral de envío gratis
interface CartDrawerProps {
  freeShippingThreshold?: number  // default: 50000
}
```

---

## Propiedades de Corrección

*Una propiedad es una característica o comportamiento que debe ser verdadero en todas las ejecuciones válidas de un sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

### Propiedad 1: Contraste de color suficiente

*Para cualquier* par (color de texto, color de fondo) definido en el sistema de diseño de Harry's Boutique, el ratio de contraste WCAG calculado debe ser mayor o igual a 4.5:1 para texto normal.

**Valida: Requisito 1.4**

---

### Propiedad 2: Indicador activo único en el Navbar

*Para cualquier* ruta de navegación válida (`/`, `/collection`, `/about`, `/contact`), al renderizar el Navbar con esa ruta como pathname activo, exactamente un ítem de navegación debe tener el indicador de estado activo.

**Valida: Requisito 2.2**

---

### Propiedad 3: Badge del carrito refleja la cantidad correcta

*Para cualquier* cantidad de ítems en el carrito mayor a cero, el badge del Navbar debe mostrar exactamente ese número.

**Valida: Requisito 2.4**

---

### Propiedad 4: Controles de navegación del Hero presentes con múltiples slides

*Para cualquier* array de slides con longitud mayor o igual a 2, el componente HeroSection debe renderizar los controles de navegación (flechas prev/next).

**Valida: Requisito 3.2**

---

### Propiedad 5: Contenido del slide siempre visible

*Para cualquier* slide con título y subtítulo no vacíos, el componente HeroSection debe renderizar ambos textos en el DOM.

**Valida: Requisito 3.3**

---

### Propiedad 6: Badge Best Seller aparece para productos marcados

*Para cualquier* producto con `bestSeller = true`, el componente ProductCard debe renderizar un badge con el texto "Best Seller".

**Valida: Requisitos 4.3, 5.4**

---

### Propiedad 7: Segunda imagen presente en el DOM para productos con múltiples imágenes

*Para cualquier* producto con 2 o más imágenes, el componente ProductCard debe incluir la segunda imagen en el DOM (aunque esté oculta hasta el hover).

**Valida: Requisito 5.2**

---

### Propiedad 8: Precio original tachado cuando hay descuento

*Para cualquier* producto con `originalPrice > price`, el componente ProductCard debe renderizar el precio original con estilo `line-through`.

**Valida: Requisito 5.3**

---

### Propiedad 9: Estrellas visibles cuando hay calificaciones

*Para cualquier* producto con `ratingCount > 0` y `ratingAverage > 0`, el componente ProductCard debe renderizar las estrellas de calificación y el conteo de reseñas.

**Valida: Requisito 5.6**

---

### Propiedad 10: Chips de filtros activos reflejan los filtros aplicados

*Para cualquier* conjunto no vacío de filtros activos (categorías, colores, tallas), el componente CollectionFilters debe renderizar un chip por cada valor de filtro activo, mostrando el valor correcto.

**Valida: Requisito 6.3**

---

### Propiedad 11: Paginación correcta según el número de páginas

*Para cualquier* `totalPages > 1` y `currentPage` válido, el componente ProductGrid debe renderizar los controles de paginación con el botón "anterior" presente cuando `currentPage > 1` y el botón "siguiente" presente cuando `currentPage < totalPages`.

**Valida: Requisito 6.7**

---

### Propiedad 12: Formato de precio correcto

*Para cualquier* precio numérico positivo, la función de formateo de precios debe producir una cadena que comience con `$` y use separadores de miles correctos según el locale `es-CL`.

**Valida: Requisito 15.7**

---

### Propiedad 13: Skeletons presentes en estado de carga

*Para cualquier* componente de listado de productos en estado de carga (`loading = true` o `products.length === 0` antes de la carga), el componente debe renderizar elementos skeleton con la clase `animate-pulse`.

**Valida: Requisitos 4.7, 16.4**

---

## Manejo de Errores

### Tienda (Next.js)

| Escenario | Comportamiento actual | Comportamiento nuevo |
|---|---|---|
| Imagen de producto no carga | Espacio en blanco | Placeholder con ícono de imagen y nombre del producto |
| Error al agregar al carrito | Sin feedback claro | Toast de error en español con mensaje descriptivo |
| Error de red en checkout | Error genérico | Toast "Error de conexión. Por favor intenta nuevamente." |
| Sesión expirada | Redirección silenciosa | Toast informativo antes de redirigir al login |

**Implementación del placeholder de imagen:**
```tsx
// En ProductCard y ProductGallery
<div className="w-full h-full flex flex-col items-center justify-center 
                bg-surface text-muted gap-2">
  <ImageIcon className="w-8 h-8" />
  <span className="text-xs text-center px-2">{product.name}</span>
</div>
```

### Panel Admin

| Escenario | Comportamiento actual | Comportamiento nuevo |
|---|---|---|
| Token expirado | Errores de red en consola | Detectar 401, limpiar token, redirigir a login con mensaje |
| Error al guardar producto | Toast genérico "Error" | Toast con mensaje del servidor o "Error al guardar. Verifica los campos." |
| Error al cargar lista | Sin feedback | Estado de error con botón "Reintentar" |

**Interceptor de axios para el admin:**
```javascript
// En App.jsx o un archivo api.js
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      setToken('')
      toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
    }
    return Promise.reject(error)
  }
)
```

---

## Estrategia de Testing

### Enfoque dual

Se usa una combinación de tests de ejemplo y tests basados en propiedades:

- **Tests de ejemplo**: verifican comportamientos específicos y estados concretos (renderizado de componentes, estados vacíos, interacciones puntuales)
- **Tests de propiedades**: verifican invariantes universales que deben cumplirse para cualquier input válido

### Librería de property-based testing

Para el frontend Next.js (TypeScript): **fast-check** (`npm install --save-dev fast-check`)

Configuración mínima por test de propiedad: **100 iteraciones** (default de fast-check).

Cada test de propiedad debe incluir un comentario de referencia:
```typescript
// Feature: ui-ux-redesign, Property N: <texto de la propiedad>
```

### Tests de ejemplo (Vitest + React Testing Library)

Cubren los criterios clasificados como EXAMPLE y SMOKE:

```
navbar.test.tsx
  ✓ muestra el logo como imagen
  ✓ muestra el nombre del usuario cuando está autenticado
  ✓ muestra el menú hamburguesa en viewport mobile

hero-section.test.tsx
  ✓ muestra el banner fallback cuando no hay slides
  ✓ muestra el botón CTA en el slide

collection-filters.test.tsx
  ✓ muestra estado vacío cuando no hay productos con filtros

product-card.test.tsx
  ✓ muestra placeholder cuando la imagen no carga

sidebar.test.jsx (admin)
  ✓ muestra los textos en español
```

### Tests de propiedades (fast-check)

Implementar una propiedad por cada Propiedad de Corrección definida:

```typescript
// Propiedad 1: Contraste de color
fc.assert(fc.property(
  fc.constantFrom(...colorPairs),
  ([textColor, bgColor]) => {
    const ratio = calculateContrastRatio(textColor, bgColor)
    return ratio >= 4.5
  }
), { numRuns: 100 })

// Propiedad 3: Badge del carrito
fc.assert(fc.property(
  fc.integer({ min: 1, max: 99 }),
  (cartCount) => {
    render(<Navbar cartCount={cartCount} />)
    const badge = screen.getByText(String(cartCount))
    return badge !== null
  }
), { numRuns: 100 })

// Propiedad 12: Formato de precio
fc.assert(fc.property(
  fc.integer({ min: 1, max: 10_000_000 }),
  (price) => {
    const formatted = formatPrice(price)
    return formatted.startsWith('$') && formatted.includes('.')
  }
), { numRuns: 100 })
```

### Tests de integración

Para el panel admin, verificar el flujo completo de autenticación y redirección cuando el token expira (1-2 ejemplos con mocks de axios).

### Cobertura objetivo

- Componentes de la tienda: ≥ 70% de cobertura de líneas
- Funciones de utilidad (formateo de precios, cálculo de contraste): 100%
- Panel admin: tests de humo para los flujos principales
