# Fix: Persistencia del Orden de Hero Slides

## 🐛 Problema Identificado

Cuando se reordenaban los slides en el admin panel usando drag & drop, el orden se actualizaba en el estado local pero **no persistía** al recargar la página. Los slides volvían a su orden original.

## 🔍 Causa Raíz

El problema tenía dos causas:

1. **Cache de Next.js**: La página principal tiene `revalidate = 60`, lo que cachea los datos por 60 segundos
2. **Falta de revalidación**: Los endpoints API no estaban invalidando el cache después de actualizar la base de datos

## ✅ Solución Implementada

### 1. **Agregado `revalidatePath` a todos los endpoints**

Se importó y utilizó `revalidatePath` de Next.js para invalidar el cache inmediatamente después de cada operación:

#### `/api/hero-slides/reorder/route.ts` (Reordenar)
```typescript
import { revalidatePath } from 'next/cache'

// Después de actualizar el orden
revalidatePath('/', 'page')
revalidatePath('/admin/hero', 'page')
```

#### `/api/hero-slides/route.ts` (Crear)
```typescript
import { revalidatePath } from 'next/cache'

// Después de crear un nuevo slide
revalidatePath('/', 'page')
revalidatePath('/admin/hero', 'page')
```

#### `/api/hero-slides/[id]/route.ts` (Editar y Eliminar)
```typescript
import { revalidatePath } from 'next/cache'

// Después de editar o eliminar
revalidatePath('/', 'page')
revalidatePath('/admin/hero', 'page')
```

### 2. **Verificación del Schema**

Confirmado que el campo `order` existe en el schema de Prisma:

```prisma
model HeroSlide {
  id        String   @id @default(uuid())
  title     String
  subtitle  String
  image     String
  productId String
  order     Int      @default(0)  // ✅ Campo order presente
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("hero_slides")
}
```

### 3. **Verificación del Query**

La página principal ya estaba ordenando correctamente:

```typescript
prisma.heroSlide.findMany({
  orderBy: { order: 'asc' },  // ✅ Ordenamiento correcto
  include: { product: { select: { id: true, name: true } } },
})
```

## 🎯 Resultado

Ahora cuando reordenas los slides:

1. ✅ El orden se guarda en la base de datos
2. ✅ El cache se invalida inmediatamente
3. ✅ Al recargar la página, el orden persiste
4. ✅ Los cambios se reflejan tanto en el admin como en el storefront

## 🧪 Cómo Probar

1. Ve a `/admin/hero`
2. Arrastra un slide para cambiar su posición
3. Espera el mensaje "Orden actualizado"
4. Recarga la página (F5)
5. ✅ El orden debe mantenerse

## 📝 Archivos Modificados

1. ✅ `src/app/api/hero-slides/reorder/route.ts` - Agregado revalidatePath
2. ✅ `src/app/api/hero-slides/route.ts` - Agregado revalidatePath
3. ✅ `src/app/api/hero-slides/[id]/route.ts` - Agregado revalidatePath

## 🔮 Mejoras Adicionales Implementadas

- **Revalidación en todas las operaciones**: Crear, editar, eliminar y reordenar
- **Invalidación de múltiples rutas**: Tanto la home (`/`) como el admin (`/admin/hero`)
- **Feedback inmediato**: Los cambios se ven sin necesidad de esperar 60 segundos

## 📚 Documentación de Referencia

- [Next.js revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js Data Cache](https://nextjs.org/docs/app/building-your-application/caching#data-cache)

---

**Fix implementado exitosamente** ✨
