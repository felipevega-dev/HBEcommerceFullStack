import type { PricingSettings } from '@/lib/checkout'

export const PUBLIC_CONTACT_EMAIL = 'contacto@harrysboutique.cl'
export const MERCADO_LIBRE_HELP_URL = 'https://www.mercadolibre.cl/ayuda'

export type PurchaseHelpChannel = 'mercadolibre' | 'direct'

export interface PurchaseChannelHelpContent {
  channel: PurchaseHelpChannel
  eyebrow: string
  title: string
  description: string
  highlights: string[]
}

export interface FaqItem {
  q: string
  a: string
}

export interface FaqSection {
  category: string
  items: FaqItem[]
}

export function formatClp(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function getDirectShippingSummary(pricing: PricingSettings) {
  if (pricing.freeShippingThreshold <= 0) {
    return `El despacho tiene una tarifa base de ${formatClp(pricing.shippingFee)}, visible antes de finalizar la compra.`
  }

  return `El despacho es gratis desde ${formatClp(pricing.freeShippingThreshold)}. Para compras menores se aplica una tarifa base de ${formatClp(pricing.shippingFee)}, visible antes de pagar.`
}

export function getPurchaseChannelHelp(pricing: PricingSettings): PurchaseChannelHelpContent[] {
  return [
    {
      channel: 'mercadolibre',
      eyebrow: 'Publicación oficial',
      title: 'Compra en Mercado Libre',
      description:
        'El pago se completa en Mercado Libre. Allí encontrarás el precio, el stock y las condiciones vigentes de cada publicación.',
      highlights: [
        'Pago y protección gestionados por Mercado Libre',
        'Stock y despacho informados en la publicación',
        'Seguimiento, cancelación y devolución desde tu cuenta',
      ],
    },
    {
      channel: 'direct',
      eyebrow: "Atención Harry's",
      title: 'Compra directa o personalizada',
      description:
        "Los productos sin publicación de Mercado Libre se compran en el carrito de Harry's o se coordinan directamente con nuestro Atelier.",
      highlights: [
        'Pago directo procesado mediante MercadoPago',
        getDirectShippingSummary(pricing),
        `Cambios y ayuda en ${PUBLIC_CONTACT_EMAIL}`,
      ],
    },
  ]
}

export function getFaqSections(pricing: PricingSettings): FaqSection[] {
  const shippingSummary = getDirectShippingSummary(pricing)

  return [
    {
      category: 'Pedidos y pagos',
      items: [
        {
          q: '¿Cómo sé dónde comprar cada producto?',
          a: 'La ficha indica el canal disponible. “Comprar en Mercado Libre” abre la publicación oficial; “Comprar en Harry’s” permite seleccionar la variante y usar el carrito directo.',
        },
        {
          q: '¿Qué medios de pago están disponibles?',
          a: 'En Mercado Libre se muestran los medios habilitados por la plataforma. En la compra directa, el pago se procesa mediante MercadoPago con las opciones disponibles al finalizar la compra.',
        },
        {
          q: '¿Puedo modificar o cancelar mi pedido?',
          a: 'Si compraste en Mercado Libre, gestiona la solicitud desde el detalle de esa compra. Para pedidos directos, contáctanos antes del despacho y revisaremos el caso contigo.',
        },
      ],
    },
    {
      category: 'Envíos',
      items: [
        {
          q: '¿Cuánto tarda en llegar mi pedido?',
          a: 'Mercado Libre informa su propia fecha estimada en la publicación y durante la compra. Para pedidos directos, nuestras estimaciones dependen de la comuna y comienzan una vez preparado el pedido.',
        },
        {
          q: '¿Tienen envío gratis?',
          a: `En Mercado Libre, el costo y los beneficios de envío se muestran en la publicación. Para compras directas, ${shippingSummary.charAt(0).toLowerCase()}${shippingSummary.slice(1)}`,
        },
        {
          q: '¿Cómo puedo rastrear mi pedido?',
          a: 'Las compras de Mercado Libre se siguen desde “Mis compras”. En pedidos directos recibirás el número de seguimiento cuando el despacho sea confirmado, si el servicio lo ofrece.',
        },
      ],
    },
    {
      category: 'Devoluciones y cambios',
      items: [
        {
          q: '¿Cómo solicito una devolución?',
          a: 'Para una compra de Mercado Libre, inicia la gestión desde el detalle de la compra. Para una compra directa estándar, escríbenos a contacto@harrysboutique.cl dentro de los 10 días siguientes a la recepción y conserva el producto sin uso.',
        },
        {
          q: '¿Qué ocurre si el producto directo presenta una falla?',
          a: 'La garantía legal permite solicitar cambio, reparación o devolución durante los seis meses siguientes a la recepción cuando corresponde. Contáctanos con el número de pedido y fotografías del producto.',
        },
        {
          q: '¿Los productos personalizados tienen las mismas condiciones?',
          a: 'Los encargos confeccionados según tus especificaciones pueden tener condiciones particulares. Te las informaremos de forma clara antes de confirmar el trabajo y el pago.',
        },
      ],
    },
    {
      category: 'Productos y tallas',
      items: [
        {
          q: '¿Cómo elijo la talla correcta?',
          a: 'Revisa la guía de talla y mide cuello, pecho y largo antes de comprar. Si tienes dudas, contáctanos antes de confirmar el pedido.',
        },
        {
          q: '¿Las selecciones de talla o color se transfieren a Mercado Libre?',
          a: 'No. Cuando compras en Mercado Libre debes volver a elegir allí las opciones disponibles. La ficha de Harry’s funciona como catálogo y no modifica el carrito de Mercado Libre.',
        },
        {
          q: '¿Los materiales son adecuados para mascotas?',
          a: 'Seleccionamos materiales cómodos y resistentes para uso supervisado. Revisa siempre el ajuste de la prenda y retírala si causa incomodidad.',
        },
      ],
    },
  ]
}
