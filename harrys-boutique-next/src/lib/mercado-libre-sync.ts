import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapMercadoLibreItemStatus } from '@/lib/mercado-libre'
import {
  MercadoLibreApiError,
  MercadoLibreNotConfiguredError,
  MercadoLibreNotConnectedError,
  getMercadoLibreAccessToken,
  getMercadoLibreConnection,
  getMercadoLibreRedirectUri,
  isMercadoLibreConfigured,
  mercadoLibreFetch,
  recordMercadoLibreSyncResult,
  toMercadoLibreConnectionSummary,
  type MercadoLibreConnectionSummary,
} from '@/lib/mercado-libre-auth'

export const MERCADO_LIBRE_MULTIGET_BATCH_SIZE = 20
const ITEM_ATTRIBUTES = ['id', 'status', 'price', 'available_quantity', 'permalink'].join(',')

export interface MercadoLibreItemSnapshot {
  id?: string
  status?: string
  price?: number
  available_quantity?: number
  permalink?: string
  message?: string
  error?: string
}

export interface MercadoLibreMultigetEntry {
  code: number
  body?: MercadoLibreItemSnapshot | null
}

export type MercadoLibreSyncOutcome = 'active' | 'paused' | 'closed' | 'missing' | 'failed'

export interface MercadoLibreSyncSummary {
  total: number
  synced: number
  active: number
  paused: number
  closed: number
  missing: number
  failed: number
  durationMs: number
}

export interface MercadoLibreIntegrationStatus {
  configured: boolean
  redirectUri: string
  cronConfigured: boolean
  connection: MercadoLibreConnectionSummary | null
  listings: {
    total: number
    active: number
    paused: number
    inactive: number
    unsynced: number
    withErrors: number
    withoutItemId: number
  }
}

export type MercadoLibreSyncExecution =
  | { ok: true; summary: MercadoLibreSyncSummary }
  | {
      ok: false
      code: 'not_configured' | 'not_connected' | 'api_error' | 'error'
      message: string
    }

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

