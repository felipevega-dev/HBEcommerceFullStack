import type { BrandIconName } from '@/components/ui/brand-icon'

export interface AboutStat {
  value: string
  label: string
  icon: BrandIconName
}

export interface AboutValue {
  title: string
  description: string
  icon: BrandIconName
}

export interface AboutTimelineItem {
  year: string
  title: string
  text: string
}

export interface AboutContent {
  heroEyebrow: string
  heroTitle: string
  heroText: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  standardsTitle: string
  standards: string[]
  stats: AboutStat[]
  storyTitle: string
  storyText: string
  timeline: AboutTimelineItem[]
  valuesTitle: string
  valuesText: string
  values: AboutValue[]
  closingTitle: string
  closingText: string
  closingCtaLabel: string
  closingCtaHref: string
}

export const ABOUT_CONTENT_SETTING_KEY = 'about_page_content'

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  heroEyebrow: 'Nosotros',
  heroTitle: 'Una boutique para mascotas con criterio, calidad y cercanía.',
  heroText:
    "Harry's Boutique es una tienda familiar enfocada en prendas y accesorios que se sienten bien, duran en el tiempo y tienen una identidad clara. Diseñamos para que cada mascota esté cómoda, y para que cada familia compre con confianza.",
  primaryCtaLabel: 'Ver colección',
  primaryCtaHref: '/tienda',
  secondaryCtaLabel: 'Contacto',
  secondaryCtaHref: '/contact',
  standardsTitle: 'Nuestro enfoque',
  standards: [
    'Materiales elegidos por resistencia, tacto y facilidad de cuidado.',
    'Calces revisados para acompañar movimiento y comodidad.',
    'Atención cercana antes y después de cada compra.',
  ],
  stats: [
    { value: '5000+', label: 'Clientes atendidos', icon: 'handshake' },
    { value: '200+', label: 'Productos seleccionados', icon: 'shirt' },
    { value: '4', label: 'Años de experiencia', icon: 'check-circle' },
    { value: '4.9', label: 'Valoración promedio', icon: 'star' },
  ],
  storyTitle: 'De una necesidad familiar a una marca con identidad.',
  storyText:
    'Nuestro crecimiento ha sido intencional: menos ruido, mejores productos y una experiencia más clara para quienes buscan vestir o equipar a sus mascotas con buen gusto.',
  timeline: [
    {
      year: '2020',
      title: 'Origen familiar',
      text: "Harry's Boutique nace desde una necesidad simple: encontrar prendas cómodas, durables y con identidad para mascotas de la familia.",
    },
    {
      year: '2022',
      title: 'Selección y oficio',
      text: 'Consolidamos proveedores, materiales y procesos para elevar la calidad sin perder cercanía con cada cliente.',
    },
    {
      year: 'Hoy',
      title: 'Diseño con criterio',
      text: 'Creamos colecciones pensadas para el uso diario: buenos calces, telas nobles y detalles que hacen reconocible cada pieza.',
    },
  ],
  valuesTitle: 'Principios que guían cada colección',
  valuesText:
    'Estos criterios nos ayudan a mantener una propuesta consistente, útil y reconocible.',
  values: [
    {
      title: 'Calidad verificable',
      description:
        'Seleccionamos telas, terminaciones y proveedores con criterios claros de durabilidad.',
      icon: 'target',
    },
    {
      title: 'Comodidad primero',
      description:
        'Priorizamos calces que respeten el movimiento y el uso cotidiano de cada mascota.',
      icon: 'ruler',
    },
    {
      title: 'Atención cercana',
      description:
        'Acompañamos la elección con información práctica, cambios claros y respuesta directa.',
      icon: 'handshake',
    },
    {
      title: 'Identidad de marca',
      description:
        'Cuidamos que cada colección tenga una estética reconocible sin sacrificar funcionalidad.',
      icon: 'design',
    },
  ],
  closingTitle: 'Nuestro compromiso es que comprar se sienta simple.',
  closingText:
    'Desde la elección de talla hasta el seguimiento del pedido, buscamos que cada paso sea claro. Si tienes dudas, te acompañamos con información concreta y atención directa.',
  closingCtaLabel: 'Ver información de envíos',
  closingCtaHref: '/envios',
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback
}

function iconValue(value: unknown, fallback: BrandIconName): BrandIconName {
  return typeof value === 'string' ? (value as BrandIconName) : fallback
}

export function normalizeAboutContent(value: unknown): AboutContent {
  if (!isObject(value)) return DEFAULT_ABOUT_CONTENT

  const fallback = DEFAULT_ABOUT_CONTENT
  const stats = Array.isArray(value.stats)
    ? value.stats.map((item, index) => {
        const source = isObject(item) ? item : {}
        const defaultItem = fallback.stats[index] ?? fallback.stats[0]
        return {
          value: stringValue(source.value, defaultItem.value),
          label: stringValue(source.label, defaultItem.label),
          icon: iconValue(source.icon, defaultItem.icon),
        }
      })
    : fallback.stats
  const values = Array.isArray(value.values)
    ? value.values.map((item, index) => {
        const source = isObject(item) ? item : {}
        const defaultItem = fallback.values[index] ?? fallback.values[0]
        return {
          title: stringValue(source.title, defaultItem.title),
          description: stringValue(source.description, defaultItem.description),
          icon: iconValue(source.icon, defaultItem.icon),
        }
      })
    : fallback.values
  const timeline = Array.isArray(value.timeline)
    ? value.timeline.map((item, index) => {
        const source = isObject(item) ? item : {}
        const defaultItem = fallback.timeline[index] ?? fallback.timeline[0]
        return {
          year: stringValue(source.year, defaultItem.year),
          title: stringValue(source.title, defaultItem.title),
          text: stringValue(source.text, defaultItem.text),
        }
      })
    : fallback.timeline

  return {
    ...fallback,
    ...Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === 'string')),
    stats,
    values,
    timeline,
    standards: Array.isArray(value.standards)
      ? value.standards.filter((item): item is string => typeof item === 'string')
      : fallback.standards,
  }
}

export function parseAboutContent(raw?: string | null) {
  if (!raw) return DEFAULT_ABOUT_CONTENT

  try {
    return normalizeAboutContent(JSON.parse(raw))
  } catch {
    return DEFAULT_ABOUT_CONTENT
  }
}
