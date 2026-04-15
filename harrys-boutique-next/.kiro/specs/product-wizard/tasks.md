# Tasks

## Task 1: Setup Project Structure and Dependencies

**Status:** pending

**Description:**
Create the folder structure for the Product Wizard and install necessary dependencies for drag-and-drop, animations, and form handling.

**Acceptance Criteria:**
- [ ] Create `src/components/admin/product-wizard/` directory structure
- [ ] Create subdirectories: `steps/`, `components/`, `modals/`, `hooks/`, `utils/`
- [ ] Install `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop
- [ ] Install `framer-motion` for animations (if not already installed)
- [ ] Create placeholder index files in each subdirectory
- [ ] Verify all imports resolve correctly

**Dependencies:** None

**Estimated Effort:** 30 minutes

---

## Task 2: Create Type Definitions and Utilities

**Status:** pending

**Description:**
Define TypeScript interfaces, validation schemas, and utility functions that will be used throughout the wizard.

**Acceptance Criteria:**
- [ ] Create `types.ts` with `ProductData`, `WizardStep`, `ValidationError` interfaces
- [ ] Create `utils/validation-rules.ts` with validation functions for each step
- [ ] Create `utils/storage-keys.ts` with localStorage key constants
- [ ] Create `utils/format-helpers.ts` with price formatting, discount calculation
- [ ] Add JSDoc comments to all utility functions
- [ ] Write unit tests for validation rules and formatters

**Dependencies:** Task 1

**Estimated Effort:** 1 hour

---

## Task 3: Build Core Wizard State Management Hook

**Status:** pending

**Description:**
Implement the main `useWizardState` hook that manages the wizard's state, step navigation, and data updates.

**Acceptance Criteria:**
- [ ] Create `hooks/use-wizard-state.ts`
- [ ] Implement state for `currentStep`, `productData`, `isDirty`
- [ ] Implement `updateField` function for updating product data
- [ ] Implement `nextStep`, `prevStep`, `goToStep` navigation functions
- [ ] Implement `resetWizard` function to clear all data
- [ ] Add TypeScript types for all functions and state
- [ ] Test state updates and navigation logic

**Dependencies:** Task 2

**Estimated Effort:** 1.5 hours

---

## Task 4: Build Auto-Save Hook with LocalStorage

**Status:** pending

**Description:**
Implement the `useAutoSave` hook that automatically saves wizard progress to localStorage with debouncing.

**Acceptance Criteria:**
- [ ] Create `hooks/use-auto-save.ts`
- [ ] Implement debounced save (2 seconds after last change)
- [ ] Save on step navigation
- [ ] Store productData + currentStep + timestamp
- [ ] Implement `loadDraft` function to restore saved data
- [ ] Implement `clearDraft` function to remove saved data
- [ ] Return `lastSaved` timestamp for display
- [ ] Handle localStorage quota exceeded errors gracefully

**Dependencies:** Task 3

**Estimated Effort:** 1.5 hours

---

## Task 5: Build Validation Hook

**Status:** pending

**Description:**
Implement the `useValidation` hook that validates each step's data before allowing navigation.

**Acceptance Criteria:**
- [ ] Create `hooks/use-validation.ts`
- [ ] Implement `validateStep` function for each of the 7 steps
- [ ] Return errors object with field-level error messages
- [ ] Implement `clearErrors` function
- [ ] Implement `focusFirstError` function to focus invalid field
- [ ] Use validation rules from `utils/validation-rules.ts`
- [ ] Add Spanish error messages (user-friendly, non-technical)
- [ ] Test all validation scenarios

**Dependencies:** Task 2, Task 3

**Estimated Effort:** 2 hours

---

## Task 6: Build Wizard Container and Layout

**Status:** pending

**Description:**
Create the main ProductWizard container component that orchestrates all steps and manages the overall layout.

**Acceptance Criteria:**
- [ ] Create `index.tsx` as main wizard container
- [ ] Integrate `useWizardState`, `useAutoSave`, `useValidation` hooks
- [ ] Implement step rendering logic (switch/case for 7 steps)
- [ ] Add page layout with max-width and centering
- [ ] Handle edit mode vs create mode initialization
- [ ] Implement draft restoration on mount
- [ ] Add loading states for initial data fetch
- [ ] Export ProductWizard as default

**Dependencies:** Task 3, Task 4, Task 5

**Estimated Effort:** 2 hours

---

## Task 7: Build Progress Indicator Component

**Status:** pending

**Description:**
Create the visual progress indicator that shows current step, completed steps, and allows navigation to completed steps.

**Acceptance Criteria:**
- [ ] Create `progress-indicator.tsx`
- [ ] Display 7 steps with names: Fotos, Info, Precio, Categoría, Tallas, Opciones, Revisión
- [ ] Show checkmark icon for completed steps
- [ ] Highlight current step with filled circle
- [ ] Show empty circle for future steps
- [ ] Make completed steps clickable to jump to them
- [ ] Implement responsive design (horizontal bar on mobile)
- [ ] Add smooth transitions between states
- [ ] Add ARIA labels for accessibility

**Dependencies:** Task 6

**Estimated Effort:** 2 hours

---

## Task 8: Build Wizard Navigation Component

**Status:** pending

**Description:**
Create the bottom navigation bar with Back/Next buttons and auto-save indicator.

**Acceptance Criteria:**
- [ ] Create `wizard-navigation.tsx`
- [ ] Implement "Anterior" button (hidden on step 1)
- [ ] Implement "Siguiente" button (changes to "Guardar Producto" on step 7)
- [ ] Disable "Siguiente" when validation fails
- [ ] Show validation error summary when disabled
- [ ] Call validation before advancing
- [ ] Add loading state during save operation
- [ ] Style buttons with hover and disabled states
- [ ] Make responsive (stack on mobile if needed)

**Dependencies:** Task 6

**Estimated Effort:** 1.5 hours

---

## Task 9: Build Auto-Save Indicator Component

**Status:** pending

**Description:**
Create a small indicator that shows when progress was last saved, with fade-in/out animation.

**Acceptance Criteria:**
- [ ] Create `auto-save-indicator.tsx`
- [ ] Display "Progreso guardado hace X minutos" text
- [ ] Show relative time (hace 1 minuto, hace 5 minutos, etc.)
- [ ] Implement fade-in animation when save occurs
- [ ] Update time display every minute
- [ ] Position in bottom navigation area
- [ ] Use subtle gray color
- [ ] Add checkmark icon

**Dependencies:** Task 4

**Estimated Effort:** 1 hour

---

## Task 10: Build Reusable Components (Tooltip, Character Counter)

**Status:** pending

**Description:**
Create small reusable components that will be used across multiple steps.

**Acceptance Criteria:**
- [ ] Create `components/tooltip.tsx` with info icon and hover display
- [ ] Tooltip shows on hover with arrow pointing to icon
- [ ] Tooltip auto-hides after 5 seconds
- [ ] Create `components/character-counter.tsx` for input fields
- [ ] Counter shows "X/MAX caracteres" format
- [ ] Counter turns red when approaching limit
- [ ] Both components are fully typed with TypeScript
- [ ] Add accessibility attributes (aria-describedby, role="tooltip")

**Dependencies:** Task 1

**Estimated Effort:** 1.5 hours

---

## Task 11: Build Step 1 - Photo Upload Components

**Status:** pending

**Description:**
Create the image upload step with drag-and-drop zone, preview thumbnails, and reordering functionality.

**Acceptance Criteria:**
- [ ] Create `steps/step-1-photos.tsx`
- [ ] Create `components/image-drop-zone.tsx` with drag-and-drop
- [ ] Create `components/image-thumbnail.tsx` with delete button
- [ ] Implement drag-over visual feedback (blue border)
- [ ] Show instant preview after file selection
- [ ] Support up to 4 images
- [ ] Implement drag-and-drop reordering with @dnd-kit
- [ ] Show "Principal" badge on first image
- [ ] Validate file type (JPG, PNG, WEBP) and size (max 5MB)
- [ ] Display validation errors below drop zone
- [ ] Add tooltip "La primera foto será la imagen principal"
- [ ] Handle both File objects (new) and URLs (edit mode)

**Dependencies:** Task 6, Task 10

**Estimated Effort:** 3 hours

---

## Task 12: Build Step 2 - Basic Info Component

**Status:** pending

**Description:**
Create the basic information step with name and description fields, character counters, and contextual help.

**Acceptance Criteria:**
- [ ] Create `steps/step-2-basic-info.tsx`
- [ ] Add name input with placeholder "Ej: Collar para Perro Ajustable"
- [ ] Add description textarea with example placeholder
- [ ] Integrate character counter for both fields (100 for name, 500 for description)
- [ ] Add tooltip on description field with writing tips
- [ ] Show dismissible tip box on first focus
- [ ] Implement real-time validation (min 3 chars for name, min 10 for description)
- [ ] Display validation errors below fields
- [ ] Auto-resize textarea as user types
- [ ] Add proper labels and ARIA attributes

**Dependencies:** Task 6, Task 10

**Estimated Effort:** 2 hours

---

## Task 13: Build Step 3 - Pricing Component

**Status:** pending

**Description:**
Create the pricing step with price input, discount toggle, and automatic discount percentage calculation.

**Acceptance Criteria:**
- [ ] Create `steps/step-3-pricing.tsx`
- [ ] Add price input with "$" prefix
- [ ] Add "Este producto tiene descuento" checkbox
- [ ] Show/hide original price field based on checkbox
- [ ] Implement real-time discount percentage calculation
- [ ] Display discount with format "🎉 X% de descuento"
- [ ] Validate price > 0
- [ ] Validate originalPrice > price when discount is enabled
- [ ] Add tooltips for both price fields
- [ ] Display validation errors
- [ ] Format numbers with proper decimal places

**Dependencies:** Task 6, Task 10

**Estimated Effort:** 2 hours

---

## Task 14: Build Step 4 - Category Selection Component

**Status:** pending

**Description:**
Create the category selection step with visual cards for categories and subcategories.

**Acceptance Criteria:**
- [ ] Create `steps/step-4-category.tsx`
- [ ] Create `components/category-card.tsx` for visual selection
- [ ] Fetch categories from API or props
- [ ] Display category cards with emoji icons (🐕 🐈 🦜 🐾)
- [ ] Highlight selected category with border and checkmark
- [ ] Show subcategories when category is selected
- [ ] Clear subcategory when category changes
- [ ] Validate both category and subcategory are selected
- [ ] Add hover scale animation
- [ ] Add tooltip "Elegí el tipo de mascota para este producto"
- [ ] Make responsive (stack on mobile)

**Dependencies:** Task 6, Task 10

**Estimated Effort:** 2.5 hours

---

## Task 15: Build Step 5 - Sizes and Colors Component

**Status:** pending

**Description:**
Create the sizes and colors selection step with toggle buttons and color swatches.

**Acceptance Criteria:**
- [ ] Create `steps/step-5-sizes-colors.tsx`
- [ ] Create `components/size-toggle.tsx` for size buttons
- [ ] Create `components/color-swatch.tsx` for color selection
- [ ] Display sizes: XS, S, M, L, XL as toggle buttons
- [ ] Display colors with actual color swatches and names
- [ ] Allow multi-select for both sizes and colors
- [ ] Show selection count "X tallas seleccionadas"
- [ ] Validate at least 1 size and 1 color selected
- [ ] Add checkmark overlay on selected colors
- [ ] Add tooltips for both sections
- [ ] Make responsive (grid layout on mobile)

**Dependencies:** Task 6, Task 10

**Estimated Effort:** 2.5 hours

---

## Task 16: Build Step 6 - Final Options Component

**Status:** pending

**Description:**
Create the final options step with stock input and checkbox toggles for bestSeller and active status.

**Acceptance Criteria:**
- [ ] Create `steps/step-6-options.tsx`
- [ ] Add stock numeric input (default 0, min 0)
- [ ] Add "Mostrar como Más Vendido" checkbox
- [ ] Add "Producto Activo" checkbox (default checked)
- [ ] Show warning "⚠️ Este producto no estará visible" when active is unchecked
- [ ] Add tooltips for all three fields
- [ ] Validate stock >= 0
- [ ] Add helper text "Dejá en 0 si no manejás stock"
- [ ] Style warning with amber color
- [ ] Make responsive

**Dependencies:** Task 6, Task 10

**Estimated Effort:** 1.5 hours

---

## Task 17: Build Step 7 - Review Component

**Status:** pending

**Description:**
Create the final review step that displays all product information in organized sections with edit buttons.

**Acceptance Criteria:**
- [ ] Create `steps/step-7-review.tsx`
- [ ] Display images in horizontal gallery with "Principal" badge
- [ ] Show "Información Básica" section with name, description, price
- [ ] Show discount with strikethrough original price if applicable
- [ ] Show "Categoría" section with category > subcategory
- [ ] Show "Tallas y Colores" section with visual badges/swatches
- [ ] Show "Opciones" section with stock, bestSeller, active status
- [ ] Add [Editar] button next to each section
- [ ] Clicking [Editar] jumps to corresponding step
- [ ] Display "Guardar Producto" button at bottom
- [ ] Format all data for display (prices with $, etc.)
- [ ] Make responsive (stack sections on mobile)

**Dependencies:** Task 6

**Estimated Effort:** 2.5 hours

---

## Task 18: Build Restore Draft Modal

**Status:** pending

**Description:**
Create the modal that appears when a saved draft is detected, allowing users to continue or start fresh.

**Acceptance Criteria:**
- [ ] Create `modals/restore-draft-modal.tsx`
- [ ] Display when draft is detected on wizard mount
- [ ] Show draft timestamp in readable format
- [ ] Add "Continuar donde lo dejé" primary button
- [ ] Add "Empezar de nuevo" secondary button
- [ ] Clicking "Continuar" restores data and navigates to last step
- [ ] Clicking "Empezar de nuevo" clears draft from localStorage
- [ ] Add backdrop click to close (defaults to "Continuar")
- [ ] Style with centered modal, shadow, and rounded corners
- [ ] Add fade-in animation

**Dependencies:** Task 4, Task 6

**Estimated Effort:** 1.5 hours

---

## Task 19: Build Cancel Confirmation Modal

**Status:** pending

**Description:**
Create the modal that confirms when user wants to exit the wizard with unsaved changes.

**Acceptance Criteria:**
- [ ] Create `modals/cancel-modal.tsx`
- [ ] Trigger when user clicks "Cancelar" button with isDirty = true
- [ ] Display warning "⚠️ ¿Estás segura que querés salir?"
- [ ] Show message about losing unsaved changes
- [ ] Add "Seguir editando" primary button
- [ ] Add "Sí, salir sin guardar" secondary button (red/destructive)
- [ ] Clicking "Seguir editando" closes modal
- [ ] Clicking "Salir" clears draft and navigates to products list
- [ ] Intercept browser back button to show same modal
- [ ] Add escape key to close (defaults to "Seguir editando")

**Dependencies:** Task 6

**Estimated Effort:** 1.5 hours

---

## Task 20: Build Success Modal

**Status:** pending

**Description:**
Create the modal that displays after successfully saving a product.

**Acceptance Criteria:**
- [ ] Create `modals/success-modal.tsx`
- [ ] Display after successful API save response
- [ ] Show "✅ ¡Producto guardado exitosamente!" title
- [ ] Show success message "Tu producto ya está disponible en la tienda"
- [ ] Add "Ver Producto" primary button
- [ ] Add "Crear Otro Producto" secondary button
- [ ] Clicking "Ver Producto" navigates to product detail in admin
- [ ] Clicking "Crear Otro" resets wizard and returns to step 1
- [ ] Clear draft from localStorage on display
- [ ] Add celebration animation (scale + fade in)
- [ ] Auto-close after 10 seconds if no action

**Dependencies:** Task 6

**Estimated Effort:** 1.5 hours

---

## Task 21: Build Error Modal

**Status:** pending

**Description:**
Create the modal that displays when a save operation fails.

**Acceptance Criteria:**
- [ ] Create `modals/error-modal.tsx`
- [ ] Display when API save returns error
- [ ] Show "❌ No se pudo guardar el producto" title
- [ ] Show error message from API or generic message
- [ ] Add "Intentar de nuevo" primary button
- [ ] Add "Volver al wizard" secondary button
- [ ] Clicking "Intentar de nuevo" retries the save operation
- [ ] Clicking "Volver" closes modal and stays on review step
- [ ] Keep all product data intact (don't clear)
- [ ] Log error to console for debugging
- [ ] Style with red accent color

**Dependencies:** Task 6

**Estimated Effort:** 1 hour

---

## Task 22: Build Wizard Header Component

**Status:** pending

**Description:**
Create the header component with title and cancel button.

**Acceptance Criteria:**
- [ ] Create `wizard-header.tsx`
- [ ] Display "Crear Producto" title in create mode
- [ ] Display "Editar Producto" title in edit mode
- [ ] Add "Cancelar" button in top-right corner
- [ ] Clicking "Cancelar" triggers cancel confirmation modal
- [ ] Style with proper spacing and typography
- [ ] Make responsive (smaller text on mobile)
- [ ] Add border-bottom separator

**Dependencies:** Task 6, Task 19

**Estimated Effort:** 1 hour

---

## Task 23: Implement Image Upload Hook

**Status:** pending

**Description:**
Create a hook to handle image file selection, preview generation, and upload to Cloudinary.

**Acceptance Criteria:**
- [ ] Create `hooks/use-image-upload.ts`
- [ ] Implement `handleFileSelect` to create preview URLs
- [ ] Implement `uploadImages` to upload to `/api/upload`
- [ ] Handle upload progress for each image
- [ ] Return array of Cloudinary URLs
- [ ] Handle upload errors per image with retry capability
- [ ] Validate file type and size before upload
- [ ] Clean up preview URLs on unmount
- [ ] Return loading state and error state

**Dependencies:** Task 2

**Estimated Effort:** 2 hours

---

## Task 24: Integrate Image Upload with Step 1

**Status:** pending

**Description:**
Connect the image upload hook with Step 1 component to handle actual file uploads.

**Acceptance Criteria:**
- [ ] Integrate `use-image-upload` hook in `step-1-photos.tsx`
- [ ] Store File objects in wizard state (not URLs yet)
- [ ] Generate preview URLs for display
- [ ] Handle upload errors with user-friendly messages
- [ ] Show upload progress indicator
- [ ] Allow retry for failed uploads
- [ ] Test with various file types and sizes
- [ ] Test with slow network conditions

**Dependencies:** Task 11, Task 23

**Estimated Effort:** 1.5 hours

---

## Task 25: Implement Final Save Logic

**Status:** pending

**Description:**
Implement the complete save flow that uploads images, sends data to API, and handles success/error.

**Acceptance Criteria:**
- [ ] Add `handleSave` function in wizard container
- [ ] Upload all new images to Cloudinary first
- [ ] Combine new URLs with existing URLs (edit mode)
- [ ] Prepare complete product data payload
- [ ] POST to `/api/products` (create) or PUT to `/api/products/[id]` (edit)
- [ ] Show loading state during save
- [ ] Handle success: clear draft, show success modal
- [ ] Handle error: keep data, show error modal
- [ ] Add retry logic for network failures
- [ ] Validate all data one final time before sending

**Dependencies:** Task 6, Task 20, Task 21, Task 23

**Estimated Effort:** 2.5 hours

---

## Task 26: Create Wizard Routes

**Status:** pending

**Description:**
Create Next.js routes for the wizard in both create and edit modes.

**Acceptance Criteria:**
- [ ] Create `src/app/(admin)/admin/products/wizard/new/page.tsx`
- [ ] Create `src/app/(admin)/admin/products/wizard/[id]/page.tsx`
- [ ] Fetch categories in both routes (server component)
- [ ] Fetch product data in edit route
- [ ] Pass data as props to ProductWizard
- [ ] Add proper loading states
- [ ] Add error boundaries
- [ ] Set page metadata (title, description)
- [ ] Protect routes with admin authentication

**Dependencies:** Task 6

**Estimated Effort:** 1.5 hours

---

## Task 27: Update Product List to Link to Wizard

**Status:** pending

**Description:**
Update the admin products list page to link to the new wizard instead of the old form.

**Acceptance Criteria:**
- [ ] Update "Crear Producto" button to link to `/admin/products/wizard/new`
- [ ] Update edit buttons to link to `/admin/products/wizard/[id]`
- [ ] Keep old form accessible via different route (for fallback)
- [ ] Test navigation from list to wizard
- [ ] Test navigation back from wizard to list
- [ ] Ensure router.refresh() works after save

**Dependencies:** Task 26

**Estimated Effort:** 30 minutes

---

## Task 28: Add Responsive Styles and Mobile Testing

**Status:** pending

**Description:**
Ensure all wizard components are fully responsive and work well on mobile devices.

**Acceptance Criteria:**
- [ ] Test all steps on mobile (320px - 767px)
- [ ] Test all steps on tablet (768px - 1023px)
- [ ] Test all steps on desktop (1024px+)
- [ ] Verify touch targets are at least 44x44px
- [ ] Verify font sizes are at least 16px (prevent zoom)
- [ ] Test drag-and-drop on touch devices
- [ ] Test modals on small screens
- [ ] Fix any layout issues found
- [ ] Test landscape orientation on mobile
- [ ] Verify progress indicator works on all sizes

**Dependencies:** Tasks 11-17

**Estimated Effort:** 2 hours

---

## Task 29: Implement Keyboard Navigation and Accessibility

**Status:** pending

**Description:**
Add full keyboard navigation support and ensure WCAG 2.1 AA compliance.

**Acceptance Criteria:**
- [ ] Tab navigation works through all fields in order
- [ ] Enter key advances to next step (when valid)
- [ ] Escape key closes modals
- [ ] Arrow keys navigate between category cards
- [ ] Add ARIA labels to all interactive elements
- [ ] Add ARIA live regions for validation errors
- [ ] Add ARIA progress for step indicator
- [ ] Implement focus trap in modals
- [ ] Add visible focus indicators (outline)
- [ ] Test with screen reader (NVDA or JAWS)
- [ ] Test with keyboard only (no mouse)
- [ ] Fix any accessibility issues found

**Dependencies:** Tasks 7-17

**Estimated Effort:** 2.5 hours

---

## Task 30: Write Integration Tests

**Status:** pending

**Description:**
Write comprehensive integration tests for the complete wizard flow.

**Acceptance Criteria:**
- [ ] Test complete create flow (all 7 steps)
- [ ] Test complete edit flow
- [ ] Test validation on each step
- [ ] Test auto-save and draft restoration
- [ ] Test cancel with unsaved changes
- [ ] Test image upload and reordering
- [ ] Test discount calculation
- [ ] Test category/subcategory selection
- [ ] Test final save success and error scenarios
- [ ] Test responsive behavior (mobile/desktop)
- [ ] Achieve >80% code coverage
- [ ] Use React Testing Library and Jest

**Dependencies:** All previous tasks

**Estimated Effort:** 4 hours

---

## Task 31: User Acceptance Testing with Target User

**Status:** pending

**Description:**
Conduct testing session with the 60-year-old target user (your mother) to validate usability.

**Acceptance Criteria:**
- [ ] Prepare test scenarios (create 3 different products)
- [ ] Observe user completing tasks without help
- [ ] Note any confusion points or difficulties
- [ ] Collect feedback on clarity of instructions
- [ ] Collect feedback on visual design
- [ ] Measure time to complete each task
- [ ] Ask about confidence level after using wizard
- [ ] Document all feedback and issues
- [ ] Prioritize issues for fixes
- [ ] Make necessary adjustments based on feedback

**Dependencies:** Tasks 1-29

**Estimated Effort:** 2 hours (+ fixes)

---

## Task 32: Performance Optimization

**Status:** pending

**Description:**
Optimize wizard performance for smooth user experience, especially on slower devices.

**Acceptance Criteria:**
- [ ] Lazy load step components (React.lazy)
- [ ] Optimize image previews (compress before display)
- [ ] Debounce auto-save to reduce localStorage writes
- [ ] Memoize expensive calculations (discount %)
- [ ] Use React.memo for components that don't need re-renders
- [ ] Optimize re-renders with useCallback and useMemo
- [ ] Test performance on low-end devices
- [ ] Measure and optimize Time to Interactive (TTI)
- [ ] Ensure smooth animations (60fps)
- [ ] Profile with React DevTools Profiler

**Dependencies:** All component tasks

**Estimated Effort:** 2 hours

---

## Task 33: Documentation and Code Comments

**Status:** pending

**Description:**
Add comprehensive documentation for future maintenance and onboarding.

**Acceptance Criteria:**
- [ ] Add JSDoc comments to all exported functions
- [ ] Add inline comments for complex logic
- [ ] Create README.md in product-wizard folder
- [ ] Document component props with TypeScript
- [ ] Document hook usage with examples
- [ ] Document validation rules
- [ ] Document localStorage schema
- [ ] Add troubleshooting section
- [ ] Document testing approach
- [ ] Add architecture diagram

**Dependencies:** All previous tasks

**Estimated Effort:** 2 hours

---

## Task 34: Remove Old Product Form

**Status:** pending

**Description:**
After successful deployment and validation, remove the old product form component.

**Acceptance Criteria:**
- [ ] Verify wizard is working in production for at least 1 week
- [ ] Verify no critical bugs reported
- [ ] Verify target user is comfortable with wizard
- [ ] Delete `src/components/admin/product-form.tsx`
- [ ] Remove any unused imports
- [ ] Update any documentation referencing old form
- [ ] Remove old form routes if they exist
- [ ] Clean up any related unused code
- [ ] Commit with clear message about deprecation

**Dependencies:** Task 31 (successful UAT)

**Estimated Effort:** 30 minutes

---

## Summary

**Total Tasks:** 34
**Estimated Total Effort:** ~55 hours

**Critical Path:**
1. Setup (Tasks 1-2)
2. Core Hooks (Tasks 3-5)
3. Container (Task 6)
4. All Steps (Tasks 11-17)
5. Modals (Tasks 18-21)
6. Save Logic (Task 25)
7. Routes (Tasks 26-27)
8. Testing (Tasks 28-31)

**Recommended Implementation Order:**
- **Week 1:** Tasks 1-10 (Foundation)
- **Week 2:** Tasks 11-17 (All Steps)
- **Week 3:** Tasks 18-25 (Modals & Save)
- **Week 4:** Tasks 26-29 (Integration & Polish)
- **Week 5:** Tasks 30-34 (Testing & Deployment)
