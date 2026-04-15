# Design Document

## Overview

El Product Wizard es una interfaz de creación/edición de productos dividida en 7 pasos secuenciales, diseñada para usuarios no técnicos. Reemplaza el formulario actual (`product-form.tsx`) con una experiencia guiada, visual e intuitiva que reduce la carga cognitiva y previene errores mediante validación paso a paso.

## Architecture

### Component Hierarchy

```
ProductWizard (container)
├── WizardHeader
│   ├── WizardTitle
│   └── CancelButton
├── ProgressIndicator
│   └── StepIndicator[] (7 steps)
├── WizardContent (dynamic step renderer)
│   ├── Step1_PhotoUpload
│   │   ├── ImageDropZone
│   │   ├── ImagePreviewGrid
│   │   └── ImageThumbnail[]
│   ├── Step2_BasicInfo
│   │   ├── NameInput (with character counter)
│   │   ├── DescriptionTextarea (with character counter)
│   │   └── TooltipIcon[]
│   ├── Step3_Pricing
│   │   ├── PriceInput
│   │   ├── DiscountToggle
│   │   ├── OriginalPriceInput (conditional)
│   │   └── DiscountCalculator (display only)
│   ├── Step4_Category
│   │   ├── CategoryGrid
│   │   │   └── CategoryCard[]
│   │   └── SubcategoryGrid (conditional)
│   │       └── SubcategoryCard[]
│   ├── Step5_SizesColors
│   │   ├── SizeSelector
│   │   │   └── SizeToggleButton[]
│   │   └── ColorSelector
│   │       └── ColorSwatch[]
│   ├── Step6_FinalOptions
│   │   ├── StockInput
│   │   ├── BestSellerCheckbox
│   │   ├── ActiveCheckbox
│   │   └── InactiveWarning (conditional)
│   └── Step7_Review
│       ├── ReviewSection[] (grouped by category)
│       ├── EditButton[] (per section)
│       └── ImageGalleryPreview
├── WizardNavigation
│   ├── BackButton (conditional)
│   ├── NextButton / SaveButton (conditional)
│   └── ValidationErrorDisplay
└── AutoSaveIndicator

Supporting Components:
├── TooltipSystem
├── ValidationEngine
├── ConfirmationModal
├── SuccessModal
└── ErrorModal
```

### State Management

**Local State (React useState):**
- `currentStep`: number (1-7)
- `productData`: ProductData object
- `validationErrors`: Record<string, string>
- `isDirty`: boolean (tracks unsaved changes)
- `isLoading`: boolean
- `isSaving`: boolean

**ProductData Interface:**
```typescript
interface ProductData {
  // Step 1
  images: File[] | string[]  // Files for new, URLs for existing
  imageOrder: number[]
  
  // Step 2
  name: string
  description: string
  
  // Step 3
  price: number
  hasDiscount: boolean
  originalPrice?: number
  
  // Step 4
  categoryId: string
  subCategory: string
  
  // Step 5
  sizes: string[]
  colors: string[]
  
  // Step 6
  stock: number
  bestSeller: boolean
  active: boolean
  
  // Meta
  id?: string  // Only in edit mode
  createdAt?: Date
  updatedAt?: Date
}
```

**LocalStorage (Auto-save):**
- Key: `product-wizard-draft-${productId || 'new'}`
- Value: Serialized ProductData + currentStep + timestamp
- Cleared on: successful save, explicit discard, or "start new"

### Data Flow

1. **Initialization:**
   - Check for draft in localStorage
   - If draft exists → show restore modal
   - If edit mode → fetch product data from API
   - Initialize productData state

2. **Step Navigation:**
   - User clicks "Siguiente" → validate current step
   - If valid → save to localStorage → increment currentStep
   - If invalid → display errors, focus first invalid field
   - User clicks "Anterior" → decrement currentStep (no validation)

3. **Auto-save:**
   - Triggered on: step completion, step navigation, 30s idle timer
   - Saves: productData + currentStep + timestamp to localStorage
   - Shows: "Progreso guardado" indicator with fade-out animation

4. **Final Save:**
   - User clicks "Guardar Producto" on Step 7
   - Upload images to Cloudinary (if new files)
   - POST/PUT to `/api/products` with complete data
   - On success → clear localStorage → show success modal
   - On error → keep data intact → show error modal with retry

## UI/UX Design

### Visual Design System

