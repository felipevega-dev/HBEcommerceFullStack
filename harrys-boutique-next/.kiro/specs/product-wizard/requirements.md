# Requirements Document

## Introduction

El Wizard de Productos es una interfaz guiada paso a paso que reemplaza el formulario actual de creación y edición de productos en el panel de administración. Está diseñado específicamente para usuarios no técnicos, dividiendo el proceso complejo en pasos simples, visuales e intuitivos con validación y ayuda contextual en cada etapa.

## Glossary

- **Wizard**: El sistema de interfaz guiada paso a paso para crear o editar productos
- **Step**: Cada una de las pantallas individuales del wizard (Fotos, Información Básica, Precio, etc.)
- **Progress_Indicator**: Componente visual que muestra en qué paso está el usuario y cuántos pasos faltan
- **Auto_Save_Service**: Servicio que guarda automáticamente el progreso del usuario en el navegador
- **Validation_Engine**: Sistema que verifica que los datos ingresados en cada paso sean correctos antes de avanzar
- **Navigation_Controller**: Componente que gestiona el movimiento entre pasos (siguiente, anterior, saltar)
- **Image_Upload_Manager**: Sistema que maneja la carga, previsualización y reordenamiento de imágenes
- **Tooltip_System**: Sistema de ayuda contextual que muestra información útil al pasar el cursor sobre elementos
- **Review_Screen**: Pantalla final que muestra un resumen completo antes de guardar
- **Product_Data**: Toda la información del producto (nombre, precio, imágenes, categoría, tallas, colores, stock, etc.)
- **Draft_State**: Estado temporal del producto mientras se está creando o editando
- **Category_Selector**: Componente visual para seleccionar categorías con iconos de mascotas
- **Size_Color_Picker**: Componente visual para seleccionar tallas y colores con previsualizaciones
- **Discount_Calculator**: Herramienta que calcula automáticamente el porcentaje de descuento
- **Edit_Mode**: Modo del wizard cuando se está editando un producto existente
- **Create_Mode**: Modo del wizard cuando se está creando un producto nuevo

## Requirements

### Requirement 1: Navegación Paso a Paso

**User Story:** Como usuaria no técnica, quiero avanzar por pasos simples y claros, para no sentirme abrumada por muchos campos a la vez.

#### Acceptance Criteria

1. THE Wizard SHALL display exactly 7 steps in sequential order: Fotos, Información Básica, Precio, Categoría, Tallas y Colores, Opciones Finales, and Revisión
2. THE Progress_Indicator SHALL show the current step number, step name, and total steps remaining
3. WHEN the user clicks "Siguiente", THE Navigation_Controller SHALL validate the current step before advancing
4. WHEN the user clicks "Anterior", THE Navigation_Controller SHALL navigate to the previous step without validation
5. WHEN the user is on the first step, THE Navigation_Controller SHALL hide the "Anterior" button
6. WHEN the user is on the last step (Revisión), THE Navigation_Controller SHALL replace "Siguiente" with "Guardar Producto"
7. THE Progress_Indicator SHALL visually highlight completed steps with a checkmark icon
8. THE Progress_Indicator SHALL allow clicking on any completed step to jump directly to it

### Requirement 2: Paso 1 - Carga de Fotos del Producto

**User Story:** Como usuaria, quiero subir fotos de forma visual y fácil, para poder mostrar mis productos sin complicaciones técnicas.

#### Acceptance Criteria

