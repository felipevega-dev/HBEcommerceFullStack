# Optimización de Imágenes - Next.js Image

## 🎯 Problema Resuelto

Se corrigieron todos los warnings de Next.js Image relacionados con:
1. ❌ Imágenes con `width` o `height` sin el otro
2. ❌ Imágenes con `fill` sin la prop `sizes`

## ✅ Soluciones Implementadas

### 1. **Logo de Harry's Boutique**

**Problema:**
```
Image with src "/harrys_logo.png" has either width or height modified
```

**Solución:**
```tsx
<Image
  src="/harrys_logo.png"
  alt="Harry's Boutique"
  width={120}
  height={120}  // ✅ Agregado
  className="object-contain"
  priority      // ✅ Para logos principales
/>
```

**Archivos actualizados:**
- ✅ `src/components/store/navbar.tsx` (2 instancias)
- ✅ `src/components/admin/navbar.tsx`
- ✅ `src/components/store/hero-section.tsx`

---

### 2. **Imágenes con `fill` - Agregado `sizes`**

La prop `sizes` le dice a Next.js qué tamaño tendrá la imagen en diferentes breakpoints para optimizar la carga.

#### **ProductCard (Tarjetas de Productos)**

```tsx
<Image
  src={image}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
  loading="lazy"
  className="object-cover"
/>
```

**Significado:**
- Móvil (≤640px): 50% del viewport width (2 columnas)
- Tablet (≤768px): 33% del viewport width (3 columnas)
- Desktop (≤1024px): 25% del viewport width (4 columnas)
- Desktop grande: 20% del viewport width (5 columnas)

**Archivo:** `src/components/store/product-card.tsx`

---

#### **Product Gallery (Galería Principal)**

```tsx
// Imagen principal
<Image
  src={images[current]}
  alt={name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
  className="object-contain"
  priority
/>

// Miniaturas
<Image
  src={img}
  alt={`${name} ${i + 1}`}
  fill
  sizes="(max-width: 768px) 80px, 100px"
  className="object-cover"
/>
```

**Archivo:** `src/components/store/product-gallery.tsx`

---

#### **Cart Drawer (Carrito)**

```tsx
<Image
  src={item.image}
  alt={item.name}
  fill
  sizes="64px"  // Tamaño fijo de 64px
  className="object-cover"
/>
```

**Archivo:** `src/components/store/cart-drawer.tsx`

---

#### **Orders List (Lista de Pedidos)**

```tsx
<Image
  src={item.image}
  alt={item.name}
  fill
  sizes="64px"
  className="object-cover"
/>
```

**Archivo:** `src/components/store/orders-list.tsx`

---

#### **Profile Image (Foto de Perfil)**

```tsx
<Image
  src={user.profileImage}
  alt="Profile"
  fill
  sizes="96px"  // 24 * 4 = 96px
  className="object-cover"
/>
```

**Archivo:** `src/components/store/profile-page-client.tsx`

---

#### **Product Info (Mini Preview)**

```tsx
<Image
  src={product.images[0]}
  alt={product.name}
  fill
  sizes="80px"
  className="object-cover"
/>
```

**Archivo:** `src/components/store/product-info.tsx`

---

#### **Admin - Hero Manager**

```tsx
// Preview del nuevo slide
<Image
  src={newSlide.image}
  alt="preview"
  fill
  sizes="(max-width: 768px) 100vw, 400px"
  className="object-cover"
/>

// Miniatura en la lista
<Image
  src={slide.image}
  alt={slide.title}
  fill
  sizes="160px"
  className="object-cover"
/>
```

**Archivo:** `src/components/admin/hero-manager.tsx`

---

#### **Admin - Product Form**

```tsx
<Image
  src={img}
  alt={`img-${i}`}
  fill
  sizes="96px"
  className="object-cover"
/>
```

**Archivo:** `src/components/admin/product-form.tsx`

---

## 📊 Beneficios de la Optimización

### 1. **Performance Mejorado**
- ✅ Next.js carga el tamaño correcto de imagen para cada dispositivo
- ✅ Menos datos transferidos en móviles
- ✅ Carga más rápida de páginas

### 2. **Mejor Experiencia de Usuario**
- ✅ Imágenes HD en todos los dispositivos
- ✅ Sin pixelación ni distorsión
- ✅ Carga progresiva optimizada

### 3. **SEO y Core Web Vitals**
- ✅ Mejor LCP (Largest Contentful Paint)
- ✅ Menor CLS (Cumulative Layout Shift)
- ✅ Mejor puntuación en Lighthouse

---

## 🎨 Guía de `sizes` por Uso

### Imágenes de Productos en Grid
```tsx
sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
```

### Imagen Principal de Producto
```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
```

### Miniaturas y Avatares
```tsx
sizes="64px"  // o "80px", "96px" según el tamaño
```

### Hero Banner
```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
```

---

## 📁 Archivos Modificados

1. ✅ `src/components/store/navbar.tsx`
2. ✅ `src/components/admin/navbar.tsx`
3. ✅ `src/components/store/hero-section.tsx`
4. ✅ `src/components/store/product-card.tsx`
5. ✅ `src/components/store/product-gallery.tsx`
6. ✅ `src/components/store/cart-drawer.tsx`
7. ✅ `src/components/store/orders-list.tsx`
8. ✅ `src/components/store/profile-page-client.tsx`
9. ✅ `src/components/store/product-info.tsx`
10. ✅ `src/components/admin/hero-manager.tsx`
11. ✅ `src/components/admin/product-form.tsx`

---

## 🧪 Verificación

Para verificar que no hay más warnings:

1. Ejecuta el proyecto: `npm run dev`
2. Abre la consola del navegador
3. Navega por las páginas principales
4. ✅ No deberías ver warnings de Next.js Image

---

## 📚 Referencias

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Image sizes prop](https://nextjs.org/docs/api-reference/next/image#sizes)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

---

**Optimización completada exitosamente** ✨

Todas las imágenes ahora se cargan en HD con el tamaño óptimo para cada dispositivo.
