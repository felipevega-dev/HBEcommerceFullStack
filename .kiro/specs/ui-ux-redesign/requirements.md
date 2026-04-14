# Documento de Requisitos — Rediseño UI/UX de Harry's Boutique

## Introducción

Este documento describe los requisitos para el rediseño total de la interfaz de usuario (UI) y experiencia de usuario (UX) de Harry's Boutique, una tienda de ropa y accesorios para mascotas. El proyecto abarca dos superficies: el **Frontend** (tienda Next.js 16 con App Router) y el **Panel de Administración** (app React + Vite separada).

El objetivo es elevar la calidad visual y funcional de ambas aplicaciones: corregir bugs visuales existentes, enriquecer el contenido de páginas vacías o escuetas, mejorar la coherencia del sistema de diseño, y modernizar el panel de administración para que sea más usable y profesional.

---

## Glosario

- **Tienda**: La aplicación Next.js que sirve como frontend público de Harry's Boutique (`harrys-boutique-next/`).
- **Panel_Admin**: La aplicación React + Vite separada que permite gestionar productos, órdenes y configuración (`admin/`).
- **Hero_Section**: El componente de banner principal en la página de inicio de la Tienda.
- **Product_Card**: El componente que muestra un producto individual en grillas y listados.
- **Navbar**: La barra de navegación superior de la Tienda.
- **Sidebar**: El menú lateral de navegación del Panel_Admin.
- **Collection_Page**: La página `/collection` de la Tienda que lista todos los productos con filtros.
- **Product_Page**: La página `/product/[id]` de la Tienda con el detalle de un producto.
- **Cart_Drawer**: El panel lateral deslizante del carrito de compras en la Tienda.
- **Sistema_Diseño**: El conjunto de tokens de color, tipografía, espaciado y componentes reutilizables que definen la identidad visual de Harry's Boutique.
- **Toast**: Notificación emergente temporal que informa al usuario sobre el resultado de una acción.
- **Skeleton**: Placeholder animado que se muestra mientras se carga contenido.

---

## Requisitos

### Requisito 1: Sistema de Diseño y Tokens Visuales

**User Story:** Como desarrollador y diseñador, quiero un sistema de diseño coherente con paleta de colores, tipografía y espaciado definidos, para que toda la interfaz de Harry's Boutique tenga una identidad visual consistente y reconocible.

#### Criterios de Aceptación

1. THE Sistema_Diseño SHALL definir una paleta de colores primaria basada en tonos cálidos (rosados/beige/dorados) que evoque el mundo de las mascotas y la moda, reemplazando el esquema actual de grises neutros.
2. THE Sistema_Diseño SHALL definir una tipografía principal serif o sans-serif elegante para títulos y una tipografía secundaria legible para cuerpo de texto.
3. THE Sistema_Diseño SHALL definir tokens de espaciado, radio de bordes y sombras consistentes aplicados en todos los componentes de la Tienda.
4. WHEN se aplica el Sistema_Diseño, THE Tienda SHALL mantener contraste de texto suficiente (ratio mínimo 4.5:1 para texto normal) en todos los componentes.
5. THE Sistema_Diseño SHALL incluir estados visuales definidos (hover, focus, active, disabled) para todos los elementos interactivos.

---

### Requisito 2: Rediseño del Navbar de la Tienda

**User Story:** Como cliente, quiero una barra de navegación clara, atractiva y funcional, para que pueda encontrar fácilmente las secciones de la tienda y acceder a mi cuenta y carrito.

#### Criterios de Aceptación

1. THE Navbar SHALL mostrar el logotipo de Harry's Boutique como imagen (`harrys_logo.png`) en lugar del texto plano actual.
2. THE Navbar SHALL mostrar un indicador visual activo (subrayado o resaltado) en el ítem de navegación correspondiente a la página actual.
3. WHEN el usuario hace hover sobre un ítem de navegación, THE Navbar SHALL mostrar una transición visual suave en menos de 200ms.
4. WHEN el carrito tiene productos, THE Navbar SHALL mostrar el contador de ítems con un badge de color de acento visible sobre el ícono del carrito.
5. WHEN el usuario está autenticado, THE Navbar SHALL mostrar el nombre o avatar del usuario en el menú de perfil.
6. WHEN la pantalla es menor a 640px, THE Navbar SHALL mostrar un menú hamburguesa que abre un drawer lateral con todos los ítems de navegación y acciones de cuenta.
7. THE Navbar SHALL permanecer sticky en la parte superior con efecto de blur/glassmorphism al hacer scroll.

