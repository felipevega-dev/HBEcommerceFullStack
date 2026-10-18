// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { prisma, getMercadoLibreAccessToken, mercadoLibreFetch, recordMercadoLibreSyncResult } =
  vi.hoisted(() => ({
    prisma: {
      product: { findMany: vi.fn(), update: vi.fn(), groupBy: vi.fn(), count: vi.fn() },
      mercadoLibreConnection: { findFirst: vi.fn() },
    },
    getMercadoLibreAccessToken: vi.fn(),
    mercadoLibreFetch: vi.fn(),
    recordMercadoLibreSyncResult: vi.fn(),
  }))

vi.mock('@/lib/prisma', () => ({ prisma }))
vi.mock('@/lib/mercado-libre-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mercado-libre-auth')>()
  return { ...actual, getMercadoLibreAccessToken, mercadoLibreFetch, recordMercadoLibreSyncResult }
})

import { MercadoLibreApiError, MercadoLibreNotConnectedError } from '../mercado-libre-auth'
import {
  buildMercadoLibreProductUpdate,
  executeMercadoLibreSync,
  getMercadoLibreIntegrationStatus,
  syncMercadoLibreListings,
} from '../mercado-libre-sync'

const now = new Date('2026-10-18T12:00:00.000Z')
const connection = { id: 'conn-1', mlUserId: '123', createdAt: now, expiresAt: now }

describe('buildMercadoLibreProductUpdate', () => {
  it('mirrors an active listing with price and availability', () => {
    expect(
      buildMercadoLibreProductUpdate(
        { code: 200, body: { id: 'MLC1', status: 'active', price: 12990, available_quantity: 3 } },
        now,
      ),
    ).toEqual({
      outcome: 'active',
      data: {
        mercadoLibreStatus: 'ACTIVE',
        mercadoLibreAvailable: true,
        mercadoLibreSyncedAt: now,
        mercadoLibreSyncError: null,
        price: 12990,
      },
    })
  })

  it('marks sold out listings and paused listings', () => {
    expect(
      buildMercadoLibreProductUpdate(
        { code: 200, body: { id: 'MLC1', status: 'active', price: 12990, available_quantity: 0 } },
        now,
      ).data,
    ).toMatchObject({ mercadoLibreStatus: 'ACTIVE', mercadoLibreAvailable: false })

    expect(
      buildMercadoLibreProductUpdate(
        { code: 200, body: { id: 'MLC1', status: 'paused', price: 12990 } },
        now,
      ),
    ).toMatchObject({
      outcome: 'paused',
      data: { mercadoLibreStatus: 'PAUSED', mercadoLibreAvailable: null },
    })
  })

  it('does not copy invalid prices', () => {
    expect(
      buildMercadoLibreProductUpdate(
        { code: 200, body: { id: 'MLC1', status: 'active', price: 0 } },
        now,
      ).data,
    ).not.toHaveProperty('price')
  })

  it('closes listings that no longer exist', () => {
    expect(
      buildMercadoLibreProductUpdate({ code: 404, body: { message: 'not found' } }, now),
    ).toEqual({
      outcome: 'missing',
      data: {
        mercadoLibreStatus: 'INACTIVE',
        mercadoLibreAvailable: false,
        mercadoLibreSyncedAt: now,
        mercadoLibreSyncError: 'Publicación no encontrada en Mercado Libre',
      },
    })
  })

  it('records errors without touching the previous sync state', () => {
    expect(buildMercadoLibreProductUpdate({ code: 500, body: null }, now)).toEqual({
      outcome: 'failed',
      data: { mercadoLibreSyncError: 'Mercado Libre respondió 500' },
    })
    expect(buildMercadoLibreProductUpdate(undefined, now).outcome).toBe('failed')
  })
})