**Colors:**
- Primary: `#000000` (black) - buttons, selected states
- Secondary: `#6B7280` (gray-500) - secondary text
- Success: `#10B981` (green-500) - checkmarks, success states
- Error: `#EF4444` (red-500) - validation errors
- Warning: `#F59E0B` (amber-500) - warnings
- Background: `#F9FAFB` (gray-50) - page background
- Card: `#FFFFFF` - step containers

**Typography:**
- Headings: `font-semibold text-lg` (18px)
- Body: `text-base` (16px)
- Labels: `text-sm font-medium` (14px)
- Helper text: `text-xs text-gray-500` (12px)
- Character counters: `text-xs text-gray-400` (12px)

**Spacing:**
- Step container padding: `p-6` (24px)
- Section gaps: `space-y-6` (24px)
- Field gaps: `space-y-4` (16px)
- Button gaps: `gap-3` (12px)

**Borders & Shadows:**
- Cards: `rounded-xl border border-gray-200`
- Inputs: `rounded-lg border border-gray-300 focus:ring-2 focus:ring-black`
- Buttons: `rounded-lg`
- Shadows: `shadow-sm` for cards, `shadow-lg` for modals

### Step-by-Step Design

#### Progress Indicator

**Desktop (≥768px):**
```
┌─────────────────────────────────────────────────────────────┐
│  ①────②────③────④────⑤────⑥────⑦                           │
│ Fotos Info Precio Cat. Tallas Opciones Revisión             │
│  ✓    ✓     ✓    ●     ○      ○        ○                    │
└─────────────────────────────────────────────────────────────┘
```
- Completed steps: green checkmark, solid line
- Current step: filled circle, bold text
- Future steps: empty circle, gray line

**Mobile (<768px):**
```
┌──────────────────────────┐
│ Paso 4 de 7: Categoría   │
│ ████████░░░░░░░░░░░░      │
└──────────────────────────┘
```
- Compact horizontal progress bar
- Text shows "Paso X de 7: [Step Name]"

#### Step 1: Photo Upload

**Layout:**
```
┌─────────────────────────────────────────────┐
│  📷 Fotos del Producto                      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  📤 Arrastrá tus fotos aquí         │   │
│  │     o hacé click para seleccionar   │   │
│  │                                     │   │
│  │  Hasta 4 imágenes (JPG, PNG, WEBP) │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Imágenes cargadas:                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│  │ 📷 │ │ 📷 │ │ +  │ │ +  │              │
│  │ ✕  │ │ ✕  │ │    │ │    │              │
│  └────┘ └────┘ └────┘ └────┘              │
│  Principal                                  │
│                                             │
│  ⓘ La primera foto será la imagen          │
│     principal del producto                  │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Drag over → blue border animation
- Drop → instant preview thumbnail
- Hover thumbnail → show delete button (X)
- Drag thumbnail → reorder with visual feedback
- First position → auto "Principal" badge

**Validation:**
- At least 1 image required
- Max 4 images
- File types: JPG, PNG, WEBP
- Max size: 5MB per image
- Error display: red text below drop zone

#### Step 2: Basic Info

**Layout:**
```
┌─────────────────────────────────────────────┐
│  📝 Información Básica                      │
│                                             │
│  Nombre del Producto *                      │
│  ┌─────────────────────────────────────┐   │
│  │ Collar para Perro Ajustable         │   │
│  └─────────────────────────────────────┘   │
│  25/100 caracteres                          │
│                                             │
│  Descripción * ⓘ                            │
│  ┌─────────────────────────────────────┐   │
│  │ Collar ajustable de nylon resistente│   │
│  │ para perros de todas las razas...   │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│  87/500 caracteres                          │
│                                             │
│  💡 Tip: Describí el material, tamaño y     │
│     para qué mascota es ideal               │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Real-time character counter
- Tooltip on ⓘ hover: "Describí las características principales..."
- Dismissible tip box on first focus
- Auto-resize textarea as user types

**Validation:**
- Name: min 3 chars, max 100 chars
- Description: min 10 chars, max 500 chars
- Error display: red border + red text below field

#### Step 3: Pricing