1. THE Image_Upload_Manager SHALL display a drag-and-drop zone with clear visual instructions "Arrastrá tus fotos aquí o hacé click para seleccionar"
2. WHEN the user drags an image file over the drop zone, THE Image_Upload_Manager SHALL highlight the zone with a colored border
3. WHEN the user drops or selects an image file, THE Image_Upload_Manager SHALL display a preview thumbnail immediately
4. THE Image_Upload_Manager SHALL support uploading up to 4 images per product
5. THE Image_Upload_Manager SHALL display the first uploaded image with a "Principal" badge
6. WHEN the user hovers over an uploaded image, THE Image_Upload_Manager SHALL show a delete button (X icon)
7. THE Image_Upload_Manager SHALL allow reordering images by drag-and-drop between thumbnail positions
8. WHEN the user reorders images, THE Image_Upload_Manager SHALL automatically update the "Principal" badge to the first position
9. THE Validation_Engine SHALL require at least 1 image before allowing navigation to the next step
10. THE Tooltip_System SHALL display "La primera foto será la imagen principal del producto" when hovering over the first image slot

### Requirement 3: Paso 2 - Información Básica del Producto

**User Story:** Como usuaria, quiero ingresar el nombre y descripción con ejemplos claros, para saber exactamente qué escribir.

#### Acceptance Criteria

1. THE Wizard SHALL display a text input field labeled "Nombre del Producto" with placeholder text "Ej: Collar para Perro Ajustable"
2. THE Wizard SHALL display a textarea field labeled "Descripción" with placeholder text showing a complete example description
3. THE Tooltip_System SHALL display "Describí las características principales: material, tamaño, para qué mascota es" when hovering over the description field
4. THE Validation_Engine SHALL require the name field to contain at least 3 characters
5. THE Validation_Engine SHALL require the description field to contain at least 10 characters
6. WHEN the user types in the name field, THE Wizard SHALL display a character counter showing "X/100 caracteres"
7. WHEN the user types in the description field, THE Wizard SHALL display a character counter showing "X/500 caracteres"
8. THE Validation_Engine SHALL prevent advancing to the next step if name or description are empty

### Requirement 4: Paso 3 - Configuración de Precio

**User Story:** Como usuaria, quiero ingresar el precio de forma simple y calcular descuentos fácilmente, para no tener que hacer cuentas manualmente.

#### Acceptance Criteria

1. THE Wizard SHALL display a numeric input field labeled "Precio de Venta" with currency symbol "$" prefix
2. THE Wizard SHALL display a checkbox labeled "Este producto tiene descuento"
3. WHEN the discount checkbox is checked, THE Wizard SHALL display an additional field "Precio Original (antes del descuento)"
4. WHEN both precio original and precio de venta are filled, THE Discount_Calculator SHALL automatically display the discount percentage with format "X% de descuento"
5. THE Discount_Calculator SHALL update the percentage in real-time as the user types
6. THE Validation_Engine SHALL require precio de venta to be greater than 0
7. WHEN precio original is provided, THE Validation_Engine SHALL require it to be greater than precio de venta
8. THE Tooltip_System SHALL display "El precio que verán tus clientes en la tienda" when hovering over precio de venta
9. THE Tooltip_System SHALL display "El precio anterior tachado que se mostrará junto al descuento" when hovering over precio original

### Requirement 5: Paso 4 - Selección de Categoría

**User Story:** Como usuaria, quiero seleccionar la categoría de forma visual con iconos, para identificar rápidamente a qué tipo de mascota pertenece el producto.

#### Acceptance Criteria

1. THE Category_Selector SHALL display all available categories as large visual cards with pet icons
2. THE Category_Selector SHALL display category names below each icon (Perros, Gatos, Aves, Otros)
3. WHEN the user clicks a category card, THE Category_Selector SHALL highlight it with a colored border and checkmark
4. WHEN a category is selected, THE Category_Selector SHALL display subcategory options below as smaller cards
5. THE Category_Selector SHALL display subcategory names with descriptive icons (Collares, Juguetes, Alimento, Ropa, etc.)
6. WHEN the user clicks a subcategory card, THE Category_Selector SHALL highlight it with a colored border
7. THE Validation_Engine SHALL require both category and subcategory to be selected before advancing
8. WHEN the user changes the main category, THE Category_Selector SHALL clear the previously selected subcategory
9. THE Tooltip_System SHALL display "Elegí el tipo de mascota para este producto" when hovering over category cards

