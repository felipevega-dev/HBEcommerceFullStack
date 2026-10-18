// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { auth, preferenceCreate, prisma, getRateLimitState, releaseExpiredStockReservations } =
  vi.hoisted(() => ({
    auth: vi.fn(),
    preferenceCreate: vi.fn(),
    getRateLimitState: vi.fn(),
    releaseExpiredStockReservations: vi.fn(),
    prisma: { order: { findUnique: vi.fn() } },
  }))

vi.mock('@/auth', () => ({ auth }))
vi.mock('@/lib/prisma', () => ({ prisma }))
vi.mock('@/lib/rate-limiter', () => ({
  getRateLimitState,
  getClientIp: () => '127.0.0.1',
}))
vi.mock('@/lib/order-lifecycle', () => ({ releaseExpiredStockReservations }))
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: class {},
  Preference: class {
    create = preferenceCreate
  },
}))

import { POST } from '../create-preference/route'
import { GUEST_ORDER_COOKIE, appendGuestOrder } from '@/lib/guest-orders'

const SITE_URL = 'http://localhost:3000'
const ORDER_ID = '0b6f8d7e-5c1a-4d3b-9e2f-1a2b3c4d5e6f'

const session = {
  user: { id: 'user-1', email: 'cliente@example.com', name: 'Cliente', role: 'USER' },
}

const payableOrder = {
  id: ORDER_ID,
  userId: 'user-1',
  amount: 25990,
  status: 'PENDING',
  payment: false,
  paymentStatus: 'PENDING',
  paymentMethod: 'mercadopago',
  stockReleasedAt: null as Date | null,
  stockReservationExpiresAt: new Date(Date.now() + 60 * 60 * 1000) as Date | null,
  items: [{ id: 'item-1' }, { id: 'item-2' }],
}

const validBody = {
  orderId: ORDER_ID,
  address: { firstname: 'Cliente', lastname: 'Prueba', street: 'Calle 1', city: 'Santiago' },
}