**Layout:**
```
┌─────────────────────────────────────────────┐
│  💰 Precio                                  │
│                                             │
│  Precio de Venta * ⓘ                        │
│  ┌─────────────────────────────────────┐   │
│  │ $ 2500                              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ☐ Este producto tiene descuento            │
│                                             │
│  [When checked:]                            │
│  Precio Original (antes del descuento) ⓘ    │
│  ┌─────────────────────────────────────┐   │
│  │ $ 3500                              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  🎉 28% de descuento                        │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Currency symbol ($) prefix always visible
- Discount checkbox toggles original price field
- Auto-calculate discount % in real-time
- Discount % displayed with celebration emoji

**Validation:**
- Price > 0 required
- If discount: originalPrice > price
- Error display: red border + red text below field

#### Step 4: Category

**Layout:**
```
┌─────────────────────────────────────────────┐
│  🏷️ Categoría                               │
│                                             │
│  Elegí el tipo de mascota: ⓘ                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐│
│  │   🐕   │ │   🐈   │ │   🦜   │ │  🐾  ││
│  │ Perros │ │ Gatos  │ │  Aves  │ │ Otros││
│  │   ✓    │ │        │ │        │ │      ││
│  └────────┘ └────────┘ └────────┘ └──────┘│
│                                             │
│  Subcategoría:                              │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │   🦴   │ │   🎾   │ │   🍖   │          │
│  │Collares│ │Juguetes│ │Alimento│          │
│  │   ✓    │ │        │ │        │          │
│  └────────┘ └────────┘ └────────┘          │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Click category → highlight with border + checkmark
- Category selection → show subcategories below
- Change category → clear subcategory selection
- Hover → subtle scale animation

**Validation:**
- Both category and subcategory required
- Error display: red text below section

#### Step 5: Sizes & Colors

**Layout:**
```
┌─────────────────────────────────────────────┐
│  📏 Tallas y Colores                        │
│                                             │
│  Tallas disponibles * ⓘ                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ XS │ │ S  │ │ M  │ │ L  │ │ XL │       │
│  └────┘ └────┘ └────┘ └────┘ └────┘       │
│           ✓      ✓      ✓                   │
│  3 tallas seleccionadas                     │
│                                             │
│  Colores disponibles * ⓘ                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ ⬛   │ │ ⬜   │ │ 🟥   │ │ 🟦   │      │
│  │Negro │ │Blanco│ │ Rojo │ │ Azul │      │
│  │  ✓   │ │      │ │  ✓   │ │      │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│  2 colores seleccionados                    │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Click size → toggle selection (filled background)
- Click color → toggle selection (checkmark overlay)
- Real-time selection counter
- Multi-select enabled

**Validation:**
- At least 1 size required
- At least 1 color required
- Error display: red text below each section

#### Step 6: Final Options

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ⚙️ Opciones Finales                        │
│                                             │
│  Cantidad en Stock ⓘ                        │
│  ┌─────────────────────────────────────┐   │
│  │ 15                                  │   │
│  └─────────────────────────────────────┘   │
│  Dejá en 0 si no manejás stock              │
│                                             │
│  ☑ Mostrar como Más Vendido ⓘ              │
│                                             │
│  ☑ Producto Activo (visible en tienda) ⓘ   │
│                                             │
│  [If unchecked:]                            │
│  ⚠️ Este producto no estará visible         │
│     en la tienda                            │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Stock input: numeric only, min 0
- Checkboxes: toggle with visual feedback
- Warning appears/disappears based on active state

**Validation:**
- Stock ≥ 0 (optional, defaults to 0)
- No blocking validation for this step

#### Step 7: Review

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ✅ Revisión Final                          │
│                                             │
│  📷 Imágenes                        [Editar]│
│  ┌────┐ ┌────┐ ┌────┐                      │
│  │ 📷 │ │ 📷 │ │ 📷 │                      │
│  └────┘ └────┘ └────┘                      │
│  Principal                                  │
│                                             │
│  📝 Información Básica              [Editar]│
│  Nombre: Collar para Perro Ajustable       │
│  Descripción: Collar ajustable de nylon... │
│  Precio: $2,500 (28% off - antes $3,500)   │
│                                             │
│  🏷️ Categoría                      [Editar]│
│  Perros > Collares                          │
│                                             │
│  📏 Tallas y Colores               [Editar]│
│  Tallas: S, M, L                            │
│  Colores: Negro, Rojo                       │
│                                             │
│  ⚙️ Opciones                       [Editar]│
│  Stock: 15 unidades                         │
│  ✓ Más Vendido                              │
│  ✓ Activo                                   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     💾 Guardar Producto             │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Click [Editar] → jump to corresponding step
- Click "Guardar Producto" → show loading → save
- All data displayed in read-only format
- Discount shown with strikethrough original price

### Navigation Controls

**Bottom Navigation Bar:**
```
┌─────────────────────────────────────────────┐
│  [← Anterior]              [Siguiente →]    │
│                                             │
│  Progreso guardado hace 2 minutos           │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Step 1: Hide "Anterior"
- Step 7: Replace "Siguiente" with "Guardar Producto"
- Validation errors: disable "Siguiente", show error summary
- Auto-save indicator: fade in/out animation