---

### Requisito 3: Rediseño del Hero Section

**User Story:** Como cliente, quiero ver un banner principal impactante y atractivo al entrar a la tienda, para que me inspire a explorar los productos y sienta que es una tienda de calidad.

#### Criterios de Aceptación

1. THE Hero_Section SHALL mostrar slides con una altura mínima de 500px en desktop y 350px en mobile.
2. WHEN hay múltiples slides, THE Hero_Section SHALL mostrar controles de navegación (flechas prev/next) además de los indicadores de puntos actuales.
3. THE Hero_Section SHALL mostrar el título y subtítulo del slide con tipografía grande y legible sobre la imagen.
4. THE Hero_Section SHALL mostrar un botón de llamada a la acción ("Ver producto" o "Comprar ahora") con estilo prominente.
5. WHEN no hay slides configurados, THE Hero_Section SHALL mostrar un banner de fallback con el logo, tagline de la marca y un botón a la colección, en lugar de un div gris vacío.
6. WHEN el slide cambia automáticamente, THE Hero_Section SHALL usar una transición de fade o slide suave de 500ms.
7. THE Hero_Section SHALL ser completamente responsivo y verse correctamente en mobile, tablet y desktop.

---

### Requisito 4: Enriquecimiento de la Página de Inicio

**User Story:** Como cliente, quiero que la página de inicio tenga contenido rico y variado, para que pueda descubrir productos, entender la propuesta de valor de la tienda y sentirme motivado a comprar.

#### Criterios de Aceptación

1. THE Tienda SHALL mostrar una sección de categorías visuales con imágenes o íconos representativos después del Hero_Section, permitiendo navegar directamente a cada categoría.
2. THE Tienda SHALL mostrar la sección "Últimas Colecciones" con un encabezado decorativo (línea divisoria con texto centrado) y descripción de la marca.
3. THE Tienda SHALL mostrar la sección "Más Vendidos" con un badge o etiqueta visual "Best Seller" sobre cada Product_Card.
4. THE Tienda SHALL mostrar una sección de propuesta de valor ("¿Por qué elegirnos?") con íconos, títulos y descripciones de los beneficios de comprar en Harry's Boutique.
5. THE Tienda SHALL mostrar una sección de testimonios o reseñas destacadas de clientes con foto, nombre y comentario.
6. THE Tienda SHALL mostrar el componente NewsletterBox con un diseño visualmente atractivo que incluya imagen de fondo o gradiente de color de acento.
7. WHEN los productos no han cargado aún, THE Tienda SHALL mostrar Skeletons animados en lugar de espacios vacíos.

---

### Requisito 5: Rediseño del Product Card

**User Story:** Como cliente, quiero que las tarjetas de producto sean visualmente atractivas y muestren información relevante de un vistazo, para que pueda evaluar rápidamente si un producto me interesa.

#### Criterios de Aceptación

1. THE Product_Card SHALL mostrar la imagen del producto con una relación de aspecto consistente (3:4) y efecto de zoom suave al hacer hover.
2. WHEN el producto tiene más de una imagen, THE Product_Card SHALL mostrar la segunda imagen al hacer hover sobre la tarjeta (efecto flip/swap de imagen).
3. THE Product_Card SHALL mostrar el nombre del producto, precio y, si aplica, el precio original tachado cuando hay descuento.
4. WHEN el producto es Best Seller, THE Product_Card SHALL mostrar un badge "Best Seller" en la esquina superior izquierda de la imagen.
5. THE Product_Card SHALL mostrar el botón de wishlist (corazón) visible al hacer hover, con animación de llenado al activarse.
6. WHEN el producto tiene calificación, THE Product_Card SHALL mostrar estrellas y el número de reseñas debajo del nombre.
7. THE Product_Card SHALL tener bordes redondeados, sombra sutil y transición de elevación al hacer hover.

