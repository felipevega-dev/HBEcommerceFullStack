// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { executeMercadoLibreSync, revalidateCatalogCache, revalidateProductPages } = vi.hoisted(
  () => ({
    executeMercadoLibreSync: vi.fn(),
    revalidateCatalogCache: vi.fn(),
    revalidateProductPages: vi.fn(),
  }),
)

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/lib/mercado-libre-sync', () => ({ executeMercadoLibreSync }))
vi.mock('@/lib/cache', () => ({ revalidateCatalogCache, revalidateProductPages }))

import { GET } from '../mercadolibre-sync/route'

function request(authorization?: string) {
  return new NextRequest('http://localhost:3000/api/cron/mercadolibre-sync', {
    headers: authorization ? { authorization } : {},
  })
}

const summary = {
  total: 2,
  synced: 2,
  active: 2,
  paused: 0,
  closed: 0,
  missing: 0,
  failed: 0,
  durationMs: 120,
}

describe('GET /api/cron/mercadolibre-sync', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('CRON_SECRET', 'cron-secret')
    executeMercadoLibreSync.mockResolvedValue({ ok: true, summary })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is disabled until CRON_SECRET is configured', async () => {
    vi.stubEnv('CRON_SECRET', '')

    const res = await GET(request('Bearer cron-secret'))

    expect(res.status).toBe(503)
    expect(executeMercadoLibreSync).not.toHaveBeenCalled()
  })

  it('rejects requests without the Vercel cron bearer token', async () => {
    expect((await GET(request())).status).toBe(401)
    expect((await GET(request('Bearer wrong'))).status).toBe(401)
    expect(executeMercadoLibreSync).not.toHaveBeenCalled()
  })

  it('runs the sync and revalidates the storefront', async () => {
    const res = await GET(request('Bearer cron-secret'))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, summary })
    expect(executeMercadoLibreSync).toHaveBeenCalledTimes(1)
    expect(revalidateCatalogCache).toHaveBeenCalledTimes(1)
    expect(revalidateProductPages).toHaveBeenCalledTimes(1)
  })

  it('treats a missing connection as a no-op rather than a cron failure', async () => {
    executeMercadoLibreSync.mockResolvedValue({
      ok: false,
      code: 'not_connected',
      message: 'Mercado Libre no está conectado',
    })

    const res = await GET(request('Bearer cron-secret'))

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ success: false, code: 'not_connected' })
    expect(revalidateCatalogCache).not.toHaveBeenCalled()
  })

  it('surfaces Mercado Libre failures so the cron run is marked as failed', async () => {
    executeMercadoLibreSync.mockResolvedValue({
      ok: false,
      code: 'api_error',
      message: 'Mercado Libre respondió 500',
    })

    const res = await GET(request('Bearer cron-secret'))

    expect(res.status).toBe(502)
  })
})