function request(
  body: unknown,
  { origin = SITE_URL, cookie }: { origin?: string | null; cookie?: string } = {},
) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (origin) headers.origin = origin
  if (cookie) headers.cookie = cookie

  return new NextRequest(`${SITE_URL}/api/mercadopago/create-preference`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/mercadopago/create-preference', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('MERCADOPAGO_ACCESS_TOKEN', 'test-access-token')
    vi.stubEnv('NEXT_PUBLIC_FRONTEND_URL', SITE_URL)
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret-with-at-least-32-characters')
    vi.spyOn(console, 'error').mockImplementation(() => {})

    auth.mockResolvedValue(session)
    getRateLimitState.mockResolvedValue({ allowed: true, remaining: 9, resetAt: Date.now() + 1000 })
    releaseExpiredStockReservations.mockResolvedValue(undefined)
    prisma.order.findUnique.mockResolvedValue(payableOrder)
    preferenceCreate.mockResolvedValue({
      id: 'pref-1',
      init_point: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=pref-1',
      sandbox_init_point: 'https://sandbox.mercadopago.cl/checkout/v1/redirect?pref_id=pref-1',
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('hides account orders from anonymous visitors', async () => {
    auth.mockResolvedValue(null)

    const res = await POST(request(validBody))

    expect(res.status).toBe(404)
    expect(preferenceCreate).not.toHaveBeenCalled()
  })

  describe('guest orders', () => {
    const guestOrder = { ...payableOrder, userId: null, customerEmail: 'invitado@example.com' }
    const guestCookie = () => `${GUEST_ORDER_COOKIE}=${appendGuestOrder(undefined, ORDER_ID)}`

    beforeEach(() => {
      auth.mockResolvedValue(null)
      prisma.order.findUnique.mockResolvedValue(guestOrder)
    })

    it('lets the browser that created the guest order pay for it', async () => {
      const res = await POST(
        request({ orderId: ORDER_ID, address: { firstname: 'Ana' } }, { cookie: guestCookie() }),
      )

      expect(res.status).toBe(200)
      expect(getRateLimitState).toHaveBeenCalledWith(
        'payments:create-preference:guest:127.0.0.1',
        10,
        10 * 60 * 1000,
      )
      expect(preferenceCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          payer: expect.objectContaining({ email: 'invitado@example.com' }),
          back_urls: expect.objectContaining({
            success: `${SITE_URL}/orders/${ORDER_ID}?payment=success`,
          }),
        }),
      })
    })

    it('rejects guest orders without the access cookie', async () => {
      const res = await POST(request(validBody))

      expect(res.status).toBe(404)
      expect(preferenceCreate).not.toHaveBeenCalled()
    })

    it('rejects a forged guest cookie', async () => {
      const res = await POST(
        request(validBody, { cookie: `${GUEST_ORDER_COOKIE}=${ORDER_ID}:forged-token` }),
      )

      expect(res.status).toBe(404)
    })

    it('does not let a signed-in customer pay a guest order from another browser', async () => {
      auth.mockResolvedValue(session)

      const res = await POST(request(validBody))

      expect(res.status).toBe(404)
    })
  })

  it('rejects requests without a trusted origin', async () => {
    const res = await POST(request(validBody, { origin: null }))

    expect(res.status).toBe(403)
    expect(preferenceCreate).not.toHaveBeenCalled()
  })

  it('rejects requests from another origin', async () => {
    const res = await POST(request(validBody, { origin: 'https://evil.example.com' }))

    expect(res.status).toBe(403)
  })

  it('applies the per-user rate limit', async () => {
    getRateLimitState.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    })

    const res = await POST(request(validBody))

    expect(res.status).toBe(429)
    expect(getRateLimitState).toHaveBeenCalledWith(
      'payments:create-preference:user-1',
      10,
      10 * 60 * 1000,
    )
    expect(prisma.order.findUnique).not.toHaveBeenCalled()
  })

  it('validates the request body', async () => {
    const res = await POST(request({ orderId: 'not-a-uuid', address: { firstname: 'X' } }))

    expect(res.status).toBe(400)
    expect(prisma.order.findUnique).not.toHaveBeenCalled()
  })

  it('fails when MercadoPago is not configured', async () => {
    vi.stubEnv('MERCADOPAGO_ACCESS_TOKEN', '')

    const res = await POST(request(validBody))

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ success: false, message: 'MercadoPago no configurado' })
  })

  it('returns 404 when the order does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null)

    const res = await POST(request(validBody))

    expect(res.status).toBe(404)
    expect(preferenceCreate).not.toHaveBeenCalled()
  })

  it('returns 404 when the order belongs to another user', async () => {
    prisma.order.findUnique.mockResolvedValue({ ...payableOrder, userId: 'someone-else' })

    const res = await POST(request(validBody))

    expect(res.status).toBe(404)
    expect(preferenceCreate).not.toHaveBeenCalled()
  })

  it('refuses to create a preference for an order that is already paid', async () => {
    prisma.order.findUnique.mockResolvedValue({
      ...payableOrder,
      payment: true,
      paymentStatus: 'PAID',
    })

    const res = await POST(request(validBody))

    expect(res.status).toBe(400)
    expect(preferenceCreate).not.toHaveBeenCalled()
  })

  it('refuses when the stock reservation was released or the order was cancelled', async () => {
    prisma.order.findUnique.mockResolvedValue({ ...payableOrder, stockReleasedAt: new Date() })

    const res = await POST(request(validBody))

    expect(res.status).toBe(409)
    expect(preferenceCreate).not.toHaveBeenCalled()
  })

  it('refuses when the stock reservation already expired', async () => {
    prisma.order.findUnique.mockResolvedValue({
      ...payableOrder,
      stockReservationExpiresAt: new Date(Date.now() - 1000),
    })

    const res = await POST(request(validBody))

    expect(res.status).toBe(409)
    expect(preferenceCreate).not.toHaveBeenCalled()
  })

  it('refuses orders that were not created for MercadoPago', async () => {
    prisma.order.findUnique.mockResolvedValue({ ...payableOrder, paymentMethod: 'cash' })

    const res = await POST(request(validBody))

    expect(res.status).toBe(400)
    expect(preferenceCreate).not.toHaveBeenCalled()
  })

  it('creates a preference from the server-side order amount', async () => {
    const res = await POST(request(validBody))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      preferenceId: 'pref-1',
      initPoint: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=pref-1',
      sandboxInitPoint: 'https://sandbox.mercadopago.cl/checkout/v1/redirect?pref_id=pref-1',
    })
    expect(releaseExpiredStockReservations).toHaveBeenCalledTimes(1)
    expect(preferenceCreate).toHaveBeenCalledTimes(1)
    expect(preferenceCreate).toHaveBeenCalledWith({
      body: expect.objectContaining({
        items: [
          expect.objectContaining({
            id: ORDER_ID,
            quantity: 1,
            unit_price: 25990,
            currency_id: 'CLP',
            title: expect.stringContaining(ORDER_ID.slice(-8).toUpperCase()),
          }),
        ],
        payer: { name: 'Cliente', surname: 'Prueba', email: 'cliente@example.com' },
        back_urls: {
          success: `${SITE_URL}/orders/${ORDER_ID}?payment=success`,
          failure: `${SITE_URL}/checkout?payment=failure`,
          pending: `${SITE_URL}/orders/${ORDER_ID}?payment=pending`,
        },
        notification_url: `${SITE_URL}/api/mercadopago/webhook`,
        auto_return: 'approved',
        external_reference: ORDER_ID,
      }),
    })
  })

  it('prefers the email provided in the checkout address for the payer', async () => {
    await POST(
      request({ ...validBody, address: { ...validBody.address, email: 'otro@example.com' } }),
    )

    expect(preferenceCreate).toHaveBeenCalledWith({
      body: expect.objectContaining({
        payer: expect.objectContaining({ email: 'otro@example.com' }),
      }),
    })
  })

  it('keeps going when the expired reservation cleanup fails', async () => {
    releaseExpiredStockReservations.mockRejectedValue(new Error('db busy'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const res = await POST(request(validBody))

    expect(res.status).toBe(200)
    expect(preferenceCreate).toHaveBeenCalledTimes(1)
  })

  it('returns 500 when MercadoPago rejects the preference', async () => {
    preferenceCreate.mockRejectedValue(new Error('invalid credentials'))

    const res = await POST(request(validBody))

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ success: false, message: 'Error interno del servidor' })
  })
})
