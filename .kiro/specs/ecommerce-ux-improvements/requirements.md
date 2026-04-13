# Documento de Requisitos â€” Harry's Boutique: Mejora Completa UX/UI y Funcionalidades

## IntroducciÃ³n

Harry's Boutique es un e-commerce de ropa y accesorios para mascotas construido con React 18 + Vite + Tailwind (frontend y admin), Node.js + Express + MongoDB (backend) e integraciÃ³n de pagos con MercadoPago. El sistema actual es funcional pero presenta limitaciones de rendimiento (filtrado client-side cargando todos los productos), ausencia de estado global robusto, falta de cachÃ© de datos, y carencias en la experiencia de usuario tanto en el frontend como en el panel de administraciÃ³n.

Este documento define los requisitos para la mejora integral del sistema, abarcando: sistema de diseÃ±o consistente, migraciÃ³n a Zustand + TanStack Query + Zod + React Hook Form, filtrado server-side, nuevas funcionalidades (wishlist, cupones, notificaciones por email, bÃºsqueda avanzada, SEO) y un panel de administraciÃ³n completo con dashboard, mÃ©tricas y gestiÃ³n avanzada.

---

## Glosario

- **Design_System**: Conjunto de tokens de diseÃ±o (colores, tipografÃ­a, espaciado) y componentes reutilizables que garantizan consistencia visual en toda la aplicaciÃ³n.
- **Shop_Store**: Store global de Zustand que reemplaza al ShopContext actual, gestionando productos, carrito, autenticaciÃ³n y preferencias del usuario.
- **Query_Client**: Instancia de TanStack Query (React Query) que gestiona el fetching, cachÃ© e invalidaciÃ³n de datos del servidor.
- **Catalog_API**: Endpoint del backend que acepta parÃ¡metros de filtrado, ordenamiento y paginaciÃ³n para retornar productos filtrados server-side.
- **Cart_Drawer**: Componente de carrito lateral deslizante que se muestra al agregar un producto, sin abandonar la pÃ¡gina actual.
- **Wishlist**: Lista de productos favoritos persistida en el backend asociada al usuario autenticado.
- **Coupon_Engine**: MÃ³dulo del backend que valida y aplica cÃ³digos de descuento a Ã³rdenes.
- **Notification_Service**: Servicio del backend que envÃ­a emails transaccionales (confirmaciÃ³n de orden, cambio de estado) usando un proveedor SMTP.
- **Search_Engine**: MÃ³dulo de bÃºsqueda del backend que implementa bÃºsqueda de texto completo con sugerencias en tiempo real.
- **Admin_Dashboard**: PÃ¡gina principal del panel de administraciÃ³n con mÃ©tricas clave, grÃ¡ficos de ventas y actividad reciente.
- **Skeleton_Loader**: Componente de placeholder animado que representa la estructura del contenido mientras se carga, reemplazando spinners genÃ©ricos.
- **Filter_Chip**: Elemento visual removible que representa un filtro activo aplicado en el catÃ¡logo.
- **Quick_View**: Modal que muestra informaciÃ³n esencial de un producto sin navegar a su pÃ¡gina de detalle.
- **Color_Swatch**: Selector visual de color que muestra una muestra del color real en lugar de texto.
- **Stock_Indicator**: Indicador visual del nivel de stock disponible por talla/color.
- **Checkout_Stepper**: Componente de indicador de progreso que muestra los pasos del proceso de checkout.
- **Order_Timeline**: Componente visual que muestra el historial de estados de una orden en formato cronolÃ³gico.
- **Validator**: MÃ³dulo de validaciÃ³n de formularios basado en esquemas Zod integrado con React Hook Form.
- **SEO_Manager**: MÃ³dulo que gestiona meta tags dinÃ¡micos (title, description, Open Graph) por pÃ¡gina usando React Helmet Async.
- **Audit_Log**: Registro de acciones administrativas ya existente en el backend (auditLogModel.js).
- **RBAC**: Control de acceso basado en roles (OWNER, ADMIN, MODERATOR, USER) ya implementado en el backend.
- **ProductModel**: Modelo MongoDB de producto con campos: name, description, price, images[], category, subCategory, colors[], sizes[], bestSeller, date, rating{average, count}.
- **OrderModel**: Modelo MongoDB de orden con estados: pending, processing, shipped, delivered.
- **UserModel**: Modelo MongoDB de usuario con roles OWNER/ADMIN/MODERATOR/USER y hasta 2 billingAddresses.
- **UserModel**: Modelo MongoDB de usuario con roles OWNER/ADMIN/MODERATOR/USER y hasta 2 billingAddresses.

---

## Requisitos

### Requisito 1: Sistema de Diseño y Tokens de Diseño

**User Story:** Como desarrollador, quiero un sistema de diseño centralizado con tokens de color, tipografía y espaciado, para que toda la aplicación tenga una apariencia visual consistente y sea fácil de mantener.

#### Criterios de Aceptación

1. THE Design_System SHALL define tokens de color primario, secundario, de acento, de error, de éxito y de advertencia como variables CSS en el archivo `tailwind.config.js`.
2. THE Design_System SHALL definir una escala tipográfica con tamaños de fuente (xs, sm, base, lg, xl, 2xl, 3xl) y pesos (regular, medium, semibold, bold) como tokens de Tailwind.
3. THE Design_System SHALL definir una escala de espaciado consistente (4px base) aplicada en todos los componentes de layout.
4. WHEN un componente de UI es renderizado, THE Design_System SHALL aplicar los tokens de diseño correspondientes sin valores hardcodeados de color o tipografía.
5. THE Design_System SHALL exportar un objeto de tema centralizado consumible tanto por el frontend como por el admin.

---