### Requirement 6: Paso 5 - Selección de Tallas y Colores

**User Story:** Como usuaria, quiero seleccionar tallas y colores de forma visual, para ver claramente qué opciones estoy ofreciendo.

#### Acceptance Criteria

1. THE Size_Color_Picker SHALL display available sizes (XS, S, M, L, XL) as toggle buttons
2. WHEN the user clicks a size button, THE Size_Color_Picker SHALL toggle its selected state with visual feedback (filled background)
3. THE Size_Color_Picker SHALL allow selecting multiple sizes simultaneously
4. THE Size_Color_Picker SHALL display available colors as color swatches with color names below
5. WHEN the user clicks a color swatch, THE Size_Color_Picker SHALL toggle its selected state with a checkmark overlay
6. THE Size_Color_Picker SHALL allow selecting multiple colors simultaneously
7. THE Validation_Engine SHALL require at least 1 size to be selected before advancing
8. THE Validation_Engine SHALL require at least 1 color to be selected before advancing
9. THE Size_Color_Picker SHALL display selected counts "X tallas seleccionadas" and "X colores seleccionados"
10. THE Tooltip_System SHALL display "Seleccioná todas las tallas disponibles para este producto" when hovering over the sizes section
11. THE Tooltip_System SHALL display "Seleccioná todos los colores disponibles para este producto" when hovering over the colors section

### Requirement 7: Paso 6 - Opciones Finales

**User Story:** Como usuaria, quiero configurar opciones adicionales de forma simple, para controlar el stock y la visibilidad del producto.

#### Acceptance Criteria

1. THE Wizard SHALL display a numeric input field labeled "Cantidad en Stock" with default value 0
2. THE Wizard SHALL display a checkbox labeled "Mostrar como Más Vendido" (unchecked by default)
3. THE Wizard SHALL display a checkbox labeled "Producto Activo (visible en la tienda)" (checked by default)
4. THE Tooltip_System SHALL display "Dejá en 0 si no manejás stock o está agotado" when hovering over the stock field
5. THE Tooltip_System SHALL display "Aparecerá en la sección de productos destacados" when hovering over the best seller checkbox
6. THE Tooltip_System SHALL display "Los clientes podrán ver y comprar este producto" when hovering over the active checkbox
7. THE Validation_Engine SHALL allow stock value of 0 or any positive integer
8. THE Wizard SHALL display a warning icon with text "Este producto no estará visible en la tienda" when active checkbox is unchecked

### Requirement 8: Paso 7 - Pantalla de Revisión

**User Story:** Como usuaria, quiero ver un resumen completo antes de guardar, para verificar que todo esté correcto.

#### Acceptance Criteria

1. THE Review_Screen SHALL display all product information organized in clearly labeled sections
2. THE Review_Screen SHALL display the product images in a horizontal gallery with the principal image highlighted
3. THE Review_Screen SHALL display nombre, descripción, precio, and discount percentage (if applicable) in the "Información Básica" section
4. THE Review_Screen SHALL display category and subcategory names in the "Categoría" section
5. THE Review_Screen SHALL display selected sizes as visual badges in the "Tallas y Colores" section
6. THE Review_Screen SHALL display selected colors as color swatches with names in the "Tallas y Colores" section
7. THE Review_Screen SHALL display stock quantity, best seller status, and active status in the "Opciones" section
8. WHEN the user clicks "Editar" next to any section, THE Navigation_Controller SHALL jump directly to the corresponding step
9. THE Review_Screen SHALL display a prominent "Guardar Producto" button at the bottom
10. THE Review_Screen SHALL display a "Volver" button to return to step 6

### Requirement 9: Guardado Automático de Progreso

**User Story:** Como usuaria, quiero que mi progreso se guarde automáticamente, para no perder mi trabajo si cierro accidentalmente el navegador.

#### Acceptance Criteria