describe('syncMercadoLibreListings', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getMercadoLibreAccessToken.mockResolvedValue({ accessToken: 'token-1', connection })
    prisma.product.update.mockResolvedValue({})
    recordMercadoLibreSyncResult.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates every linked product from one multiget call', async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: 'p1', mercadoLibreItemId: 'MLC1' },
      { id: 'p2', mercadoLibreItemId: 'MLC2' },
      { id: 'p3', mercadoLibreItemId: 'MLC3' },
    ])
    mercadoLibreFetch.mockResolvedValue([
      { code: 200, body: { id: 'MLC1', status: 'active', price: 10990, available_quantity: 2 } },
      { code: 200, body: { id: 'MLC2', status: 'paused', price: 5990, available_quantity: 1 } },
      { code: 404, body: { message: 'Item with id MLC3 not found' } },
    ])

    const summary = await syncMercadoLibreListings()

    expect(mercadoLibreFetch).toHaveBeenCalledTimes(1)
    expect(mercadoLibreFetch.mock.calls[0][0]).toBe(
      '/items?ids=MLC1,MLC2,MLC3&attributes=id,status,price,available_quantity,permalink',
    )
    expect(mercadoLibreFetch.mock.calls[0][1]).toBe('token-1')

    expect(prisma.product.update).toHaveBeenCalledTimes(3)
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: expect.objectContaining({
        mercadoLibreStatus: 'ACTIVE',
        mercadoLibreAvailable: true,
        price: 10990,
      }),
    })
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p2' },
      data: expect.objectContaining({ mercadoLibreStatus: 'PAUSED', price: 5990 }),
    })
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p3' },
      data: expect.objectContaining({
        mercadoLibreStatus: 'INACTIVE',
        mercadoLibreAvailable: false,
      }),
    })

    expect(summary).toMatchObject({
      total: 3,
      synced: 3,
      active: 1,
      paused: 1,
      closed: 0,
      missing: 1,
      failed: 0,
    })
    expect(recordMercadoLibreSyncResult).toHaveBeenCalledWith('conn-1', null)
  })

  it('splits requests in batches of 20 item ids', async () => {
    prisma.product.findMany.mockResolvedValue(
      Array.from({ length: 25 }, (_, index) => ({
        id: `p${index}`,
        mercadoLibreItemId: `MLC${index}`,
      })),
    )
    mercadoLibreFetch.mockImplementation(async (path: string) => {
      const ids = new URL(`https://api.test${path}`).searchParams.get('ids')?.split(',') ?? []
      return ids.map((id) => ({ code: 200, body: { id, status: 'active', price: 1000 } }))
    })

    const summary = await syncMercadoLibreListings()

    expect(mercadoLibreFetch).toHaveBeenCalledTimes(2)
    expect(mercadoLibreFetch.mock.calls[0][0]).toContain('ids=MLC0,')
    expect(mercadoLibreFetch.mock.calls[1][0]).toContain('ids=MLC20,')
    expect(summary).toMatchObject({ total: 25, synced: 25, active: 25 })
  })

  it('fails when no seller account is connected', async () => {
    getMercadoLibreAccessToken.mockResolvedValue(null)

    await expect(syncMercadoLibreListings()).rejects.toBeInstanceOf(MercadoLibreNotConnectedError)
    await expect(executeMercadoLibreSync()).resolves.toEqual({
      ok: false,
      code: 'not_connected',
      message: expect.stringContaining('no está conectado'),
    })
  })

  it('records the error on the connection when Mercado Libre fails', async () => {
    prisma.product.findMany.mockResolvedValue([{ id: 'p1', mercadoLibreItemId: 'MLC1' }])
    mercadoLibreFetch.mockRejectedValue(
      new MercadoLibreApiError('Mercado Libre respondió 429', 429),
    )

    const result = await executeMercadoLibreSync()

    expect(result).toEqual({ ok: false, code: 'api_error', message: 'Mercado Libre respondió 429' })
    expect(recordMercadoLibreSyncResult).toHaveBeenCalledWith(
      'conn-1',
      'Mercado Libre respondió 429',
    )
    expect(prisma.product.update).not.toHaveBeenCalled()
  })
})

describe('getMercadoLibreIntegrationStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('MERCADOLIBRE_CLIENT_ID', 'app-id')
    vi.stubEnv('MERCADOLIBRE_CLIENT_SECRET', 'app-secret')
    vi.stubEnv('MERCADOLIBRE_REDIRECT_URI', 'https://harrys.test/api/admin/mercadolibre/callback')
    vi.stubEnv('CRON_SECRET', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('summarises the connection and the listing counters', async () => {
    prisma.mercadoLibreConnection.findFirst.mockResolvedValue({
      ...connection,
      nickname: 'HARRYS',
      lastSyncAt: now,
      lastSyncError: null,
    })
    prisma.product.groupBy.mockResolvedValue([
      { mercadoLibreStatus: 'ACTIVE', _count: { _all: 3 } },
      { mercadoLibreStatus: 'PAUSED', _count: { _all: 1 } },
    ])
    prisma.product.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1).mockResolvedValueOnce(0)

    await expect(getMercadoLibreIntegrationStatus()).resolves.toEqual({
      configured: true,
      redirectUri: 'https://harrys.test/api/admin/mercadolibre/callback',
      cronConfigured: false,
      connection: {
        mlUserId: '123',
        nickname: 'HARRYS',
        connectedAt: now.toISOString(),
        expiresAt: now.toISOString(),
        lastSyncAt: now.toISOString(),
        lastSyncError: null,
      },
      listings: {
        total: 4,
        active: 3,
        paused: 1,
        inactive: 0,
        unsynced: 2,
        withErrors: 1,
        withoutItemId: 0,
      },
    })
  })

  it('reports a missing connection and configuration', async () => {
    vi.stubEnv('MERCADOLIBRE_CLIENT_ID', '')
    prisma.mercadoLibreConnection.findFirst.mockResolvedValue(null)
    prisma.product.groupBy.mockResolvedValue([])
    prisma.product.count.mockResolvedValue(0)

    await expect(getMercadoLibreIntegrationStatus()).resolves.toMatchObject({
      configured: false,
      connection: null,
      listings: { total: 0 },
    })
  })
})