### Requisito 2: Migración a Zustand — Estado Global

**User Story:** Como desarrollador, quiero reemplazar el ShopContext actual por un store de Zustand, para que el estado global sea más predecible, performante y fácil de depurar.

#### Criterios de Aceptación

1. THE Shop_Store SHALL gestionar el estado de: autenticación (token, usuario), carrito (cartItems), preferencias de UI (search, showSearch) y wishlist.
2. WHEN el usuario inicia sesión, THE Shop_Store SHALL persistir el token en localStorage y actualizar el estado de autenticación de forma sincrónica.
3. WHEN el usuario cierra sesión, THE Shop_Store SHALL limpiar el token de localStorage, vaciar el carrito y vaciar la wishlist en el estado local.
4. THE Shop_Store SHALL exponer acciones tipadas: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `toggleWishlist`, `setToken`.
5. WHEN la aplicación se inicializa, THE Shop_Store SHALL rehidratar el token desde localStorage y sincronizar el carrito con el backend si el token es válido.
6. IF el token almacenado en localStorage ha expirado (respuesta 401 del backend), THEN THE Shop_Store SHALL ejecutar la acción de logout automáticamente.

---

### Requisito 3: Migración a TanStack Query — Fetching y Caché

**User Story:** Como desarrollador, quiero usar TanStack Query para el fetching de datos, para que las peticiones al backend tengan caché automático, estados de carga/error consistentes y revalidación inteligente.

#### Criterios de Aceptación

1. THE Query_Client SHALL configurar un tiempo de caché (staleTime) de 5 minutos para datos de productos y categorías.
2. WHEN una petición al backend falla con error de red, THE Query_Client SHALL reintentar la petición hasta 3 veces con backoff exponencial antes de mostrar el error al usuario.
3. WHEN el usuario agrega un producto al carrito, THE Query_Client SHALL invalidar la query del carrito para forzar una resincronización con el backend.
4. THE Query_Client SHALL proveer estados `isLoading`, `isFetching`, `isError` y `data` a todos los componentes que consumen datos del servidor.
5. WHEN el usuario navega entre páginas, THE Query_Client SHALL servir datos desde caché si están disponibles y no han expirado, evitando peticiones redundantes.
6. THE Query_Client SHALL implementar prefetching de datos de producto al hacer hover sobre una tarjeta de producto en el catálogo.

---

### Requisito 4: Skeleton Loaders

**User Story:** Como usuario, quiero ver placeholders animados mientras se cargan los datos, para que la experiencia de carga sea más fluida y no perciba la aplicación como lenta.

#### Criterios de Aceptación

1. WHEN los productos del catálogo están siendo cargados, THE Skeleton_Loader SHALL mostrar una grilla de 12 tarjetas placeholder con la misma estructura visual que las tarjetas de producto reales.
2. WHEN el detalle de un producto está siendo cargado, THE Skeleton_Loader SHALL mostrar placeholders para la galería de imágenes, título, precio, selector de talla y botón de agregar al carrito.
3. WHEN el dashboard del admin está siendo cargado, THE Skeleton_Loader SHALL mostrar placeholders para cada tarjeta de métrica y para los gráficos.
4. THE Skeleton_Loader SHALL usar animación de pulso (pulse) con colores del Design_System.
5. IF los datos tardan más de 300ms en cargar, THEN THE Skeleton_Loader SHALL ser visible para el usuario.
6. WHEN los datos han cargado exitosamente, THE Skeleton_Loader SHALL ser reemplazado por el contenido real con una transición de opacidad de 200ms.

---

### Requisito 5: Breadcrumbs en Páginas Internas

**User Story:** Como usuario, quiero ver breadcrumbs en las páginas internas, para que pueda entender mi ubicación en el sitio y navegar fácilmente hacia atrás.

#### Criterios de Aceptación

1. WHEN el usuario está en la página de detalle de un producto, THE Breadcrumb SHALL mostrar la ruta: Inicio > [Categoría] > [Nombre del Producto].
2. WHEN el usuario está en la página de colecciones con filtros activos, THE Breadcrumb SHALL mostrar: Inicio > Colecciones > [Categoría activa si aplica].
3. WHEN el usuario está en el checkout, THE Breadcrumb SHALL mostrar: Inicio > Carrito > Checkout.
4. WHEN el usuario está en su perfil, THE Breadcrumb SHALL mostrar: Inicio > Mi Cuenta > [Sección activa].
5. WHEN el usuario hace clic en un elemento del breadcrumb, THE Breadcrumb SHALL navegar a la ruta correspondiente usando React Router.
6. THE Breadcrumb SHALL ser visible en pantallas de ancho mayor a 640px y ocultarse en móvil para preservar espacio.

---

### Requisito 6: Scroll To Top Button

**User Story:** Como usuario, quiero un botón para volver al inicio de la página, para que pueda navegar rápidamente sin hacer scroll manual en páginas largas.

#### Criterios de Aceptación

1. WHEN el usuario ha hecho scroll más de 400px desde el inicio de la página, THE Scroll_To_Top_Button SHALL aparecer con una animación de entrada de 200ms.
2. WHEN el usuario está dentro de los primeros 400px de la página, THE Scroll_To_Top_Button SHALL ocultarse con una animación de salida de 200ms.
3. WHEN el usuario hace clic en el botón, THE Scroll_To_Top_Button SHALL ejecutar `window.scrollTo({ top: 0, behavior: 'smooth' })`.
4. THE Scroll_To_Top_Button SHALL posicionarse en la esquina inferior derecha de la pantalla con z-index suficiente para no ser tapado por otros elementos.

---

### Requisito 7: Manejo de Estados Vacíos y Errores

