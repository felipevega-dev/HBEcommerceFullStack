// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  auth,
  prisma,
  tx,
  getRateLimitState,
  getPricingSettings,
  isCashOnDeliveryEnabled,
  releaseExpiredStockReservations,
  reserveCouponForOrder,
} = vi.hoisted(() => ({
  auth: vi.fn(),
  getRateLimitState: vi.fn(),
  getPricingSettings: vi.fn(),
  isCashOnDeliveryEnabled: vi.fn(),
  releaseExpiredStockReservations: vi.fn(),
  reserveCouponForOrder: vi.fn(),
  prisma: {
    product: { findMany: vi.fn() },
    coupon: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
  tx: {
    product: { updateMany: vi.fn(), update: vi.fn() },
    productVariant: { updateMany: vi.fn() },
    order: { create: vi.fn() },
    cart: { deleteMany: vi.fn() },
  },
}))

vi.mock('@/auth', () => ({ auth }))
vi.mock('@/lib/prisma', () => ({ prisma }))
vi.mock('@/lib/rate-limiter', () => ({
  getRateLimitState,
  getClientIp: () => '203.0.113.7',
}))
vi.mock('@/lib/commerce-settings', () => ({ getPricingSettings, isCashOnDeliveryEnabled }))
vi.mock('@/lib/order-lifecycle', () => ({
  releaseExpiredStockReservations,
  reserveCouponForOrder,
  getStockReservationExpiresAt: (method: string) =>
    method === 'mercadopago' ? new Date(Date.now() + 60 * 60 * 1000) : null,
}))

import { POST } from '../route'
import { GUEST_ORDER_COOKIE, parseGuestOrderCookie } from '@/lib/guest-orders'

const SITE_URL = 'http://localhost:3000'
const PRODUCT_ID = '5f0c2a4e-8d1b-4c3a-9e7f-112233445566'
const ORDER_ID = '0b6f8d7e-5c1a-4d3b-9e2f-1a2b3c4d5e6f'

const product = {
  id: PRODUCT_ID,
  name: 'Polerón bordado',
  price: 19990,
  images: ['https://example.com/poleron.jpg'],
  stock: 4,
  active: true,
  colors: [],
  sizes: ['M'],
  mercadoLibreUrl: null,
  mercadoLibreItemId: null,
  variants: [],
}

const address = {
  firstname: 'Ana',
  lastname: 'Invitada',
  email: 'Ana.Invitada@Example.COM',
  phone: '+56912345678',
  street: 'Calle 1',
  city: 'Arica',
  region: 'Arica y Parinacota',
  postalCode: '1000000',
  country: 'Chile',
}

const session = {
  user: { id: 'user-1', email: 'cliente@example.com', name: 'Cliente', role: 'USER' },
}

function request(paymentMethod: 'mercadopago' | 'COD') {
  return new NextRequest(`${SITE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: SITE_URL },
    body: JSON.stringify({
      items: [{ productId: PRODUCT_ID, quantity: 1, size: 'M' }],
      address,
      paymentMethod,
    }),
  })
}

describe('POST /api/orders', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('NEXT_PUBLIC_FRONTEND_URL', SITE_URL)
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret-with-at-least-32-characters')
    vi.spyOn(console, 'error').mockImplementation(() => {})

    auth.mockResolvedValue(null)
    getRateLimitState.mockResolvedValue({ allowed: true, remaining: 9, resetAt: Date.now() + 1000 })
    getPricingSettings.mockResolvedValue({ shippingFee: 3990, freeShippingThreshold: 50000 })
    isCashOnDeliveryEnabled.mockResolvedValue(true)
    releaseExpiredStockReservations.mockResolvedValue(undefined)
    prisma.product.findMany.mockResolvedValue([product])
    prisma.$transaction.mockImplementation(async (fn: (client: typeof tx) => unknown) => fn(tx))
    tx.product.updateMany.mockResolvedValue({ count: 1 })
    tx.order.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: ORDER_ID,
      ...data,
      items: [],
    }))
    tx.cart.deleteMany.mockResolvedValue({ count: 1 })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('lets guests create MercadoPago orders and remembers them in a signed cookie', async () => {
    const res = await POST(request('mercadopago'))

    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ success: true, guest: true, order: { id: ORDER_ID } })
    expect(getRateLimitState).toHaveBeenCalledWith('orders:create:guest:203.0.113.7', 10, 600000)

    const created = tx.order.create.mock.calls[0][0] as { data: Record<string, unknown> }
    expect(created.data).toMatchObject({
      userId: null,
      customerEmail: 'ana.invitada@example.com',
      customerName: 'Ana Invitada',
      amount: 19990 + 3990,
      paymentMethod: 'mercadopago',
    })
    expect(tx.cart.deleteMany).not.toHaveBeenCalled()

    const cookie = res.cookies.get(GUEST_ORDER_COOKIE)
    expect(cookie?.httpOnly).toBe(true)
    expect(parseGuestOrderCookie(cookie?.value)).toEqual([ORDER_ID])
  })

  it('requires an account for cash on delivery', async () => {
    const res = await POST(request('COD'))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ code: 'COD_REQUIRES_ACCOUNT' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('rejects cash on delivery when the store disabled it', async () => {
    auth.mockResolvedValue(session)
    isCashOnDeliveryEnabled.mockResolvedValue(false)

    const res = await POST(request('COD'))

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ code: 'COD_DISABLED' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('links orders to the signed-in customer without setting the guest cookie', async () => {
    auth.mockResolvedValue(session)

    const res = await POST(request('COD'))

    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ guest: false })
    expect(getRateLimitState).toHaveBeenCalledWith('orders:create:user-1', 10, 600000)
    expect(tx.order.create.mock.calls[0][0]).toMatchObject({
      data: { userId: 'user-1', customerEmail: 'ana.invitada@example.com' },
    })
    expect(tx.cart.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } })
    expect(res.cookies.get(GUEST_ORDER_COOKIE)).toBeUndefined()
  })

  it('still refuses Mercado Libre products for guests', async () => {
    prisma.product.findMany.mockResolvedValue([
      {
        ...product,
        mercadoLibreUrl: 'https://articulo.mercadolibre.cl/MLC-4144018020-collar-bordado-_JM',
      },
    ])

    const res = await POST(request('mercadopago'))

    expect(res.status).toBe(409)
    expect(await res.json()).toMatchObject({ code: 'MERCADOLIBRE_ONLY' })
  })
})
