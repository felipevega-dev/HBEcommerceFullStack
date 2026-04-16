# Configuración de Vercel Blob Storage

## 🎯 ¿Por qué Vercel Blob?

- ✅ **Gratis:** 1GB de almacenamiento + 100GB de ancho de banda/mes
- ✅ **Simple:** Integración nativa con Next.js
- ✅ **Rápido:** CDN global incluido
- ✅ **Sin costos ocultos:** No como Cloudinary

---

## 📦 Instalación

Ya está instalado en el proyecto:
```bash
npm install @vercel/blob  # ✅ Ya hecho
```

---

## 🔑 Configuración (2 minutos)

### Paso 1: Crear Blob Store en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Storage** (menú lateral)
3. Click en **Create Database**
4. Selecciona **Blob**
5. Dale un nombre: `harrys-boutique-images`
6. Click **Create**

### Paso 2: Copiar el Token

1. En la página del Blob Store, ve a la pestaña **Settings**
2. Copia el **Read-Write Token** (empieza con `vercel_blob_rw_`)
3. Guárdalo para el siguiente paso

### Paso 3: Agregar Variable de Entorno

**Desarrollo local (.env.local):**
```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_tu-token-aqui"
```

**Producción (Vercel Dashboard):**
1. Ve a **Settings** → **Environment Variables**
2. Agrega:
   - **Key:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** `vercel_blob_rw_tu-token-aqui`
   - **Environments:** Production, Preview, Development
3. Click **Save**

### Paso 4: Redeploy (si ya está en producción)

Si tu app ya está desplegada:
1. Ve a **Deployments**
2. Click en los 3 puntos del último deployment
3. Click **Redeploy**

---

## ✅ Verificación

### Test Local

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Ve a `/admin/products/wizard/new`

3. Sube una imagen en el paso 1

4. Si funciona, verás la imagen subida con una URL como:
   ```
   https://abc123.public.blob.vercel-storage.com/products/...
   ```

### Test en Producción

Mismo proceso pero en tu URL de producción.

---

## 🗑️ Eliminar Cloudinary (Opcional)

Si ya no usás Cloudinary, podés:

1. **Eliminar variables de entorno:**
   ```bash
   # Ya no necesitás estas en .env.local
   # CLOUDINARY_NAME=...
   # CLOUDINARY_API_KEY=...
   # CLOUDINARY_SECRET_KEY=...
   ```

2. **Desinstalar paquete:**
   ```bash
   npm uninstall cloudinary
   ```

3. **Cancelar cuenta de Cloudinary** (si querés)

---

## 📊 Límites del Plan Gratuito

| Recurso | Límite Gratis | Suficiente para |
|---------|---------------|-----------------|
| Almacenamiento | 1 GB | ~1000 imágenes de 1MB |
| Ancho de banda | 100 GB/mes | ~100,000 vistas/mes |
| Requests | Ilimitados | ✅ |

**Para tu boutique:** Más que suficiente. Incluso con 500 productos y 4 fotos cada uno, solo usarías ~200MB.

---

## 🔄 Migración de Imágenes Existentes

Si ya tenés productos con imágenes en Cloudinary:

### Opción 1: Dejar como están (Recomendado)
- Las URLs de Cloudinary seguirán funcionando
- Solo las nuevas imágenes irán a Vercel Blob
- No hay que hacer nada

### Opción 2: Migrar todo a Vercel Blob
Script de migración (ejecutar una sola vez):

```typescript
// scripts/migrate-images.ts
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

async function migrateImages() {
  const products = await prisma.product.findMany()
  
  for (const product of products) {
    const newImages = []
    
    for (const imageUrl of product.images) {
      if (imageUrl.includes('cloudinary')) {
        // Download from Cloudinary
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        
        // Upload to Vercel Blob
        const filename = `products/migrated-${Date.now()}.jpg`
        const { url } = await put(filename, blob, { access: 'public' })
        
        newImages.push(url)
      } else {
        newImages.push(imageUrl)
      }
    }
    
    // Update product
    await prisma.product.update({
      where: { id: product.id },
      data: { images: newImages }
    })
    
    console.log(`✅ Migrated product: ${product.name}`)
  }
}

migrateImages()
```

Ejecutar:
```bash
npx tsx scripts/migrate-images.ts
```

---

## 🐛 Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN is required"
- ✅ Verificá que la variable esté en `.env.local`
- ✅ Reiniciá el servidor (`npm run dev`)

### Error: "Unauthorized"
- ✅ Verificá que el token sea correcto
- ✅ Verificá que el token tenga permisos de Read-Write

### Error: "Failed to upload"
- ✅ Verificá tu conexión a internet
- ✅ Verificá que el archivo sea una imagen válida
- ✅ Verificá que el archivo sea menor a 5MB

### Imágenes no se ven en producción
- ✅ Verificá que `BLOB_READ_WRITE_TOKEN` esté en Vercel
- ✅ Verificá que `next.config.ts` tenga el dominio correcto:
  ```typescript
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }
    ]
  }
  ```

---

## 📚 Recursos

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)
- [API Reference](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)

---

## ✨ Listo!

Tu app ahora usa Vercel Blob Storage en lugar de Cloudinary. Todo debería funcionar igual pero gratis y más simple.