**User Story:** Como usuario, quiero ver mensajes claros cuando no hay resultados o cuando ocurre un error, para que entienda qué pasó y qué puedo hacer.

#### Criterios de Aceptación

1. WHEN el catálogo no retorna productos para los filtros aplicados, THE Collections_Page SHALL mostrar un estado vacío con mensaje "No encontramos productos con estos filtros" y un botón "Limpiar filtros".
2. WHEN una petición al backend falla con error de red, THE Query_Client SHALL mostrar un toast de error con el mensaje específico del error y un botón "Reintentar".
3. WHEN el carrito está vacío, THE Cart_Page SHALL mostrar una ilustración, el mensaje "Tu carrito está vacío" y un CTA "Ver colección".
4. WHEN la wishlist está vacía, THE Wishlist_Page SHALL mostrar un estado vacío con mensaje "Aún no tienes favoritos" y un CTA "Explorar productos".
5. IF una imagen de producto no carga, THEN THE Product_Image SHALL mostrar un placeholder con el ícono de imagen y el nombre del producto como texto alternativo.
6. WHEN el usuario intenta acceder a una ruta inexistente, THE Router SHALL mostrar una página 404 con mensaje claro y enlace a la página de inicio.

---

### Requisito 8: Home — Hero Mejorado y Secciones Visuales

**User Story:** Como visitante, quiero una página de inicio visualmente atractiva con CTAs claros y secciones de categorías, para que pueda descubrir rápidamente los productos y navegar al catálogo.

#### Criterios de Aceptación

1. THE Hero_Section SHALL mostrar un CTA principal con texto "Ver Colección" que navega a `/collection` y un CTA secundario "Ver Ofertas" que navega a `/collection?sale=true`.
2. THE Category_Grid_Section SHALL mostrar las categorías disponibles obtenidas del endpoint `/api/category` como tarjetas con imagen de fondo, nombre y enlace directo al catálogo filtrado por esa categoría.
3. WHEN las categorías están siendo cargadas, THE Category_Grid_Section SHALL mostrar Skeleton_Loaders con la misma estructura de las tarjetas.
4. THE Featured_Products_Section SHALL mostrar hasta 8 productos con `bestSeller: true` del ProductModel, obtenidos del Catalog_API.
5. THE Sale_Section SHALL mostrar productos con `originalPrice` mayor que `price` en el ProductModel, con el precio original tachado y el precio de oferta destacado.
6. WHEN un producto en oferta tiene fecha de expiración configurada, THE Countdown_Timer SHALL mostrar días, horas, minutos y segundos restantes actualizándose cada segundo.
7. THE Testimonials_Section SHALL mostrar hasta 6 reseñas con rating de 5 estrellas obtenidas del endpoint de reviews, con nombre del usuario, texto y rating.
8. THE Policy_Banner SHALL mostrar íconos y textos de políticas (envío gratis sobre monto mínimo, devoluciones, garantía) usando los tokens del Design_System.

---

### Requisito 9: Filtrado Server-Side del Catálogo

**User Story:** Como usuario, quiero que el catálogo filtre productos en el servidor, para que la aplicación no cargue todos los productos en memoria y el rendimiento sea óptimo con catálogos grandes.

#### Criterios de Aceptación

