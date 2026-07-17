import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/commerce'

export type StoreSettingType = 'text' | 'textarea' | 'number' | 'email' | 'url' | 'boolean'

export type StoreSettingGroup = 'store' | 'shipping' | 'contact' | 'integrations'

export type StoreSettingDefinition = {
  key: string
  label: string
  description: string
  defaultValue: string
  type: StoreSettingType
  group: StoreSettingGroup
  min?: number
  max?: number
}

export const STORE_SETTING_GROUP_LABELS: Record<StoreSettingGroup, string> = {
  store: 'Tienda',
  shipping: 'Envios',
  contact: 'Contacto',
  integrations: 'Integraciones',
}

export const STORE_SETTING_DEFINITIONS = [
  {
    key: 'store_name',
    label: 'Nombre de la tienda',
    description: 'Nombre publico usado en el sitio y comunicaciones.',
    defaultValue: "Harry's Boutique",
    type: 'text',
    group: 'store',
  },
  {
    key: 'currency',
    label: 'Codigo de moneda',
    description: 'Codigo ISO usado por pagos y formatos.',
    defaultValue: 'CLP',
    type: 'text',
    group: 'store',
  },
  {
    key: 'currency_symbol',
    label: 'Simbolo de moneda',
    description: 'Simbolo visual para precios.',
    defaultValue: '$',
    type: 'text',
    group: 'store',
  },
  {
    key: 'shipping_fee',
    label: 'Costo de envio base',
    description: 'Monto CLP cobrado cuando no aplica envio gratis.',
    defaultValue: String(SHIPPING_FEE),
    type: 'number',
    group: 'shipping',
    min: 0,
    max: 50000,
  },
  {
    key: 'free_shipping_threshold',
    label: 'Envio gratis desde',
    description: 'Monto CLP minimo para envio gratis. Usa 0 para desactivar.',
    defaultValue: String(FREE_SHIPPING_THRESHOLD),
    type: 'number',
    group: 'shipping',
    min: 0,
    max: 1000000,
  },
  {
    key: 'max_billing_addresses',
    label: 'Direcciones por cliente',
    description: 'Maximo de direcciones guardadas por usuario.',
    defaultValue: '2',
    type: 'number',
    group: 'shipping',
    min: 1,
    max: 10,
  },
  {
    key: 'store_email',
    label: 'Email de contacto',
    description: 'Correo publico para consultas de clientes.',
    defaultValue: 'contacto@harrysboutique.cl',
    type: 'email',
    group: 'contact',
  },
  {
    key: 'whatsapp_number',
    label: 'WhatsApp',
    description: 'Numero en formato internacional, por ejemplo +56912345678.',
    defaultValue: '',
    type: 'text',
    group: 'contact',
  },
  {
    key: 'store_address',
    label: 'Direccion visible',
    description: 'Direccion o ciudad que se muestra al cliente.',
    defaultValue: 'Arica, Chile',
    type: 'textarea',
    group: 'contact',
  },
  {
    key: 'instagram_url',
    label: 'Instagram',
    description: 'URL publica del perfil de Instagram.',
    defaultValue: 'https://www.instagram.com/harrysboutique.CL',
    type: 'url',
    group: 'integrations',
  },
  {
    key: 'google_maps_url',
    label: 'Google Maps',
    description: 'URL publica de ubicacion si aplica.',
    defaultValue: '',
    type: 'url',
    group: 'integrations',
  },
  {
    key: 'cash_on_delivery_enabled',
    label: 'Pago contra entrega',
    description: 'Activa o desactiva pago contra entrega en la tienda.',
    defaultValue: 'true',
    type: 'boolean',
    group: 'integrations',
  },
] as const satisfies readonly StoreSettingDefinition[]

export const STORE_SETTING_KEYS = STORE_SETTING_DEFINITIONS.map((setting) => setting.key)

export const STORE_SETTING_MAP: ReadonlyMap<string, StoreSettingDefinition> = new Map(
  STORE_SETTING_DEFINITIONS.map((setting) => [setting.key, setting]),
)

export const CONTENT_SETTING_KEYS = new Set(['about_page_content'])

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getDefaultSettingsMap() {
  return Object.fromEntries(
    STORE_SETTING_DEFINITIONS.map((setting) => [setting.key, setting.defaultValue]),
  )
}

export function normalizeStoreSettingValue(definition: StoreSettingDefinition, value: unknown) {
  const rawValue = String(value ?? '').trim()

  if (definition.type === 'number') {
    const parsed = Number(rawValue)
    if (!Number.isFinite(parsed)) throw new Error(`${definition.label} debe ser un numero`)
    if (definition.min != null && parsed < definition.min) {
      throw new Error(`${definition.label} debe ser mayor o igual a ${definition.min}`)
    }
    if (definition.max != null && parsed > definition.max) {
      throw new Error(`${definition.label} debe ser menor o igual a ${definition.max}`)
    }
    return String(Math.round(parsed))
  }

  if (definition.type === 'email') {
    if (rawValue === '') return ''
    if (!EMAIL_PATTERN.test(rawValue)) throw new Error(`${definition.label} debe ser un email`)
    return rawValue
  }

  if (definition.type === 'url') {
    if (rawValue === '') return ''
    try {
      return new URL(rawValue).toString()
    } catch {
      throw new Error(`${definition.label} debe ser una URL valida`)
    }
  }

  if (definition.type === 'boolean') {
    return ['true', '1', 'yes', 'on'].includes(rawValue.toLowerCase()) ? 'true' : 'false'
  }

  return rawValue
}

export function normalizeSettingsUpdate(updates: Record<string, unknown>) {
  const normalized: Record<string, string> = {}
  const errors: Record<string, string> = {}

  for (const [key, value] of Object.entries(updates)) {
    const definition = STORE_SETTING_MAP.get(key)

    if (!definition) {
      if (CONTENT_SETTING_KEYS.has(key)) {
        normalized[key] = String(value ?? '')
        continue
      }

      errors[key] = 'Configuracion no permitida'
      continue
    }

    try {
      normalized[key] = normalizeStoreSettingValue(definition, value)
    } catch (error) {
      errors[key] = error instanceof Error ? error.message : 'Valor invalido'
    }
  }

  return { normalized, errors }
}