1. WHEN the user completes any step and clicks "Siguiente", THE Auto_Save_Service SHALL save the Draft_State to browser local storage
2. WHEN the user navigates backward to a previous step, THE Auto_Save_Service SHALL save the current Draft_State
3. WHEN the user returns to the wizard after closing the browser, THE Auto_Save_Service SHALL detect the saved Draft_State
4. WHEN a Draft_State is detected, THE Wizard SHALL display a modal with options "Continuar donde lo dejé" or "Empezar de nuevo"
5. WHEN the user selects "Continuar donde lo dejé", THE Wizard SHALL restore all Product_Data and navigate to the last completed step
6. WHEN the user selects "Empezar de nuevo", THE Auto_Save_Service SHALL clear the Draft_State from local storage
7. WHEN the user successfully saves the product, THE Auto_Save_Service SHALL clear the Draft_State from local storage
8. THE Auto_Save_Service SHALL store Draft_State with a unique key per product in Edit_Mode
9. THE Wizard SHALL display a small "Progreso guardado" indicator with timestamp after each auto-save

### Requirement 10: Modo Edición de Producto Existente

**User Story:** Como usuaria, quiero editar productos existentes usando el mismo wizard, para mantener la experiencia consistente.

#### Acceptance Criteria

1. WHEN the wizard is opened in Edit_Mode, THE Wizard SHALL load all existing Product_Data into the corresponding steps
2. WHEN the wizard is opened in Edit_Mode, THE Wizard SHALL display "Editar Producto" as the page title instead of "Crear Producto"
3. WHEN the wizard is opened in Edit_Mode, THE Wizard SHALL pre-populate all form fields with existing values
4. WHEN the wizard is opened in Edit_Mode, THE Image_Upload_Manager SHALL display existing product images as thumbnails
5. WHEN the wizard is opened in Edit_Mode, THE Progress_Indicator SHALL mark all steps as completed initially
6. WHEN the wizard is opened in Edit_Mode, THE Review_Screen SHALL display "Guardar Cambios" instead of "Guardar Producto"
7. WHEN the user saves changes in Edit_Mode, THE Wizard SHALL update the existing product record instead of creating a new one
8. WHEN the user cancels in Edit_Mode, THE Wizard SHALL display a confirmation modal "¿Descartar cambios?" with options "Sí, descartar" or "Seguir editando"

### Requirement 11: Validación y Mensajes de Error

**User Story:** Como usuaria, quiero recibir mensajes claros cuando algo está mal, para saber exactamente qué debo corregir.

#### Acceptance Criteria

1. WHEN the user attempts to advance without completing required fields, THE Validation_Engine SHALL display an error message below the invalid field
2. THE Validation_Engine SHALL display error messages in plain language without technical terms
3. WHEN a validation error occurs, THE Validation_Engine SHALL focus the first invalid field automatically
4. THE Validation_Engine SHALL display field-level errors in red text with an alert icon
5. WHEN the user corrects an invalid field, THE Validation_Engine SHALL remove the error message immediately
6. WHEN an image upload fails, THE Image_Upload_Manager SHALL display "No se pudo subir la imagen. Intentá de nuevo" with a retry button
7. WHEN the user tries to upload a file that is not an image, THE Image_Upload_Manager SHALL display "Solo se permiten archivos de imagen (JPG, PNG, WEBP)"
8. WHEN the user tries to upload an image larger than 5MB, THE Image_Upload_Manager SHALL display "La imagen es muy grande. Máximo 5MB"

### Requirement 12: Ayuda Contextual y Tooltips

**User Story:** Como usuaria, quiero recibir ayuda cuando la necesito, para entender qué significa cada campo sin tener que preguntar.

#### Acceptance Criteria