1. THE Catalog_API SHALL aceptar los parámetros de query: `category`, `subCategory`, `colors[]`, `sizes[]`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`, `search`, `sale`.
2. WHEN el usuario aplica un filtro, THE Collections_Page SHALL enviar una nueva petición al Catalog_API con los parámetros actualizados en lugar de filtrar el array local de productos.
3. THE Catalog_API SHALL retornar: `{ products[], total, page, totalPages, hasMore }` para soportar paginación y scroll infinito.
4. WHEN el usuario cambia el ordenamiento, THE Collections_Page SHALL enviar el parámetro `sort` al Catalog_API con valores: `latest`, `oldest`, `price_asc`, `price_desc`, `rating`.
5. THE Query_Client SHALL cachear los resultados del Catalog_API por combinación única de parámetros de filtro durante 2 minutos.
6. WHEN el usuario escribe en el campo de búsqueda, THE Collections_Page SHALL esperar 300ms (debounce) antes de enviar la petición al Catalog_API para evitar peticiones excesivas.
7. THE Catalog_API SHALL soportar filtrado por rango de precio usando los parámetros `minPrice` y `maxPrice` como números enteros en pesos chilenos.

---

### Requisito 10: Filtros Avanzados del Catálogo — UI

**User Story:** Como usuario, quiero filtros visuales avanzados con chips removibles y un slider de precio, para que pueda refinar mi búsqueda de forma intuitiva y ver claramente qué filtros tengo activos.

#### Criterios de Aceptación

1. WHEN el usuario selecciona un filtro (categoría, color, talla, rango de precio), THE Filter_Chip SHALL aparecer en la zona de filtros activos con el nombre del filtro y un botón "×" para removerlo.
2. WHEN el usuario hace clic en el "×" de un Filter_Chip, THE Collections_Page SHALL remover ese filtro del estado y enviar una nueva petición al Catalog_API.
3. THE Price_Range_Slider SHALL mostrar dos handles deslizables para precio mínimo y máximo, con los valores actuales mostrados en tiempo real.
4. WHEN el usuario suelta el handle del Price_Range_Slider, THE Collections_Page SHALL actualizar los parámetros `minPrice` y `maxPrice` y enviar la petición al Catalog_API.
5. THE Color_Filter SHALL mostrar Color_Swatches en lugar de checkboxes de texto, con el color real del producto como fondo del swatch.
6. WHEN hay más de 0 filtros activos, THE Filter_Panel SHALL mostrar un botón "Limpiar todos los filtros" que resetea todos los parámetros de filtro.
7. THE Collections_Page SHALL soportar toggle entre vista grilla (grid) y vista lista (list), persistiendo la preferencia en localStorage.

---

### Requisito 11: Quick View Modal de Producto

**User Story:** Como usuario, quiero ver información esencial de un producto en un modal sin abandonar el catálogo, para que pueda evaluar productos rápidamente y agregar al carrito sin perder mi posición en la lista.

#### Criterios de Aceptación

1. WHEN el usuario hace hover sobre una tarjeta de producto en el catálogo, THE Product_Card SHALL mostrar un botón "Vista rápida" superpuesto.
2. WHEN el usuario hace clic en "Vista rápida", THE Quick_View SHALL abrir un modal con: imagen principal, nombre, precio, selector de talla, selector de color, botón "Agregar al carrito" y enlace "Ver detalle completo".
3. WHEN el usuario selecciona una talla en el Quick_View y hace clic en "Agregar al carrito", THE Cart_Drawer SHALL abrirse con el producto agregado.
4. WHEN el Quick_View está abierto, THE Quick_View SHALL bloquear el scroll del body y mostrar un overlay oscuro.
5. WHEN el usuario hace clic fuera del modal o en el botón "×", THE Quick_View SHALL cerrarse con animación de salida de 200ms.
6. THE Quick_View SHALL ser accesible con teclado: foco atrapado dentro del modal mientras está abierto, cerrable con la tecla Escape.

---

### Requisito 12: Wishlist / Favoritos

**User Story:** Como usuario autenticado, quiero guardar productos en una lista de favoritos persistente, para que pueda volver a ellos más tarde sin tener que buscarlos nuevamente.

#### Criterios de Aceptación

1. THE Wishlist SHALL persistir en el backend asociada al userId del UserModel, sobreviviendo cierres de sesión y cambios de dispositivo.
2. WHEN el usuario hace clic en el ícono de corazón de una tarjeta de producto, THE Shop_Store SHALL ejecutar `toggleWishlist(productId)` que agrega o remueve el producto de la wishlist.
3. IF el usuario no está autenticado e intenta agregar a wishlist, THEN THE Router SHALL redirigir al usuario a `/login` con el parámetro `redirect` apuntando a la página actual.
4. WHEN un producto está en la wishlist del usuario, THE Product_Card SHALL mostrar el ícono de corazón relleno en color primario.
5. THE Wishlist_Page SHALL mostrar todos los productos favoritos del usuario con opción de agregar al carrito directamente o remover de favoritos.
6. WHEN el usuario remueve un producto de la wishlist desde la Wishlist_Page, THE Wishlist_Page SHALL actualizar la lista sin recargar la página completa.
7. THE Wishlist_API SHALL exponer endpoints: `GET /api/wishlist`, `POST /api/wishlist/:productId`, `DELETE /api/wishlist/:productId`.

---

### Requisito 13: Página de Producto — Mejoras

**User Story:** Como usuario, quiero una página de producto enriquecida con selector de color visual, indicador de stock, historial de vistos y compartir en redes, para que pueda tomar decisiones de compra más informadas.

#### Criterios de Aceptación

1. THE Color_Swatch_Selector SHALL mostrar un círculo de 24x24px con el color real (usando el valor de color del ProductModel) por cada color disponible, con borde negro cuando está seleccionado.
2. WHEN el usuario selecciona una talla, THE Stock_Indicator SHALL mostrar el stock disponible para esa talla: "Disponible" (>5 unidades), "Pocas unidades" (1-5), "Sin stock" (0).
3. THE Share_Buttons SHALL mostrar botones para compartir en WhatsApp, Facebook e Instagram con la URL canónica del producto y la imagen principal.
4. THE Recently_Viewed_Section SHALL mostrar los últimos 6 productos visitados por el usuario, persistidos en localStorage, al final de la página de producto.
5. WHEN el usuario visita una página de producto, THE Recently_Viewed_Section SHALL agregar ese producto al historial local y remover el más antiguo si ya hay 6 productos.
6. THE Product_FAQ_Section SHALL mostrar preguntas frecuentes configurables por producto en formato acordeón, con animación de apertura/cierre.
7. THE Product_Page SHALL mostrar breadcrumbs según el Requisito 5.

---

### Requisito 14: Cart Drawer — Mini Carrito Lateral

**User Story:** Como usuario, quiero que al agregar un producto al carrito se abra un panel lateral con el resumen del carrito, para que pueda continuar comprando sin interrumpir mi flujo de navegación.

#### Criterios de Aceptación

1. WHEN el usuario agrega un producto al carrito desde cualquier página, THE Cart_Drawer SHALL abrirse desde el lado derecho de la pantalla con animación de deslizamiento de 300ms.
2. THE Cart_Drawer SHALL mostrar: lista de productos en el carrito (imagen, nombre, talla, precio, cantidad), subtotal y botones "Seguir comprando" y "Ir al carrito".
3. WHEN el usuario hace clic en "Seguir comprando" o en el overlay, THE Cart_Drawer SHALL cerrarse con animación de salida de 300ms.
4. WHEN el usuario hace clic en "Ir al carrito", THE Cart_Drawer SHALL cerrarse y navegar a `/cart`.
5. THE Cart_Drawer SHALL permitir modificar la cantidad de cada ítem directamente desde el drawer usando controles +/-.
6. WHEN la cantidad de un ítem se reduce a 0 desde el Cart_Drawer, THE Cart_Drawer SHALL remover el ítem con animación de salida.
7. THE Cart_Drawer SHALL ser accesible con teclado y cerrable con la tecla Escape.

---

### Requisito 15: Checkout Mejorado

**User Story:** Como usuario, quiero un proceso de checkout con indicador de pasos, validación en tiempo real y estimación de envío, para que el proceso de compra sea claro y sin fricciones.

#### Criterios de Aceptación

1. THE Checkout_Stepper SHALL mostrar 3 pasos: "Envío", "Pago", "Confirmación", con el paso actual resaltado y los pasos completados marcados con un check.
2. THE Validator SHALL validar cada campo del formulario de envío usando esquemas Zod: email (formato válido), teléfono (formato chileno +56XXXXXXXXX), código postal (5 dígitos), campos requeridos no vacíos.
3. WHEN el usuario sale de un campo con valor inválido, THE Validator SHALL mostrar el mensaje de error específico debajo del campo en color de error del Design_System.
4. WHEN todos los campos del formulario son válidos, THE Checkout_Stepper SHALL habilitar el botón "Continuar" para avanzar al siguiente paso.
5. THE Shipping_Estimator SHALL mostrar el costo de envío estimado basado en la región seleccionada, consultando el endpoint `/api/shipping/estimate?region=X`.
6. THE Coupon_Input SHALL permitir al usuario ingresar un código de descuento; WHEN el código es válido, THE Coupon_Engine SHALL mostrar el descuento aplicado en el resumen de orden.
7. IF el código de cupón es inválido o ha expirado, THEN THE Coupon_Input SHALL mostrar el mensaje de error "Cupón inválido o expirado" en color de error.
8. THE PlaceOrder_Page SHALL usar React Hook Form con resolvers de Zod para toda la validación del formulario.

---

### Requisito 16: Sistema de Cupones de Descuento

**User Story:** Como administrador, quiero crear y gestionar cupones de descuento, para que pueda ejecutar promociones y recompensar a clientes.

#### Criterios de Aceptación

1. THE Coupon_Engine SHALL soportar dos tipos de descuento: porcentaje (ej: 20%) y monto fijo (ej: $5000 CLP).
2. THE Coupon_Engine SHALL validar: que el cupón exista, que no haya expirado (campo `expiresAt`), que no haya superado el límite de usos (`maxUses`), y que el monto mínimo de orden se cumpla (`minOrderAmount`).
3. WHEN el Coupon_Engine valida un cupón exitosamente, THE Coupon_Engine SHALL retornar `{ valid: true, discountType, discountValue, discountAmount }`.
4. IF alguna condición de validación falla, THEN THE Coupon_Engine SHALL retornar `{ valid: false, reason }` con la razón específica del rechazo.
5. THE Admin_Coupon_Page SHALL permitir crear cupones con: código, tipo de descuento, valor, fecha de expiración, límite de usos y monto mínimo de orden.
6. THE Coupon_Engine SHALL incrementar el contador de usos (`usedCount`) de forma atómica al aplicar un cupón en una orden.
7. THE Coupon_API SHALL exponer endpoints: `POST /api/coupon/validate`, `GET /api/coupon` (admin), `POST /api/coupon` (admin), `DELETE /api/coupon/:id` (admin).


---

### Requisito 17: Dashboard de Usuario

**User Story:** Como usuario autenticado, quiero un dashboard con mis estadísticas de compra, para que pueda ver un resumen de mi actividad en la tienda.

#### Criterios de Aceptación

1. THE User_Dashboard SHALL mostrar: total gastado (suma de `amount` de órdenes con `payment: true`), número total de órdenes, número de productos en wishlist y número de reseñas publicadas.
2. WHEN el usuario accede al dashboard, THE Query_Client SHALL obtener las estadísticas del endpoint `GET /api/user/stats` que agrega los datos del UserModel y OrderModel.
3. THE User_Dashboard SHALL mostrar las últimas 3 órdenes del usuario con estado visual (Order_Timeline simplificado).
4. THE User_Dashboard SHALL mostrar los últimos 3 productos de la wishlist con imagen y nombre.
5. WHILE los datos del dashboard están siendo cargados, THE User_Dashboard SHALL mostrar Skeleton_Loaders para cada sección.

---

### Requisito 18: Historial de Órdenes con Tracking Visual

**User Story:** Como usuario, quiero ver el estado de mis órdenes con un timeline visual, para que pueda entender en qué etapa está mi pedido sin necesidad de contactar soporte.

#### Criterios de Aceptación

1. THE Order_Timeline SHALL mostrar los 4 estados del OrderModel (pending, processing, shipped, delivered) como pasos secuenciales con íconos y etiquetas en español.
2. WHEN el estado de la orden es `pending`, THE Order_Timeline SHALL resaltar el primer paso y mostrar los demás en gris.
3. WHEN el estado de la orden es `delivered`, THE Order_Timeline SHALL mostrar todos los pasos completados en color de éxito del Design_System.
4. THE Orders_Page SHALL mostrar cada orden con: número de orden (últimos 8 caracteres del `_id`), fecha formateada, total, método de pago, estado y botón "Ver detalle".
5. WHEN el usuario hace clic en "Ver detalle", THE Order_Detail_Page SHALL mostrar: Order_Timeline, lista de productos con imágenes, dirección de envío y resumen de pago.
6. THE Orders_Page SHALL usar paginación de 10 órdenes por página, obtenidas del endpoint `GET /api/order/userorders?page=X&limit=10`.

---

### Requisito 19: Gestión de Perfil y Direcciones

**User Story:** Como usuario, quiero gestionar mi perfil, contraseña y direcciones de envío desde una interfaz clara, para que pueda mantener mis datos actualizados.

#### Criterios de Aceptación

1. THE Profile_Page SHALL permitir actualizar: nombre, email y foto de perfil (subida a Cloudinary).
2. THE Password_Change_Form SHALL requerir: contraseña actual, nueva contraseña (mínimo 8 caracteres, al menos 1 número y 1 mayúscula) y confirmación de nueva contraseña.
3. THE Validator SHALL validar que la nueva contraseña y la confirmación sean idénticas antes de enviar la petición al backend.
4. THE Address_Manager SHALL mostrar hasta 2 direcciones guardadas (límite del UserModel) con opción de editar, eliminar y marcar como predeterminada.
5. WHEN el usuario marca una dirección como predeterminada, THE Address_Manager SHALL actualizar el campo `isDefault` en el backend y reflejar el cambio en la UI inmediatamente.
6. THE Profile_Page SHALL mostrar un indicador de "Guardando..." mientras la petición al backend está en curso y un toast de éxito al completarse.

---

### Requisito 20: Notificaciones por Email

**User Story:** Como usuario, quiero recibir emails automáticos cuando realizo una compra o cuando cambia el estado de mi orden, para que esté informado sin necesidad de revisar la aplicación.

#### Criterios de Aceptación

1. WHEN una orden es creada exitosamente (COD o MercadoPago confirmado), THE Notification_Service SHALL enviar un email de confirmación al email del usuario con: número de orden, lista de productos, total y dirección de envío.
2. WHEN el administrador cambia el estado de una orden, THE Notification_Service SHALL enviar un email al usuario con el nuevo estado y el Order_Timeline visual en HTML.
3. THE Notification_Service SHALL usar una plantilla HTML responsive con el branding de Harry's Boutique (logo, colores del Design_System).
4. IF el envío del email falla, THEN THE Notification_Service SHALL registrar el error en el sistema de logs del backend sin interrumpir el flujo principal de la orden.
5. THE Notification_Service SHALL integrarse con un proveedor SMTP configurable via variables de entorno (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
6. THE Notification_Service SHALL exponer una función `sendOrderConfirmation(order, user)` y `sendStatusUpdate(order, user, newStatus)` consumibles desde los controladores de orden.

---

### Requisito 21: Búsqueda Avanzada con Sugerencias

**User Story:** Como usuario, quiero una barra de búsqueda con sugerencias en tiempo real, para que pueda encontrar productos rápidamente sin necesidad de escribir el nombre completo.

#### Criterios de Aceptación

1. WHEN el usuario escribe al menos 2 caracteres en la barra de búsqueda, THE Search_Engine SHALL mostrar hasta 5 sugerencias de productos con imagen en miniatura, nombre y precio.
2. THE Search_Engine SHALL implementar búsqueda de texto completo en MongoDB usando índices de texto en los campos `name`, `description` y `category` del ProductModel.
3. WHEN el usuario escribe, THE Search_Engine SHALL esperar 300ms (debounce) antes de enviar la petición al endpoint `GET /api/product/search?q=X&limit=5`.
4. WHEN el usuario selecciona una sugerencia, THE Router SHALL navegar a la página de detalle del producto seleccionado.
5. WHEN el usuario presiona Enter en la barra de búsqueda, THE Router SHALL navegar a `/collection?search=X` mostrando los resultados en el catálogo.
6. WHEN no hay sugerencias para el término buscado, THE Search_Engine SHALL mostrar el mensaje "No se encontraron productos para '[término]'".
7. THE Search_Engine SHALL resaltar el texto coincidente en las sugerencias usando negrita.

---

### Requisito 22: SEO — Meta Tags Dinámicos

**User Story:** Como propietario de la tienda, quiero que cada página tenga meta tags dinámicos correctos, para que los productos aparezcan bien indexados en buscadores y se compartan correctamente en redes sociales.

#### Criterios de Aceptación

1. THE SEO_Manager SHALL usar `react-helmet-async` para gestionar meta tags dinámicos en cada página.
2. WHEN el usuario está en la página de detalle de un producto, THE SEO_Manager SHALL establecer: `<title>` con el nombre del producto y "Harry's Boutique", `<meta name="description">` con los primeros 160 caracteres de la descripción del producto, y Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`).
3. WHEN el usuario está en la página de colecciones con filtros, THE SEO_Manager SHALL establecer un título descriptivo como "Ropa para [Categoría] — Harry's Boutique".
4. THE SEO_Manager SHALL establecer `<link rel="canonical">` con la URL canónica de cada página para evitar contenido duplicado.
5. THE SEO_Manager SHALL incluir datos estructurados (JSON-LD) de tipo `Product` en las páginas de detalle de producto con: nombre, descripción, precio, imagen y rating.
6. THE SEO_Manager SHALL establecer meta tags de robots `noindex` en páginas de checkout, carrito y perfil de usuario.