---

### Requisito 6: Rediseño de la Página de Colección

**User Story:** Como cliente, quiero que la página de colección sea fácil de navegar y filtrar, para que pueda encontrar rápidamente los productos que busco.

#### Criterios de Aceptación

1. THE Collection_Page SHALL mostrar un encabezado con título de sección, descripción y breadcrumb de navegación.
2. THE Collection_Page SHALL mostrar los filtros en un panel lateral en desktop y en un drawer deslizante en mobile.
3. WHEN se aplica un filtro, THE Collection_Page SHALL mostrar chips/tags de filtros activos con botón de eliminar individual y opción "Limpiar todos".
4. THE Collection_Page SHALL mostrar el conteo de resultados actualizado en tiempo real al cambiar filtros.
5. THE Collection_Page SHALL mostrar opciones de ordenamiento (más reciente, precio ascendente/descendente, mejor valorado) en un selector accesible.
6. WHEN no hay productos con los filtros aplicados, THE Collection_Page SHALL mostrar un estado vacío ilustrado con sugerencia de limpiar filtros.
7. THE Collection_Page SHALL mostrar paginación con números de página, botones anterior/siguiente y opción de ir a primera/última página.

---

### Requisito 7: Rediseño de la Página de Producto

**User Story:** Como cliente, quiero que la página de detalle de producto sea completa y persuasiva, para que tenga toda la información necesaria para tomar una decisión de compra.

#### Criterios de Aceptación

1. THE Product_Page SHALL mostrar una galería de imágenes con thumbnails clicables y vista principal ampliada, con soporte para zoom al hacer hover en desktop.
2. THE Product_Page SHALL mostrar el nombre, precio, descripción, tallas disponibles y colores disponibles de forma clara y jerarquizada.
3. WHEN el producto tiene precio original, THE Product_Page SHALL mostrar el precio original tachado junto al precio actual y el porcentaje de descuento.
4. THE Product_Page SHALL mostrar selectores de talla y color con indicación visual clara del ítem seleccionado y de los ítems no disponibles.
5. THE Product_Page SHALL mostrar un botón "Agregar al carrito" prominente con feedback visual (animación de carga y confirmación).
6. THE Product_Page SHALL mostrar la sección de reseñas con distribución de calificaciones (barras de porcentaje por estrella) y listado de comentarios.
7. THE Product_Page SHALL mostrar una sección de productos relacionados al final de la página.
8. THE Product_Page SHALL mostrar breadcrumb de navegación (Inicio > Categoría > Nombre del producto).

---

### Requisito 8: Rediseño del Cart Drawer

**User Story:** Como cliente, quiero que el carrito lateral sea claro y funcional, para que pueda revisar y modificar mi pedido fácilmente antes de pagar.

#### Criterios de Aceptación

1. THE Cart_Drawer SHALL mostrar cada ítem con imagen, nombre, talla, color, cantidad y precio unitario.
2. THE Cart_Drawer SHALL permitir modificar la cantidad de cada ítem con botones + y - con feedback visual inmediato.
3. THE Cart_Drawer SHALL mostrar el subtotal actualizado en tiempo real al cambiar cantidades.
4. THE Cart_Drawer SHALL mostrar un mensaje de envío gratis cuando el total supera el umbral configurado, o cuánto falta para alcanzarlo.
5. THE Cart_Drawer SHALL mostrar un botón "Ir al checkout" prominente y un enlace "Ver carrito completo".
6. WHEN el carrito está vacío, THE Cart_Drawer SHALL mostrar un estado vacío con ilustración y botón para ir a la colección.
7. THE Cart_Drawer SHALL tener una animación de entrada/salida suave desde el lado derecho.

---

### Requisito 9: Enriquecimiento de la Página "Nosotros"

**User Story:** Como cliente, quiero conocer la historia y valores de Harry's Boutique, para que pueda conectar emocionalmente con la marca y confiar en ella.

#### Criterios de Aceptación