### Modals

#### Restore Draft Modal
```
┌─────────────────────────────────────┐
│  💾 Progreso Guardado               │
│                                     │
│  Tenés un producto sin terminar     │
│  guardado el 15/04/2026 a las 14:30 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Continuar donde lo dejé     │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Empezar de nuevo]                 │
└─────────────────────────────────────┘
```

#### Cancel Confirmation Modal
```
┌─────────────────────────────────────┐
│  ⚠️ ¿Estás segura que querés salir? │
│                                     │
│  Tenés cambios sin guardar que      │
│  se perderán.                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Seguir editando             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Sí, salir sin guardar]            │
└─────────────────────────────────────┘
```

#### Success Modal
```
┌─────────────────────────────────────┐
│  ✅ ¡Producto guardado exitosamente!│
│                                     │
│  Tu producto ya está disponible     │
│  en la tienda.                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Ver Producto                │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Crear Otro Producto]              │
└─────────────────────────────────────┘
```

#### Error Modal
```
┌─────────────────────────────────────┐
│  ❌ No se pudo guardar el producto  │
│                                     │
│  Ocurrió un error al guardar.       │
│  Por favor intentá de nuevo.        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Intentar de nuevo           │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Volver al wizard]                 │
└─────────────────────────────────────┘
```

## Technical Implementation

### File Structure

```
src/components/admin/product-wizard/
├── index.tsx                      # Main ProductWizard container
├── wizard-header.tsx              # Title + Cancel button
├── progress-indicator.tsx         # Step progress bar
├── wizard-navigation.tsx          # Back/Next buttons
├── auto-save-indicator.tsx        # "Progreso guardado" display
├── steps/
│   ├── step-1-photos.tsx          # Photo upload step
│   ├── step-2-basic-info.tsx      # Name + description
│   ├── step-3-pricing.tsx         # Price + discount
│   ├── step-4-category.tsx        # Category selection
│   ├── step-5-sizes-colors.tsx    # Sizes + colors
│   ├── step-6-options.tsx         # Stock + flags
│   └── step-7-review.tsx          # Final review
├── components/
│   ├── image-drop-zone.tsx        # Drag & drop area
│   ├── image-thumbnail.tsx        # Image preview with delete
│   ├── category-card.tsx          # Visual category selector
│   ├── size-toggle.tsx            # Size button
│   ├── color-swatch.tsx           # Color selector
│   ├── tooltip.tsx                # Info tooltip
│   └── character-counter.tsx      # Input character counter
├── modals/
│   ├── restore-draft-modal.tsx    # Draft restoration
│   ├── cancel-modal.tsx           # Cancel confirmation
│   ├── success-modal.tsx          # Save success
│   └── error-modal.tsx            # Save error
├── hooks/
│   ├── use-wizard-state.ts        # Main state management
│   ├── use-auto-save.ts           # LocalStorage auto-save
│   ├── use-validation.ts          # Step validation logic
│   └── use-image-upload.ts        # Image handling
└── utils/
    ├── validation-rules.ts        # Validation schemas
    ├── storage-keys.ts            # LocalStorage key constants
    └── format-helpers.ts          # Price, discount formatting
```

### Key Hooks

#### useWizardState
```typescript
function useWizardState(initialProduct?: ProductData) {
  const [currentStep, setCurrentStep] = useState(1)
  const [productData, setProductData] = useState<ProductData>(initialProduct || defaultData)
  const [isDirty, setIsDirty] = useState(false)
  
  const updateField = (field: keyof ProductData, value: any) => {
    setProductData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }
  
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))
  const goToStep = (step: number) => setCurrentStep(step)
  
  return { currentStep, productData, isDirty, updateField, nextStep, prevStep, goToStep }
}
```

#### useAutoSave
```typescript
function useAutoSave(productData: ProductData, currentStep: number, isDirty: boolean) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  useEffect(() => {
    if (!isDirty) return
    
    const timer = setTimeout(() => {
      const key = `product-wizard-draft-${productData.id || 'new'}`
      localStorage.setItem(key, JSON.stringify({
        data: productData,
        step: currentStep,
        timestamp: new Date().toISOString()
      }))
      setLastSaved(new Date())
    }, 2000) // Debounce 2s
    
    return () => clearTimeout(timer)
  }, [productData, currentStep, isDirty])
  
  return { lastSaved }
}
```