---

### Requisito 23: Admin — Dashboard con Métricas

**User Story:** Como administrador, quiero un dashboard con métricas clave de ventas y operaciones, para que pueda tomar decisiones informadas sobre el negocio.

#### Criterios de Aceptación

1. THE Admin_Dashboard SHALL mostrar tarjetas de métricas: ventas del día (suma de `amount` de órdenes con `payment: true` del día actual), órdenes pendientes (count de órdenes con `status: 'pending'`), productos con stock bajo (count de productos con stock = 5 en alguna talla), y total de usuarios registrados.
2. THE Admin_Dashboard SHALL mostrar un gráfico de líneas con las ventas de los últimos 7 días y los últimos 30 días, con toggle entre ambas vistas.
3. THE Admin_Dashboard SHALL mostrar una tabla de actividad reciente con las últimas 10 órdenes: número de orden, cliente, monto, estado y fecha.
4. WHEN los datos del dashboard están siendo cargados, THE Admin_Dashboard SHALL mostrar Skeleton_Loaders para cada tarjeta y gráfico.
5. THE Admin_Dashboard_API SHALL exponer el endpoint `GET /api/admin/dashboard` que retorna todas las métricas en una sola petición, protegido por middleware de autenticación admin.
6. THE Admin_Dashboard SHALL refrescar los datos automáticamente cada 5 minutos usando el Query_Client.