1. THE Tienda SHALL mostrar en la página "Nosotros" la historia de la marca con texto narrativo, imágenes y sección de misión/visión.
2. THE Tienda SHALL mostrar en la página "Nosotros" los valores de la empresa con íconos y descripciones.
3. THE Tienda SHALL mostrar en la página "Nosotros" una sección del equipo o de la mascota inspiradora (Harry) con foto y descripción.
4. THE Tienda SHALL mostrar en la página "Nosotros" estadísticas o logros de la marca (clientes satisfechos, productos, años de experiencia).
5. THE Tienda SHALL mostrar en la página "Nosotros" un llamado a la acción al final que dirija a la colección o al contacto.

---

### Requisito 10: Enriquecimiento de la Página de Contacto

**User Story:** Como cliente, quiero tener múltiples formas de contactar a Harry's Boutique, para que pueda resolver mis dudas de la manera más conveniente para mí.

#### Criterios de Aceptación

1. THE Tienda SHALL mostrar en la página de contacto un formulario con campos de nombre, email, asunto y mensaje, con validación en tiempo real.
2. WHEN el usuario envía el formulario de contacto, THE Tienda SHALL mostrar un Toast de confirmación y limpiar el formulario.
3. THE Tienda SHALL mostrar en la página de contacto información de contacto directo: email, teléfono y redes sociales.
4. THE Tienda SHALL mostrar en la página de contacto el horario de atención al cliente.
5. WHERE la tienda tiene ubicación física, THE Tienda SHALL mostrar un mapa o dirección en la página de contacto.

---

### Requisito 11: Rediseño del Footer

**User Story:** Como cliente, quiero un footer completo e informativo, para que pueda encontrar información importante de la tienda y navegar a secciones secundarias.

#### Criterios de Aceptación

1. THE Footer SHALL mostrar el logo de Harry's Boutique, una descripción breve de la marca y los íconos de redes sociales.
2. THE Footer SHALL mostrar columnas de navegación: Tienda, Ayuda, Legal, con los enlaces correspondientes.
3. THE Footer SHALL mostrar íconos de métodos de pago aceptados (MercadoPago, tarjetas).
4. THE Footer SHALL mostrar el formulario de suscripción al newsletter integrado.
5. THE Footer SHALL mostrar el copyright y año actual.
6. THE Footer SHALL ser completamente responsivo, apilando las columnas en mobile.

---

### Requisito 12: Rediseño del Panel de Administración — Layout y Navegación

**User Story:** Como administrador, quiero un panel de administración con una interfaz moderna y organizada, para que pueda gestionar la tienda de forma eficiente y sin confusión.

#### Criterios de Aceptación

1. THE Panel_Admin SHALL mostrar un Sidebar con íconos SVG propios (no imágenes PNG) para cada sección, con etiquetas en español.
2. THE Sidebar SHALL mostrar el ítem activo con un resaltado visual claro (fondo de color de acento, texto en negrita).
3. THE Panel_Admin SHALL mostrar un Navbar superior con el logo de la tienda, el nombre del administrador autenticado y un botón de logout con ícono.
4. WHEN la pantalla es menor a 768px, THE Panel_Admin SHALL colapsar el Sidebar a solo íconos o a un menú hamburguesa.
5. THE Panel_Admin SHALL usar una paleta de colores coherente con la identidad de Harry's Boutique (no el esquema genérico gris actual).
6. THE Panel_Admin SHALL mostrar un dashboard de inicio con métricas clave (total de órdenes, ingresos del mes, productos activos, órdenes pendientes).

---

### Requisito 13: Rediseño del Panel de Administración — Gestión de Productos

**User Story:** Como administrador, quiero un formulario de creación/edición de productos más claro y usable, para que pueda agregar y actualizar productos rápidamente sin cometer errores.

#### Criterios de Aceptación