#### useValidation
```typescript
function useValidation(currentStep: number, productData: ProductData) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateStep = (): boolean => {
    const stepErrors: Record<string, string> = {}
    
    switch (currentStep) {
      case 1:
        if (productData.images.length === 0) {
          stepErrors.images = 'Se requiere al menos una imagen'
        }
        break
      case 2:
        if (productData.name.length < 3) {
          stepErrors.name = 'El nombre debe tener al menos 3 caracteres'
        }
        if (productData.description.length < 10) {
          stepErrors.description = 'La descripción debe tener al menos 10 caracteres'
        }
        break
      // ... more cases
    }
    
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }
  
  return { errors, validateStep, clearErrors: () => setErrors({}) }
}
```

### API Integration

**Endpoints:**
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update existing product
- `POST /api/upload` - Upload single image to Cloudinary

**Image Upload Flow:**
1. User selects/drops images → store as File objects
2. On final save → upload each File to `/api/upload`
3. Collect Cloudinary URLs
4. Send URLs array in product data

**Error Handling:**
- Network errors → show error modal with retry
- Validation errors from API → display field-level errors
- Image upload failures → show error, allow retry per image

### Responsive Breakpoints

- **Mobile:** < 768px
  - Single column layout
  - Compact progress bar
  - Stacked category cards
  - Full-width buttons
  
- **Tablet:** 768px - 1024px
  - Two-column grid for categories
  - Side-by-side price fields
  - Larger touch targets
  
- **Desktop:** > 1024px
  - Max width 800px centered
  - Multi-column grids
  - Hover states enabled
  - Keyboard shortcuts

### Accessibility

**Keyboard Navigation:**
- Tab: Move between fields
- Enter: Advance to next step (if valid)
- Escape: Close modals
- Arrow keys: Navigate between category cards

**Screen Readers:**
- ARIA labels on all interactive elements
- ARIA live regions for validation errors
- ARIA progress for step indicator
- Alt text for all images

**Focus Management:**
- Auto-focus first field on step load
- Focus first error on validation failure
- Trap focus in modals
- Visible focus indicators

## Migration Strategy

### Phase 1: Build Wizard Components
1. Create folder structure
2. Build individual step components
3. Implement wizard container with navigation
4. Add validation and auto-save

### Phase 2: Integration
1. Create new route `/admin/products/wizard/new`
2. Create edit route `/admin/products/wizard/[id]`
3. Update product list to link to wizard routes
4. Keep old form as fallback during testing

### Phase 3: Testing & Refinement
1. Test all validation scenarios
2. Test auto-save and draft restoration
3. Test edit mode with existing products
4. Mobile/tablet testing
5. Accessibility audit

### Phase 4: Deployment
1. Replace old form routes with wizard
2. Remove old `product-form.tsx`
3. Update documentation
4. Monitor for issues

## Open Questions

1. **Image Reordering:** Should we use drag-and-drop library (dnd-kit) or build custom?
   - **Recommendation:** Use dnd-kit for robust touch support

2. **Category Icons:** Should we use emoji or icon library (lucide-react)?
   - **Recommendation:** Emoji for simplicity, consistent across platforms

3. **Auto-save Frequency:** 30s idle timer or on every field change?
   - **Recommendation:** Debounced 2s after last change + on step navigation

4. **Draft Expiration:** Should drafts expire after X days?
   - **Recommendation:** 7 days, with cleanup on wizard mount

5. **Validation Timing:** On blur, on change, or only on next click?
   - **Recommendation:** On blur for individual fields, comprehensive on next click

## Success Metrics

- **Completion Rate:** % of users who complete all 7 steps
- **Time to Complete:** Average time from start to save
- **Error Rate:** % of save attempts that fail validation
- **Draft Usage:** % of users who restore drafts
- **Mobile Usage:** % of products created on mobile devices
- **User Satisfaction:** Feedback from 60-year-old target user

## Future Enhancements

1. **Bulk Upload:** Upload multiple products via CSV
2. **Templates:** Save product templates for similar items
3. **AI Descriptions:** Auto-generate descriptions from images
4. **Inventory Sync:** Connect to external inventory systems
5. **Multi-language:** Support for product descriptions in multiple languages
6. **Video Support:** Allow video uploads alongside images
