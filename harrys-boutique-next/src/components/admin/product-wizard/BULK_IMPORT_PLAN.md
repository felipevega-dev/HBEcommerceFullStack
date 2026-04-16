# Plan: Importación Masiva de Productos desde Excel

## 🎯 Objetivo

Permitir a los usuarios importar múltiples productos a la vez desde un archivo Excel (.xlsx), facilitando la carga inicial de inventario y actualizaciones masivas.

---

## 📋 Requisitos Funcionales

### 1. Formato de Excel Esperado

**Columnas requeridas:**
- `nombre` - Nombre del producto (3-100 caracteres)
- `descripcion` - Descripción del producto (10-500 caracteres)
- `precio` - Precio de venta (número positivo)
- `categoria` - Nombre de la categoría (debe existir en BD)
- `subcategoria` - Nombre de la subcategoría
- `tallas` - Tallas separadas por coma (ej: "S,M,L,XL")
- `colores` - Colores separados por coma (ej: "Rojo,Azul,Negro")
- `stock` - Cantidad en stock (número entero >= 0)

**Columnas opcionales:**
- `precio_original` - Precio antes de descuento (para productos con descuento)
- `mas_vendido` - "SI" o "NO" (default: NO)
- `activo` - "SI" o "NO" (default: SI)
- `imagen_1`, `imagen_2`, `imagen_3`, `imagen_4` - URLs de imágenes

**Ejemplo de fila:**
```
nombre: Collar para Perro Ajustable
descripcion: Collar de nylon resistente ideal para perros de todas las razas
precio: 1500
precio_original: 2000
categoria: Perros
subcategoria: Collares
tallas: S,M,L
colores: Rojo,Negro,Azul
stock: 50
mas_vendido: SI
activo: SI
imagen_1: https://cloudinary.com/...
```

---

## 🏗️ Arquitectura Propuesta

### Componentes Nuevos

```
src/components/admin/product-import/
├── index.tsx                    # Componente principal de importación
├── file-upload-zone.tsx         # Zona de drag & drop para Excel
├── preview-table.tsx            # Vista previa de productos a importar
├── validation-errors.tsx        # Lista de errores de validación
├── import-progress.tsx          # Barra de progreso durante importación
├── import-summary.tsx           # Resumen de importación exitosa
└── utils/
    ├── excel-parser.ts          # Parsear archivo Excel a JSON
    ├── validate-import.ts       # Validar datos antes de importar
    └── batch-import.ts          # Importar productos en lotes
```

### API Endpoints

```typescript
// POST /api/products/import/validate
// Valida el archivo Excel sin importar
{
  file: File,
  dryRun: true
}
// Response: { valid: boolean, errors: [], preview: [] }

// POST /api/products/import/execute
// Ejecuta la importación en lotes
{
  products: ProductData[],
  batchSize: 10
}
// Response: { success: number, failed: number, errors: [] }
```

---

## 🔄 Flujo de Usuario

### Paso 1: Subir Archivo
1. Usuario hace clic en "Importar Excel"
2. Se abre modal con zona de drag & drop
3. Usuario arrastra archivo .xlsx o hace clic para seleccionar
4. Sistema valida que sea un archivo Excel válido

### Paso 2: Validación y Vista Previa
1. Sistema parsea el Excel y extrae los datos
2. Valida cada fila según las reglas del wizard
3. Muestra tabla de vista previa con:
   - ✅ Productos válidos (en verde)
   - ❌ Productos con errores (en rojo con mensaje)
4. Usuario puede:
   - Descargar plantilla de Excel vacía
   - Corregir errores y volver a subir
   - Continuar solo con productos válidos

### Paso 3: Importación
1. Usuario confirma importación
2. Sistema importa en lotes de 10 productos
3. Muestra barra de progreso en tiempo real
4. Maneja errores de red con reintentos

### Paso 4: Resumen
1. Muestra resumen final:
   - ✅ X productos importados exitosamente
   - ❌ Y productos fallaron (con detalles)
2. Opción de descargar reporte de errores
3. Botón para volver a la lista de productos

---

## 🛠️ Implementación Técnica

### Librerías Necesarias

```bash
npm install xlsx          # Parsear archivos Excel
npm install papaparse     # Alternativa para CSV
```

### Validación de Datos

Reutilizar las funciones de validación existentes:
```typescript
import { validateWizardStep } from '../product-wizard/utils/validation-rules'

function validateImportRow(row: any): ValidationResult {
  // Convertir fila de Excel a ProductData
  const productData = mapExcelRowToProductData(row)
  
  // Validar cada paso del wizard
  const errors = []
  for (let step = 1; step <= 6; step++) {
    const result = validateWizardStep(step, productData)
    if (!result.valid) {
      errors.push(...result.errors)
    }
  }
  
  return { valid: errors.length === 0, errors }
}
```

### Importación en Lotes