1. THE Panel_Admin SHALL mostrar el formulario de agregar producto con secciones claramente separadas: Imágenes, Información básica, Categorización, Variantes (tallas/colores), Precio.
2. THE Panel_Admin SHALL mostrar las zonas de carga de imágenes con drag-and-drop y preview inmediato de la imagen seleccionada.
3. THE Panel_Admin SHALL mostrar la lista de productos en una tabla con columnas: imagen, nombre, categoría, precio, estado (activo/inactivo) y acciones.
4. THE Panel_Admin SHALL mostrar en la lista de productos un buscador y filtros por categoría y estado.
5. WHEN el administrador elimina un producto, THE Panel_Admin SHALL mostrar un modal de confirmación con el nombre del producto antes de proceder.
6. THE Panel_Admin SHALL mostrar indicadores de estado de carga (spinner o skeleton) mientras se obtienen o guardan datos.
7. THE Panel_Admin SHALL mostrar mensajes de error descriptivos cuando falla una operación, en lugar de solo "Error".

---

### Requisito 14: Rediseño del Panel de Administración — Gestión de Órdenes

**User Story:** Como administrador, quiero una vista de órdenes clara y con filtros, para que pueda gestionar el estado de los pedidos de forma eficiente.

#### Criterios de Aceptación

1. THE Panel_Admin SHALL mostrar las órdenes en una tabla con columnas: ID (abreviado), cliente, fecha, total, estado y acciones.
2. THE Panel_Admin SHALL mostrar filtros de órdenes por estado (pendiente, en proceso, enviado, entregado) con contadores por estado.
3. WHEN el administrador expande una orden, THE Panel_Admin SHALL mostrar los detalles del pedido (productos, dirección, método de pago) en un panel expandible o modal.
4. THE Panel_Admin SHALL mostrar el selector de cambio de estado de la orden con colores semánticos por estado (amarillo=pendiente, azul=procesando, verde=enviado, morado=entregado).
5. THE Panel_Admin SHALL mostrar la fecha de la orden en formato legible en español (ej: "15 de enero de 2025").
6. WHEN no hay órdenes, THE Panel_Admin SHALL mostrar un estado vacío con mensaje descriptivo.

---

### Requisito 15: Corrección de Bugs Visuales

**User Story:** Como cliente y administrador, quiero que la interfaz no tenga inconsistencias visuales ni elementos rotos, para que la experiencia de uso sea fluida y profesional.

#### Criterios de Aceptación

1. THE Tienda SHALL mostrar el logo como imagen en el Navbar en lugar del texto plano "Harry's Boutique".
2. THE Tienda SHALL mostrar los textos del Sidebar del Panel_Admin en español (actualmente están en inglés: "Add Items", "List Items", "Orders").
3. THE Tienda SHALL aplicar padding/margin consistente en todas las páginas, eliminando saltos de layout entre secciones.
4. WHEN una imagen de producto no carga, THE Tienda SHALL mostrar un placeholder con el ícono de imagen y el nombre del producto, no un espacio en blanco.
5. THE Panel_Admin SHALL mostrar los formularios con estilos de input consistentes (bordes, padding, focus ring) en todas las páginas.
6. IF el token de administrador expira, THEN THE Panel_Admin SHALL redirigir al login con un mensaje explicativo en lugar de mostrar errores de red.
7. THE Tienda SHALL mostrar los precios siempre con el símbolo de moneda correcto y formato de miles (ej: "$12.990").

---

### Requisito 16: Mejoras de Accesibilidad y Rendimiento

**User Story:** Como cliente, quiero que la tienda sea rápida y accesible, para que pueda usarla cómodamente desde cualquier dispositivo y con cualquier necesidad especial.

#### Criterios de Aceptación

1. THE Tienda SHALL incluir atributos `alt` descriptivos en todas las imágenes de productos y elementos decorativos.
2. THE Tienda SHALL mostrar un indicador de foco visible en todos los elementos interactivos al navegar con teclado.
3. THE Tienda SHALL usar etiquetas semánticas HTML correctas (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) en todas las páginas.
4. WHEN una página está cargando datos, THE Tienda SHALL mostrar Skeletons o spinners en lugar de pantallas en blanco.
5. THE Tienda SHALL optimizar las imágenes usando el componente `next/image` con tamaños apropiados y lazy loading en todas las imágenes fuera del viewport inicial.
6. THE Tienda SHALL mostrar mensajes de error amigables en español cuando falla una operación (agregar al carrito, checkout, login).