---

### Requisito 24: Admin — Gestión Avanzada de Productos

**User Story:** Como administrador, quiero gestionar productos con acciones masivas, filtros, búsqueda y gestión de stock por variante, para que pueda administrar el catálogo de forma eficiente.

#### Criterios de Aceptación

1. THE Admin_Product_List SHALL implementar búsqueda por nombre de producto con debounce de 300ms, enviando la query al endpoint `GET /api/product/list?search=X`.
2. THE Admin_Product_List SHALL implementar filtros por categoría y estado (activo/inactivo) en el lado del servidor.
3. THE Admin_Product_List SHALL soportar selección múltiple de productos mediante checkboxes, con un checkbox "Seleccionar todos" en el header de la tabla.
4. WHEN el administrador selecciona múltiples productos, THE Bulk_Actions_Bar SHALL aparecer con opciones: "Eliminar seleccionados", "Marcar como destacado", "Desmarcar como destacado".
5. WHEN el administrador ejecuta "Eliminar seleccionados", THE Admin_Product_List SHALL mostrar un diálogo de confirmación con el número de productos a eliminar antes de proceder.
6. THE Admin_Product_Form SHALL incluir campos para gestionar stock por talla: un input numérico por cada talla disponible en el array `sizes` del ProductModel.
7. THE Admin_Product_Form SHALL incluir campos para precio original (`originalPrice`) y precio de oferta (`price`), mostrando el porcentaje de descuento calculado automáticamente.
8. THE Admin_Product_Form SHALL mostrar un preview del producto antes de publicar, con la misma visualización que la tarjeta de producto en el frontend.
9. THE Admin_Product_Form SHALL usar `@dnd-kit/core` para reordenar las imágenes del producto mediante drag and drop, reemplazando `react-beautiful-dnd`.