function roundPrice(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Maps one multiget entry to the product update that mirrors the listing.
 * Prices are copied because Mercado Libre is the source of truth for listed
 * products; local stock is never derived from `available_quantity`.
 */
export function buildMercadoLibreProductUpdate(
  entry: MercadoLibreMultigetEntry | undefined,
  now: Date,
): { data: Prisma.ProductUpdateInput; outcome: MercadoLibreSyncOutcome } {
  if (!entry) {
    return {
      data: { mercadoLibreSyncError: 'Mercado Libre no devolvió esta publicación' },
      outcome: 'failed',
    }
  }

  if (entry.code === 404) {
    return {
      data: {
        mercadoLibreStatus: 'INACTIVE',
        mercadoLibreAvailable: false,
        mercadoLibreSyncedAt: now,
        mercadoLibreSyncError: 'Publicación no encontrada en Mercado Libre',
      },
      outcome: 'missing',
    }
  }

  if (entry.code !== 200 || !entry.body) {
    return {
      data: { mercadoLibreSyncError: `Mercado Libre respondió ${entry.code}` },
      outcome: 'failed',
    }
  }

  const status = mapMercadoLibreItemStatus(entry.body.status)
  const available =
    typeof entry.body.available_quantity === 'number' ? entry.body.available_quantity > 0 : null
  const price =
    typeof entry.body.price === 'number' &&
    Number.isFinite(entry.body.price) &&
    entry.body.price > 0
      ? roundPrice(entry.body.price)
      : undefined

  return {
    data: {
      mercadoLibreStatus: status,
      mercadoLibreAvailable: available,
      mercadoLibreSyncedAt: now,
      mercadoLibreSyncError: null,
      ...(price !== undefined ? { price } : {}),
    },
    outcome: status === 'ACTIVE' ? 'active' : status === 'PAUSED' ? 'paused' : 'closed',
  }
}

function findEntry(entries: MercadoLibreMultigetEntry[], itemId: string, index: number) {
  return entries.find((entry) => entry.body?.id?.toUpperCase() === itemId) ?? entries[index]
}

export async function syncMercadoLibreListings({
  productIds,
  limit = 500,
}: { productIds?: string[]; limit?: number } = {}): Promise<MercadoLibreSyncSummary> {
  const startedAt = Date.now()
  const auth = await getMercadoLibreAccessToken()
  if (!auth) throw new MercadoLibreNotConnectedError()

  const products = await prisma.product.findMany({
    where: {
      mercadoLibreItemId: { not: null },
      ...(productIds?.length ? { id: { in: productIds } } : {}),
    },
    select: { id: true, mercadoLibreItemId: true },
    orderBy: [{ mercadoLibreSyncedAt: { sort: 'asc', nulls: 'first' } }],
    take: limit,
  })

  const summary: MercadoLibreSyncSummary = {
    total: products.length,
    synced: 0,
    active: 0,
    paused: 0,
    closed: 0,
    missing: 0,
    failed: 0,
    durationMs: 0,
  }

  try {
    for (const batch of chunk(products, MERCADO_LIBRE_MULTIGET_BATCH_SIZE)) {
      const itemIds = batch.map((product) => product.mercadoLibreItemId as string)
      const entries = await mercadoLibreFetch<MercadoLibreMultigetEntry[]>(
        `/items?ids=${itemIds.join(',')}&attributes=${ITEM_ATTRIBUTES}`,
        auth.accessToken,
      )
      const list = Array.isArray(entries) ? entries : []
      const now = new Date()

      for (const [index, product] of batch.entries()) {
        const entry = findEntry(list, itemIds[index], index)
        const { data, outcome } = buildMercadoLibreProductUpdate(entry, now)
        await prisma.product.update({ where: { id: product.id }, data })

        summary[outcome] += 1
        if (outcome !== 'failed') summary.synced += 1
      }
    }

    await recordMercadoLibreSyncResult(auth.connection.id, null)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    await recordMercadoLibreSyncResult(auth.connection.id, message).catch(() => undefined)
    throw error
  }

  summary.durationMs = Date.now() - startedAt
  return summary
}

/** Runs a sync and converts known failures into a result the routes can map to HTTP. */
export async function executeMercadoLibreSync(
  options: { productIds?: string[]; limit?: number } = {},
): Promise<MercadoLibreSyncExecution> {
  try {
    const summary = await syncMercadoLibreListings(options)
    return { ok: true, summary }
  } catch (error) {
    if (error instanceof MercadoLibreNotConfiguredError) {
      return { ok: false, code: 'not_configured', message: error.message }
    }
    if (error instanceof MercadoLibreNotConnectedError) {
      return { ok: false, code: 'not_connected', message: error.message }
    }
    if (error instanceof MercadoLibreApiError) {
      console.error('[MercadoLibre Sync] API error', { status: error.status, body: error.body })
      return { ok: false, code: 'api_error', message: error.message }
    }

    console.error('[MercadoLibre Sync] Unexpected error', error)
    return {
      ok: false,
      code: 'error',
      message: error instanceof Error ? error.message : 'Error inesperado al sincronizar',
    }
  }
}

export async function getMercadoLibreIntegrationStatus(): Promise<MercadoLibreIntegrationStatus> {
  const listedWhere = { mercadoLibreItemId: { not: null } } as const

  const [connection, byStatus, unsynced, withErrors, withoutItemId] = await Promise.all([
    getMercadoLibreConnection(),
    prisma.product.groupBy({
      by: ['mercadoLibreStatus'],
      where: listedWhere,
      _count: { _all: true },
    }),
    prisma.product.count({ where: { ...listedWhere, mercadoLibreSyncedAt: null } }),
    prisma.product.count({ where: { ...listedWhere, mercadoLibreSyncError: { not: null } } }),
    prisma.product.count({ where: { mercadoLibreUrl: { not: null }, mercadoLibreItemId: null } }),
  ])

  const count = (status: 'ACTIVE' | 'PAUSED' | 'INACTIVE') =>
    byStatus.find((group) => group.mercadoLibreStatus === status)?._count._all ?? 0

  const active = count('ACTIVE')
  const paused = count('PAUSED')
  const inactive = count('INACTIVE')

  return {
    configured: isMercadoLibreConfigured(),
    redirectUri: getMercadoLibreRedirectUri(),
    cronConfigured: Boolean(process.env.CRON_SECRET),
    connection: connection ? toMercadoLibreConnectionSummary(connection) : null,
    listings: {
      total: active + paused + inactive,
      active,
      paused,
      inactive,
      unsynced,
      withErrors,
      withoutItemId,
    },
  }
}
