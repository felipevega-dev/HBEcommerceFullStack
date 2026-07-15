export const MERCADO_LIBRE_LISTING_STATUSES = ['ACTIVE', 'PAUSED', 'INACTIVE'] as const

export type MercadoLibreListingStatus = (typeof MERCADO_LIBRE_LISTING_STATUSES)[number]

export interface MercadoLibreListingInput {
  mercadoLibreUrl?: string | null
  mercadoLibreItemId?: string | null
  mercadoLibreStatus?: MercadoLibreListingStatus | null
}

export interface NormalizedMercadoLibreListingInput {
  mercadoLibreUrl?: string | null
  mercadoLibreItemId?: string | null
  mercadoLibreStatus?: MercadoLibreListingStatus
}

export interface ValidMercadoLibreListing {
  url: string
  itemId?: string
}

export type ProductPurchaseChannel =
  | { type: 'mercadolibre'; listing: ValidMercadoLibreListing }
  | { type: 'direct' }

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

    const filters = url.searchParams.get('pdp_filters') ?? ''
    const hasFilteredItemId = /(?:^|,)item_id:MLC\d+(?:,|$)/i.test(filters)
    const isUserProductListing = /\/up\/MLCU\d+\/?$/i.test(url.pathname) && hasFilteredItemId
    const isCatalogProductListing = /\/p\/MLC\d+\/?$/i.test(url.pathname)
    const isDirectListing = /\/MLC-\d+-.+_JM\/?$/i.test(url.pathname)

    return isUserProductListing || isCatalogProductListing || isDirectListing ? url : null
  } catch {
    return null
  }
}

export function extractMercadoLibreItemId(url: URL): string | undefined {
  const filters = url.searchParams.get('pdp_filters') ?? ''
  const filteredItemId = filters.match(/(?:^|,)item_id:(MLC\d+)(?:,|$)/i)?.[1]
  if (filteredItemId) return filteredItemId.toUpperCase()

  const directItemId = url.pathname.match(/\/(MLC)-?(\d+)(?:-|\/|$)/i)
  return directItemId ? `${directItemId[1]}${directItemId[2]}`.toUpperCase() : undefined
}

export function resolveMercadoLibreListing(
  input: MercadoLibreListingInput,
): ValidMercadoLibreListing | null {
  if (!input.mercadoLibreUrl) return null

  const url = validateMercadoLibreUrl(input.mercadoLibreUrl)
  if (!url) return null

  const storedItemId = input.mercadoLibreItemId?.trim().toUpperCase()
  const urlItemId = extractMercadoLibreItemId(url)
  if (storedItemId && urlItemId && storedItemId !== urlItemId) return null

  return { url: url.toString(), itemId: storedItemId ?? urlItemId }
}

export function resolveProductPurchaseChannel(
  input: MercadoLibreListingInput,
): ProductPurchaseChannel {
  const listing = resolveMercadoLibreListing(input)
  return listing ? { type: 'mercadolibre', listing } : { type: 'direct' }
}

export function mergeMercadoLibreListingInput(
  current: MercadoLibreListingInput,
  update: MercadoLibreListingInput,
): NormalizedMercadoLibreListingInput {
  const mercadoLibreUrl =
    update.mercadoLibreUrl === undefined
      ? current.mercadoLibreUrl
      : update.mercadoLibreUrl?.trim() || null
  const urlWasChanged =
    update.mercadoLibreUrl !== undefined && mercadoLibreUrl !== current.mercadoLibreUrl
  const validatedUrl = mercadoLibreUrl ? validateMercadoLibreUrl(mercadoLibreUrl) : null
  const itemIdFromUrl = validatedUrl ? extractMercadoLibreItemId(validatedUrl) : undefined

  return {
    mercadoLibreUrl,
    mercadoLibreItemId:
      update.mercadoLibreItemId === undefined
        ? urlWasChanged && mercadoLibreUrl
          ? itemIdFromUrl
          : current.mercadoLibreItemId || itemIdFromUrl
        : update.mercadoLibreItemId?.trim().toUpperCase() || null,
    mercadoLibreStatus: update.mercadoLibreStatus ?? current.mercadoLibreStatus ?? undefined,
  }
}

export function getMercadoLibreValidationError(input: MercadoLibreListingInput): string | null {
  if (input.mercadoLibreUrl && !validateMercadoLibreUrl(input.mercadoLibreUrl)) {
    return 'La URL debe usar HTTPS y corresponder a una publicación de Mercado Libre Chile.'
  }

  if (input.mercadoLibreItemId && !ITEM_ID_PATTERN.test(input.mercadoLibreItemId.trim())) {
    return 'El item ID de Mercado Libre debe tener formato MLC seguido de números.'
  }

  if (input.mercadoLibreUrl && !resolveMercadoLibreListing(input)) {
    return 'El item ID no coincide con la publicación de Mercado Libre.'
  }

  return null
}