1. THE Tooltip_System SHALL display a small info icon (ⓘ) next to field labels that have contextual help
2. WHEN the user hovers over an info icon, THE Tooltip_System SHALL display a tooltip with helpful text
3. THE Tooltip_System SHALL display tooltips with a light background, dark text, and a small arrow pointing to the icon
4. THE Tooltip_System SHALL automatically hide tooltips after 5 seconds or when the user moves the cursor away
5. THE Wizard SHALL display example text in placeholder fields for nombre, descripción, and precio fields
6. WHEN the user focuses on the descripción field for the first time, THE Wizard SHALL display a dismissible hint box with writing tips
7. THE Wizard SHALL display a help link "¿Necesitás ayuda?" in the top-right corner of each step
8. WHEN the user clicks the help link, THE Wizard SHALL open a side panel with step-specific help content and screenshots

### Requirement 13: Diseño Responsive y Accesibilidad

**User Story:** Como usuaria, quiero usar el wizard en cualquier dispositivo, para poder cargar productos desde mi teléfono o tablet.

#### Acceptance Criteria

1. THE Wizard SHALL display correctly on screen widths from 320px (mobile) to 1920px (desktop)
2. WHEN viewed on mobile devices, THE Progress_Indicator SHALL display as a compact horizontal bar with step numbers only
3. WHEN viewed on mobile devices, THE Category_Selector SHALL stack category cards vertically
4. WHEN viewed on mobile devices, THE Size_Color_Picker SHALL display sizes and colors in a scrollable grid
5. THE Wizard SHALL use font sizes of at least 16px for all input fields to prevent mobile zoom
6. THE Wizard SHALL use touch-friendly button sizes of at least 44x44px on mobile devices
7. THE Wizard SHALL support keyboard navigation with Tab, Enter, and Arrow keys
8. THE Wizard SHALL provide proper ARIA labels for all interactive elements for screen reader compatibility

### Requirement 14: Guardado Final y Confirmación

**User Story:** Como usuaria, quiero recibir confirmación clara cuando el producto se guarda exitosamente, para saber que mi trabajo está completo.

#### Acceptance Criteria

1. WHEN the user clicks "Guardar Producto" on the Review_Screen, THE Wizard SHALL display a loading spinner with text "Guardando producto..."
2. WHEN the product is saved successfully, THE Wizard SHALL display a success modal with checkmark icon and message "¡Producto guardado exitosamente!"
3. WHEN the success modal is displayed, THE Wizard SHALL provide two action buttons: "Ver Producto" and "Crear Otro Producto"
4. WHEN the user clicks "Ver Producto", THE Wizard SHALL navigate to the product detail page in the admin panel
5. WHEN the user clicks "Crear Otro Producto", THE Wizard SHALL reset all fields and return to step 1
6. WHEN a save error occurs, THE Wizard SHALL display an error modal with message "No se pudo guardar el producto. Intentá de nuevo"
7. WHEN a save error occurs, THE Wizard SHALL keep all user data intact and remain on the Review_Screen
8. WHEN the user clicks "Intentar de nuevo" after an error, THE Wizard SHALL retry the save operation

### Requirement 15: Cancelación y Salida del Wizard

**User Story:** Como usuaria, quiero poder cancelar el proceso de forma segura, para no perder mi trabajo accidentalmente.

#### Acceptance Criteria

1. THE Wizard SHALL display a "Cancelar" button in the top-right corner of every step
2. WHEN the user clicks "Cancelar" with unsaved changes, THE Wizard SHALL display a confirmation modal "¿Estás segura que querés salir?"
3. THE confirmation modal SHALL display two options: "Sí, salir sin guardar" and "Seguir editando"
4. WHEN the user clicks "Sí, salir sin guardar", THE Wizard SHALL clear the Draft_State and navigate to the products list page
5. WHEN the user clicks "Seguir editando", THE Wizard SHALL close the modal and remain on the current step
6. WHEN the user clicks the browser back button, THE Wizard SHALL trigger the same confirmation modal as the "Cancelar" button
7. WHEN the user has no unsaved changes (just opened the wizard), THE Wizard SHALL allow cancellation without confirmation

