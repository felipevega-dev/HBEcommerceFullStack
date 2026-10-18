// @vitest-environment node
import { createHmac } from 'node:crypto'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { paymentGet, sendEmail, prisma, tx } = vi.hoisted(() => ({
  paymentGet: vi.fn(),
  sendEmail: vi.fn(),
  prisma: {
    order: { findUnique: vi.fn(), updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
  tx: {
    order: { findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    product: { update: vi.fn() },
    productVariant: { update: vi.fn() },
    coupon: { findUnique: vi.fn(), updateMany: vi.fn() },
    couponRedemption: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
    orderStatusHistory: { create: vi.fn() },
    cart: { deleteMany: vi.fn() },
  },
}))

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ prisma }))
vi.mock('@/lib/email', () => ({ sendEmail }))
vi.mock('@/lib/email/templates/order-confirmation', () => ({ default: vi.fn(() => null) }))
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: class {},
  Payment: class {
    get = paymentGet
  },
}))

import { POST } from '../webhook/route'

const SECRET = 'webhook-test-secret'
const ORDER_ID = '0b6f8d7e-5c1a-4d3b-9e2f-1a2b3c4d5e6f'
const PAYMENT_ID = '123456789'

const baseOrder = {
  id: ORDER_ID,
  userId: 'user-1' as string | null,
  customerEmail: 'cliente@example.com' as string | null,
  customerName: 'Cliente' as string | null,
  amount: 25990,
  status: 'PENDING',
  payment: false,
  paymentStatus: 'PENDING',
  paymentMethod: 'mercadopago',
  paymentProvider: null,
  paymentProviderId: null,
  couponCode: null as string | null,
  discountAmount: 0,
  stockReleasedAt: null as Date | null,
  stockReservationExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
  addressSnapshot: { street: 'Calle Falsa 123', city: 'Santiago' },
  items: [
    { productId: 'prod-1', variantId: 'var-1', quantity: 2 },
    { productId: 'prod-2', variantId: null, quantity: 1 },
  ],
  couponRedemptions: [] as { id: string }[],
}

const orderWithDetails = {
  ...baseOrder,
  items: [
    { name: 'Polerón Thundercats', price: 12995, quantity: 2, size: 'M', image: '' },
    { name: 'Collar', price: 0, quantity: 1, size: 'U', image: '' },
  ],
  user: { email: 'cliente@example.com', name: 'Cliente' },
}

const approvedPayment = {
  id: Number(PAYMENT_ID),
  status: 'approved',
  external_reference: ORDER_ID,
  transaction_amount: 25990,
  currency_id: 'CLP',
}

type FindUniqueArgs = { include?: { user?: unknown } }

function primeMocks(order = baseOrder) {
  prisma.order.findUnique.mockImplementation(async (args?: FindUniqueArgs) =>
    args?.include?.user ? orderWithDetails : order,
  )
  prisma.order.updateMany.mockResolvedValue({ count: 1 })
  prisma.$transaction.mockImplementation(async (fn: (client: typeof tx) => unknown) => fn(tx))

  tx.order.findUnique.mockResolvedValue(order)
  tx.order.updateMany.mockResolvedValue({ count: 1 })
  tx.order.update.mockResolvedValue(order)
  tx.product.update.mockResolvedValue({})
  tx.productVariant.update.mockResolvedValue({})
  tx.coupon.findUnique.mockResolvedValue(null)
  tx.coupon.updateMany.mockResolvedValue({ count: 1 })
  tx.couponRedemption.findUnique.mockResolvedValue(null)
  tx.couponRedemption.update.mockResolvedValue({})
  tx.couponRedemption.create.mockResolvedValue({})
  tx.orderStatusHistory.create.mockResolvedValue({})
  tx.cart.deleteMany.mockResolvedValue({ count: 1 })

  paymentGet.mockResolvedValue(approvedPayment)
  sendEmail.mockResolvedValue({ success: true })
}

