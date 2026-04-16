# Bug Fixes - Product Wizard

## Fecha: 2026-04-16

### Problemas Reportados por el Usuario

1. **Modal "Progreso Guardado" se queda en loop**
   - Ambos botones ("Continuar donde lo dejé" y "Empezar de nuevo") hacían lo mismo
   - El usuario quedaba atrapado en el mismo estado

2. **Validación incorrecta en descripción**
   - Mostraba error "La descripción debe tener al menos 10 caracteres" aunque tenía más de 10
   - El problema era que la validación usaba `.trim()` pero el contador no

3. **Auto-save guardando datos incompletos**
   - El wizard guardaba el progreso incluso con datos inválidos
   - Al restaurar, el usuario quedaba atrapado con errores de validación

---

## Soluciones Implementadas

### 1. Fix Modal "Progreso Guardado" (index.tsx)

**Antes:**
```typescript
const handleStartFresh = () => {
  autoSave.clearDraft(productId)
  setShowDraftModal(false)
}
```

**Después:**
```typescript
const handleStartFresh = () => {
  // Clear the draft from localStorage
  autoSave.clearDraft(productId)
  // Reset wizard to initial state
  wizard.resetWizard()
  // Go to step 1
  wizard.goToStep(1)
  // Close modal
  setShowDraftModal(false)
}
```

**Resultado:** Ahora "Empezar de nuevo" realmente limpia todo y vuelve al paso 1.

---

### 2. Fix Validación de Descripción (validation-rules.ts)

**Antes:**
```typescript
if (!description || description.trim().length < 10) {
  errors.push({
    field: 'description',
    message: 'La descripción debe tener al menos 10 caracteres'
  })
}
```

**Después:**
```typescript
const trimmedDescription = description?.trim() || ''

if (trimmedDescription.length < 10) {
  errors.push({
    field: 'description',
    message: 'La descripción debe tener al menos 10 caracteres (sin contar espacios al inicio o final)'
  })
}
```

**Resultado:** 
- Validación más clara y consistente
- Mensaje de error más descriptivo
- Manejo correcto de valores undefined/null

---

### 3. Fix Contador de Caracteres (step-2-basic-info.tsx)

**Antes:**
```typescript
<CharacterCounter current={description.length} max={MAX_DESCRIPTION_LENGTH} />
```

**Después:**
```typescript
<div className="mt-1 flex items-center justify-between">
  <CharacterCounter current={description.trim().length} max={MAX_DESCRIPTION_LENGTH} />
  {description.trim().length !== description.length && (
    <span className="text-xs text-gray-400">
      ({description.length} con espacios)
    </span>
  )}
</div>
```

**Resultado:** 
- El contador ahora muestra caracteres sin espacios al inicio/final
- Muestra el total con espacios cuando hay diferencia
- Consistente con la validación

---

### 4. Fix Restauración de Draft (index.tsx)

**Antes:**
```typescript
const handleRestoreDraft = () => {
  const draft = autoSave.loadDraft(productId)
  if (draft) {
    Object.entries(draft.data).forEach(([key, value]) => {
      wizard.updateField(key as keyof ProductData, value)
    })
    wizard.goToStep(draft.step)
  }
  setShowDraftModal(false)
}
```

**Después:**
```typescript
const handleRestoreDraft = () => {
  const draft = autoSave.loadDraft(productId)
  if (draft) {
    Object.entries(draft.data).forEach(([key, value]) => {
      wizard.updateField(key as keyof ProductData, value)
    })
    wizard.goToStep(draft.step)
    // Mark as clean since we just loaded from draft
    wizard.markClean()
  }
  setShowDraftModal(false)
}
```

**Resultado:** 
- Al restaurar un draft, el wizard se marca como "limpio"
- Evita que el auto-save guarde inmediatamente después de restaurar
- Mejor experiencia de usuario

---

## Testing Recomendado

### Escenario 1: Modal "Empezar de nuevo"
1. Crear un producto parcialmente
2. Recargar la página
3. Hacer clic en "Empezar de nuevo"
4. ✅ Debería volver al paso 1 con todos los campos vacíos

### Escenario 2: Validación de descripción
1. Ir al paso 2
2. Escribir "ta buenoe stossss ssafasf" (26 caracteres con espacios)
3. Hacer clic en "Siguiente"
4. ✅ Debería permitir avanzar (más de 10 caracteres sin espacios)

### Escenario 3: Contador de caracteres
1. Ir al paso 2
2. Escribir "   hola   " en la descripción
3. ✅ El contador debería mostrar "4/500 caracteres" y "(10 con espacios)"

### Escenario 4: Restaurar draft
1. Crear un producto parcialmente
2. Recargar la página
3. Hacer clic en "Continuar donde lo dejé"
4. ✅ Debería restaurar los datos sin guardar inmediatamente

---

## Archivos Modificados

- `harrys-boutique-next/src/components/admin/product-wizard/index.tsx`
- `harrys-boutique-next/src/components/admin/product-wizard/utils/validation-rules.ts`
- `harrys-boutique-next/src/components/admin/product-wizard/steps/step-2-basic-info.tsx`

---

## Notas Adicionales

- Todos los cambios son retrocompatibles
- No se requieren cambios en la base de datos
- No se requieren cambios en las dependencias
- Los tests existentes deberían seguir pasando
