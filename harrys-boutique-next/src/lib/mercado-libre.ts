export const MERCADO_LIBRE_LISTING_STATUSES = ['ACTIVE', 'PAUSED', 'INACTIVE'] as const

export type MercadoLibreListingStatus = (typeof MERCADO_LIBRE_LISTING_STATUSES)[number]

export interface MercadoLibreListingInput {
  mercadoLibreUrl?: string | null
  mercadoLibreItemId?: string | null
  mercadoLibreStatus?: MercadoLibreListingStatus | null
}

export interface ValidMercadoLibreListing {
  url: string
  itemId: string
}

const OFFICIAL_HOSTS = new Set(['www.mercadolibre.cl', 'articulo.mercadolibre.cl'])
const ITEM_ID_PATTERN = /^MLC\d+$/

export function isMercadoLibreListingStatus(value: unknown): value is MercadoLibreListingStatus {
  return (
    typeof value === 'string' &&
    MERCADO_LIBRE_LISTING_STATUSES.includes(value as MercadoLibreListingStatus)
  )
}

export function validateMercadoLibreUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !OFFICIAL_HOSTS.has(url.hostname.toLowerCase())) return null

    const isCatalogListing = /\/up\/MLCU\d+\/?$/i.test(url.pathname)
    const isDirectListing = /\/MLC-\d+-.+_JM\/?$/i.test(url.pathname)
    return isCatalogListing || isDirectListing ? url : null
  } catch {
    return null
  }
}

export function resolveMercadoLibreListing(
  input: MercadoLibreListingInput,
): ValidMercadoLibreListing | null {
  if (input.mercadoLibreStatus !== 'ACTIVE' || !input.mercadoLibreUrl) return null

  const itemId = input.mercadoLibreItemId?.trim().toUpperCase()
  const url = validateMercadoLibreUrl(input.mercadoLibreUrl)
  if (!itemId || !ITEM_ID_PATTERN.test(itemId) || !url) return null

  const filters = url.searchParams.get('pdp_filters') ?? ''
  const referencesItem =
    filters.includes(`item_id:${itemId}`) || url.pathname.includes(`/${itemId}-`)
  if (!referencesItem) return null

  return { url: url.toString(), itemId }
}

export function getMercadoLibreValidationError(input: MercadoLibreListingInput): string | null {
  if (input.mercadoLibreUrl && !validateMercadoLibreUrl(input.mercadoLibreUrl)) {
    return 'La URL debe usar HTTPS y pertenecer a una publicación válida de Mercado Libre Chile.'
  }

  if (input.mercadoLibreItemId && !ITEM_ID_PATTERN.test(input.mercadoLibreItemId.trim())) {
    return 'El item ID de Mercado Libre debe tener formato MLC seguido de números.'
  }

  if (input.mercadoLibreStatus !== 'ACTIVE') return null
  if (!resolveMercadoLibreListing(input)) {
    return 'Una publicación activa requiere una URL oficial de Mercado Libre Chile y un item ID MLC válido.'
  }
  return null
}