function signedRequest({
  dataId = PAYMENT_ID,
  body = { type: 'payment', data: { id: dataId } } as unknown,
  secret = SECRET,
  requestId = 'request-1',
}: { dataId?: string; body?: unknown; secret?: string; requestId?: string } = {}) {
  const ts = '1700000000'
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const v1 = createHmac('sha256', secret).update(manifest).digest('hex')

  return new NextRequest(`http://localhost:3000/api/mercadopago/webhook?data.id=${dataId}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature': `ts=${ts},v1=${v1}`,
      'x-request-id': requestId,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/mercadopago/webhook', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('MERCADOPAGO_WEBHOOK_SECRET', SECRET)
    vi.stubEnv('MERCADOPAGO_ACCESS_TOKEN', 'test-access-token')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    primeMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('acknowledges but ignores requests with an invalid signature', async () => {
    const res = await POST(signedRequest({ secret: 'wrong-secret' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })
    expect(paymentGet).not.toHaveBeenCalled()
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('ignores requests when the webhook secret is not configured', async () => {
    vi.stubEnv('MERCADOPAGO_WEBHOOK_SECRET', '')

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true })
    expect(paymentGet).not.toHaveBeenCalled()
  })

  it('ignores notifications that are not payments', async () => {
    const res = await POST(signedRequest({ body: { type: 'merchant_order', data: { id: '1' } } }))

    expect(await res.json()).toEqual({ received: true })
    expect(paymentGet).not.toHaveBeenCalled()
  })

  it('ignores payments whose order does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null)

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true })
    expect(paymentGet).toHaveBeenCalledWith({ id: PAYMENT_ID })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('marks the order as paid, clears the cart and emails the customer when approved', async () => {
    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, processed: true })
    expect(tx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ORDER_ID, payment: false, stockReleasedAt: null },
        data: expect.objectContaining({
          status: 'PROCESSING',
          payment: true,
          paymentStatus: 'PAID',
          paymentProvider: 'mercadopago',
          paymentProviderId: PAYMENT_ID,
          stockReservationExpiresAt: null,
        }),
      }),
    )
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ orderId: ORDER_ID, status: 'PROCESSING' }),
    })
    expect(tx.cart.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } })
    expect(tx.product.update).not.toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'cliente@example.com',
        subject: expect.stringContaining(ORDER_ID.slice(-8).toUpperCase()),
      }),
    )
  })

  it('reserves the coupon used by the order when the payment is approved', async () => {
    const order = { ...baseOrder, couponCode: 'HARRY10', discountAmount: 2599 }
    primeMocks(order)
    tx.coupon.findUnique.mockResolvedValue({ id: 'coupon-1', maxUses: 100 })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, processed: true })
    expect(tx.coupon.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'coupon-1', active: true }),
        data: { usedCount: { increment: 1 } },
      }),
    )
    expect(tx.couponRedemption.create).toHaveBeenCalledWith({
      data: { couponId: 'coupon-1', userId: 'user-1', orderId: ORDER_ID, amount: 2599 },
    })
  })

  it('does not process an approved payment twice', async () => {
    primeMocks({ ...baseOrder, payment: true, paymentStatus: 'PAID' })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, skipped: 'already_processed' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('refuses to mark the order as paid when the amount does not match', async () => {
    paymentGet.mockResolvedValue({ ...approvedPayment, transaction_amount: 1000 })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, skipped: 'amount_mismatch' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('refuses to mark the order as paid when the currency does not match', async () => {
    paymentGet.mockResolvedValue({ ...approvedPayment, currency_id: 'USD' })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, skipped: 'amount_mismatch' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('stores the provider reference for pending payments without touching stock', async () => {
    paymentGet.mockResolvedValue({ ...approvedPayment, status: 'in_process' })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true })
    expect(prisma.order.updateMany).toHaveBeenCalledWith({
      where: { id: ORDER_ID, payment: false },
      data: { paymentProvider: 'mercadopago', paymentProviderId: PAYMENT_ID },
    })
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('cancels the order and releases stock and coupon when the payment is rejected', async () => {
    paymentGet.mockResolvedValue({ ...approvedPayment, status: 'rejected' })
    tx.couponRedemption.findUnique.mockResolvedValue({
      id: 'redemption-1',
      couponId: 'coupon-1',
      orderId: ORDER_ID,
      releasedAt: null,
    })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, processed: true })
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { id: ORDER_ID, stockReleasedAt: null },
      data: expect.objectContaining({
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        paymentProvider: 'mercadopago',
        paymentProviderId: PAYMENT_ID,
        cancelReason: 'MercadoPago rejected',
        refundReason: null,
        stockReleasedAt: expect.any(Date),
      }),
    })
    expect(tx.productVariant.update).toHaveBeenCalledTimes(1)
    expect(tx.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'var-1' },
      data: { stock: { increment: 2 } },
    })
    expect(tx.product.update).toHaveBeenCalledTimes(2)
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: { increment: 2 } },
    })
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-2' },
      data: { stock: { increment: 1 } },
    })
    expect(tx.couponRedemption.update).toHaveBeenCalledWith({
      where: { orderId: ORDER_ID },
      data: { releasedAt: expect.any(Date), releaseReason: 'MercadoPago rejected' },
    })
    expect(tx.coupon.updateMany).toHaveBeenCalledWith({
      where: { id: 'coupon-1', usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    })
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ orderId: ORDER_ID, status: 'CANCELLED' }),
    })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('records refunds as REFUNDED while releasing the reservation', async () => {
    paymentGet.mockResolvedValue({ ...approvedPayment, status: 'refunded' })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, processed: true })
    expect(tx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CANCELLED',
          paymentStatus: 'REFUNDED',
          refundReason: 'MercadoPago refunded',
        }),
      }),
    )
  })

  it('does not release stock for a rejection when the order was already paid', async () => {
    paymentGet.mockResolvedValue({ ...approvedPayment, status: 'rejected' })
    tx.order.findUnique.mockResolvedValue({ ...baseOrder, payment: true })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, processed: false })
    expect(tx.order.updateMany).not.toHaveBeenCalled()
    expect(tx.product.update).not.toHaveBeenCalled()
  })

  it('does not release stock twice when the reservation was already released', async () => {
    paymentGet.mockResolvedValue({ ...approvedPayment, status: 'rejected' })
    tx.order.findUnique.mockResolvedValue({ ...baseOrder, stockReleasedAt: new Date() })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, processed: false })
    expect(tx.order.updateMany).not.toHaveBeenCalled()
    expect(tx.product.update).not.toHaveBeenCalled()
  })

  it('flags approved payments that arrive after the stock reservation was released', async () => {
    tx.order.findUnique.mockResolvedValue({ ...baseOrder, stockReleasedAt: new Date() })

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, skipped: 'already_processed' })
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: ORDER_ID },
      data: expect.objectContaining({
        payment: true,
        paymentStatus: 'PAID',
        paymentProviderId: PAYMENT_ID,
        refundReason: expect.stringContaining('revisar manualmente'),
      }),
    })
    expect(tx.order.updateMany).not.toHaveBeenCalled()
    expect(tx.cart.deleteMany).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('confirms guest orders, emails the checkout address and links the order with a token', async () => {
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret-with-at-least-32-characters')
    vi.stubEnv('NEXT_PUBLIC_FRONTEND_URL', 'https://harrys.test')
    const guestOrder = {
      ...baseOrder,
      userId: null,
      customerEmail: 'invitado@example.com',
      customerName: 'Ana Invitada',
    }
    primeMocks(guestOrder)
    prisma.order.findUnique.mockImplementation(async (args?: FindUniqueArgs) =>
      args?.include?.user ? { ...orderWithDetails, ...guestOrder, user: null } : guestOrder,
    )

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, processed: true })
    expect(tx.cart.deleteMany).not.toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'invitado@example.com' }))

    const { default: OrderConfirmation } = await import('@/lib/email/templates/order-confirmation')
    const props = vi.mocked(OrderConfirmation).mock.calls[0][0] as {
      customerName: string
      orderUrl: string
    }
    expect(props.customerName).toBe('Ana Invitada')
    const orderUrl = new URL(props.orderUrl)
    expect(orderUrl.origin + orderUrl.pathname).toBe('https://harrys.test/orders/' + ORDER_ID)
    expect(orderUrl.searchParams.get('token')).toMatch(/^[A-Za-z0-9_-]{20,}$/)
  })

  it('still confirms the order when the confirmation email fails', async () => {
    sendEmail.mockRejectedValue(new Error('resend down'))

    const res = await POST(signedRequest())

    expect(await res.json()).toEqual({ received: true, processed: true })
    expect(tx.order.updateMany).toHaveBeenCalledTimes(1)
  })

  it('returns 500 so MercadoPago retries when the payment lookup fails', async () => {
    paymentGet.mockRejectedValue(new Error('MercadoPago unavailable'))

    const res = await POST(signedRequest())

    expect(res.status).toBe(500)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})