---

### Requisito 25: Admin — Gestión Avanzada de Órdenes

**User Story:** Como administrador, quiero filtrar órdenes, exportarlas a CSV y notificar al cliente al cambiar el estado, para que pueda gestionar el fulfillment de forma eficiente.

#### Criterios de Aceptación

1. THE Admin_Orders_Page SHALL implementar filtros por: estado (pending/processing/shipped/delivered), método de pago (mercadopago/cod), rango de fechas (desde/hasta).
2. WHEN el administrador aplica filtros, THE Admin_Orders_Page SHALL enviar los parámetros al endpoint `GET /api/order/list?status=X&paymentMethod=Y&from=Z&to=W`.
3. THE Admin_Orders_Page SHALL mostrar un botón "Exportar CSV" que descarga las órdenes filtradas actualmente en formato CSV con columnas: ID, fecha, cliente, email, productos, total, estado, método de pago.
4. WHEN el administrador cambia el estado de una orden, THE Notification_Service SHALL enviar automáticamente el email de actualización de estado al cliente (Requisito 20).
5. THE Admin_Order_Detail SHALL mostrar: datos del cliente, dirección de envío, lista de productos con imágenes y cantidades, historial de cambios de estado con timestamps, y total desglosado.
6. THE Admin_Orders_Page SHALL soportar paginación de 20 órdenes por página con indicador del total de órdenes filtradas.

---

### Requisito 26: Admin — Gestión de Clientes

**User Story:** Como administrador, quiero ver la lista de usuarios registrados con su historial de compras y gestionar sus roles, para que pueda administrar la base de clientes.

#### Criterios de Aceptación

1. THE Admin_Customers_Page SHALL mostrar una tabla paginada de usuarios con: nombre, email, rol, fecha de registro, número de órdenes y total gastado.
2. WHEN el administrador hace clic en un usuario, THE Admin_Customer_Detail SHALL mostrar: datos del perfil, historial completo de órdenes y estadísticas (total gastado, orden promedio, última compra).
3. THE Admin_Customers_Page SHALL implementar búsqueda por nombre o email con debounce de 300ms.
4. WHEN el administrador cambia el rol de un usuario, THE Admin_Customer_Detail SHALL enviar la petición al endpoint `PUT /api/user/:id/role` protegido por RBAC (solo OWNER puede cambiar roles).
5. IF el administrador intenta asignar el rol OWNER a un usuario, THEN THE Admin_Customer_Detail SHALL mostrar un error "Solo el propietario puede asignar este rol".
6. THE Admin_Customers_API SHALL exponer `GET /api/admin/customers?page=X&search=Y` que retorna usuarios con sus estadísticas agregadas de órdenes.

---

### Requisito 27: Seguridad del Backend — Helmet y Headers

**User Story:** Como desarrollador, quiero que el backend use Helmet para configurar headers de seguridad HTTP, para que la aplicación esté protegida contra ataques comunes como XSS, clickjacking y sniffing de contenido.

#### Criterios de Aceptación

1. THE Backend SHALL usar el middleware `helmet` configurado en `server.js` antes de cualquier otra ruta.
2. THE Backend SHALL configurar `helmet.contentSecurityPolicy` con directivas que permitan: scripts de MercadoPago (`sdk.mercadopago.com`), imágenes de Cloudinary (`res.cloudinary.com`) y fuentes de Google Fonts.
3. THE Backend SHALL configurar `helmet.hsts` con `maxAge` de 31536000 segundos (1 año) para forzar HTTPS en producción.
4. THE Backend SHALL configurar `helmet.frameguard` con `action: 'deny'` para prevenir clickjacking.
5. WHEN el backend recibe una petición, THE Backend SHALL incluir el header `X-Content-Type-Options: nosniff` en todas las respuestas.
6. THE Backend SHALL mantener el rate limiter existente (`rateLimiter.js`) y el middleware de autenticación (`auth.js`, `adminAuth.js`) sin modificaciones que reduzcan su efectividad.