```typescript
async function batchImport(
  products: ProductData[],
  batchSize: number = 10,
  onProgress: (current: number, total: number) => void
) {
  const results = { success: 0, failed: 0, errors: [] }
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    
    try {
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        body: JSON.stringify({ products: batch })
      })
      
      const data = await response.json()
      results.success += data.success
      results.failed += data.failed
      results.errors.push(...data.errors)
      
      onProgress(i + batch.length, products.length)
    } catch (error) {
      results.failed += batch.length
      results.errors.push({ batch: i, error: error.message })
    }
  }
  
  return results
}
```

---

## 📊 Plantilla de Excel

Crear una plantilla descargable con:
- Encabezados en la primera fila
- Ejemplos en las filas 2-5
- Validación de datos en Excel (dropdowns para categorías, etc.)
- Instrucciones en una hoja separada

**Ubicación:** `public/templates/plantilla-productos.xlsx`

---

## 🔐 Seguridad y Validación

### Límites
- Máximo 100 productos por importación
- Máximo 5MB de tamaño de archivo
- Timeout de 5 minutos para importación completa

### Validaciones
- ✅ Formato de archivo (solo .xlsx)
- ✅ Estructura de columnas correcta
- ✅ Tipos de datos correctos
- ✅ Categorías existen en BD
- ✅ URLs de imágenes válidas
- ✅ No duplicados por nombre

### Manejo de Errores
- Errores de validación: mostrar en UI, no importar
- Errores de red: reintentar 3 veces
- Errores de BD: rollback del lote completo
- Timeout: cancelar importación, mostrar progreso parcial

---

## 🎨 UI/UX Considerations

### Modal de Importación
- Ancho: 800px (más grande que modales normales)
- Pasos claros: Subir → Validar → Importar → Resumen
- Indicador de progreso visible
- Opción de cancelar en cualquier momento

### Tabla de Vista Previa
- Scroll horizontal para muchas columnas
- Máximo 50 filas visibles (con paginación)
- Colores: verde para válidos, rojo para errores
- Tooltip con detalles de error al hover

### Feedback Visual
- Spinner durante parseo del Excel
- Barra de progreso durante importación
- Animación de éxito al completar
- Lista de errores descargable como .txt

---

## 📝 Tareas de Implementación

### Fase 1: Infraestructura (2-3 horas)
- [ ] Instalar dependencias (xlsx)
- [ ] Crear estructura de carpetas
- [ ] Crear plantilla de Excel descargable
- [ ] Crear tipos TypeScript para importación

### Fase 2: Parseo y Validación (3-4 horas)
- [ ] Implementar excel-parser.ts
- [ ] Implementar validate-import.ts
- [ ] Reutilizar validation-rules.ts del wizard
- [ ] Crear tests unitarios

### Fase 3: UI Components (4-5 horas)
- [ ] FileUploadZone con drag & drop
- [ ] PreviewTable con scroll y colores
- [ ] ValidationErrors con detalles
- [ ] ImportProgress con barra animada
- [ ] ImportSummary con estadísticas

### Fase 4: API y Backend (3-4 horas)
- [ ] POST /api/products/import/validate
- [ ] POST /api/products/bulk (importación en lotes)
- [ ] Manejo de transacciones y rollback
- [ ] Rate limiting para evitar abuso

### Fase 5: Integración (2-3 horas)
- [ ] Integrar modal en página de productos
- [ ] Conectar todos los componentes
- [ ] Manejo de errores end-to-end
- [ ] Testing manual completo

### Fase 6: Polish y Documentación (1-2 horas)
- [ ] Animaciones y transiciones
- [ ] Mensajes de error user-friendly
- [ ] Documentación de uso
- [ ] Video tutorial (opcional)

**Total estimado: 15-21 horas**

---

## 🚀 Mejoras Futuras

### V2: Importación Avanzada
- Soporte para CSV además de Excel
- Importación de imágenes desde URLs
- Actualización masiva de productos existentes
- Exportar productos a Excel

### V3: Validación Inteligente
- Sugerencias automáticas para categorías
- Detección de duplicados por similitud de nombre
- Auto-completado de subcategorías según categoría
- Validación de URLs de imágenes (fetch HEAD)

### V4: Integración con Proveedores
- Importar desde catálogos de proveedores
- Sincronización automática de stock
- Actualización de precios en tiempo real

---

## 📚 Referencias

- [SheetJS (xlsx) Documentation](https://docs.sheetjs.com/)
- [File Upload Best Practices](https://web.dev/file-upload-best-practices/)
- [Batch Processing Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/batch-processing)

---

## ✅ Checklist de Lanzamiento

Antes de habilitar el botón "Importar Excel":
- [ ] Todas las fases implementadas y testeadas
- [ ] Plantilla de Excel disponible para descarga
- [ ] Documentación de usuario creada
- [ ] Tests de carga (100 productos simultáneos)
- [ ] Manejo de errores robusto
- [ ] Logs de auditoría implementados
- [ ] Aprobación de usuario final (tu mamá)

---

**Nota:** Este documento es un plan de trabajo. Actualizar según feedback durante implementación.