---

### Requisito 28: Validación de Formularios con Zod + React Hook Form

**User Story:** Como desarrollador, quiero usar Zod y React Hook Form en todos los formularios de la aplicación, para que la validación sea consistente, tipada y con mensajes de error claros.

#### Criterios de Aceptación

1. THE Validator SHALL definir esquemas Zod para: formulario de login, registro, checkout, perfil, cambio de contraseña y formulario de reseña.
2. WHEN un campo del formulario tiene un valor inválido según el esquema Zod, THE Validator SHALL mostrar el mensaje de error específico debajo del campo afectado.
3. THE Validator SHALL validar el formulario de checkout con las siguientes reglas: email con formato válido, teléfono con formato `+56XXXXXXXXX` o `9XXXXXXXX`, código postal de exactamente 5 dígitos numéricos.
4. WHEN el usuario intenta enviar un formulario con errores de validación, THE Validator SHALL prevenir el envío y hacer scroll al primer campo con error.
5. THE React_Hook_Form SHALL usar el modo de validación `onBlur` para mostrar errores al salir de cada campo, y `onChange` para limpiar errores al corregir el valor.
6. FOR ALL formularios de la aplicación, THE Validator SHALL garantizar que los esquemas Zod y los tipos TypeScript/JSDoc sean consistentes entre frontend y backend.

---

### Requisito 29: Infinite Scroll como Alternativa a Paginación

**User Story:** Como usuario, quiero poder activar el modo de scroll infinito en el catálogo, para que los productos se carguen automáticamente al llegar al final de la página sin hacer clic en botones de paginación.

#### Criterios de Aceptación

1. THE Collections_Page SHALL ofrecer un toggle en la UI para cambiar entre modo "Paginación" e "Infinite Scroll", persistiendo la preferencia en localStorage.
2. WHEN el modo Infinite Scroll está activo y el usuario llega al 80% del scroll de la página, THE Collections_Page SHALL enviar una petición al Catalog_API con el parámetro `page` incrementado.
3. WHEN el Catalog_API retorna `hasMore: false`, THE Collections_Page SHALL mostrar el mensaje "Has visto todos los productos" y dejar de observar el scroll.
4. WHEN se están cargando más productos en modo Infinite Scroll, THE Collections_Page SHALL mostrar un Skeleton_Loader de 4 tarjetas al final de la lista.
5. THE Collections_Page SHALL usar `IntersectionObserver` para detectar cuándo el usuario llega al final de la lista, sin listeners de scroll directos.

---

### Requisito 30: Comparación de Productos

**User Story:** Como usuario, quiero poder comparar hasta 3 productos lado a lado, para que pueda evaluar diferencias de precio, talla y características antes de comprar.

#### Criterios de Aceptación

1. THE Product_Card SHALL mostrar un checkbox "Comparar" que agrega el producto a la lista de comparación, visible al hacer hover.
2. THE Compare_Bar SHALL aparecer en la parte inferior de la pantalla cuando hay al menos 2 productos seleccionados para comparar, mostrando las miniaturas de los productos y un botón "Comparar".
3. WHEN el usuario hace clic en "Comparar", THE Compare_Page SHALL mostrar una tabla con los productos seleccionados en columnas y sus atributos en filas: imagen, nombre, precio, categoría, tallas disponibles, colores y rating.
4. THE Compare_Store SHALL limitar la selección a un máximo de 3 productos; IF el usuario intenta agregar un cuarto producto, THEN THE Compare_Bar SHALL mostrar el mensaje "Máximo 3 productos para comparar".
5. THE Compare_Page SHALL incluir un botón "Agregar al carrito" por cada producto en la comparación.


---

## Resumen de Propiedades de Corrección

Las siguientes propiedades son candidatas a pruebas basadas en propiedades (PBT) por su naturaleza algorítmica y variabilidad de inputs:

### Propiedades de Invariante
- **Carrito**: Para cualquier secuencia de operaciones `addToCart` / `removeFromCart` / `updateQuantity`, `getCartCount()` SIEMPRE debe ser igual a la suma de todas las cantidades en `cartItems`.
- **Cupones**: Para cualquier cupón de tipo porcentaje con valor V%, el descuento aplicado SIEMPRE debe ser `Math.floor(orderAmount * V / 100)` sin exceder `orderAmount`.

### Propiedades de Round-Trip
- **Filtros del catálogo**: Para cualquier combinación de filtros aplicados, serializar los filtros a query params y deserializarlos de vuelta DEBE producir el mismo objeto de filtros original.
- **Formularios con Zod**: Para cualquier objeto de datos válido según un esquema Zod, `schema.parse(schema.parse(data))` DEBE ser igual a `schema.parse(data)` (idempotencia del parser).

### Propiedades Metamórficas
- **Búsqueda**: Para cualquier término de búsqueda T, los resultados de buscar T DEBEN ser un subconjunto de los resultados de buscar cualquier prefijo de T.
- **Filtrado server-side**: Para cualquier conjunto de filtros F, `|results(F ? {extraFilter})| = |results(F)|` (agregar filtros nunca aumenta los resultados).

### Propiedades de Idempotencia
- **Wishlist toggle**: Para cualquier productId P, `toggleWishlist(P); toggleWishlist(P)` DEBE resultar en el mismo estado de wishlist que antes de ambas operaciones.
- **Cupón**: Aplicar el mismo cupón dos veces a la misma orden DEBE producir el mismo descuento que aplicarlo una vez.

