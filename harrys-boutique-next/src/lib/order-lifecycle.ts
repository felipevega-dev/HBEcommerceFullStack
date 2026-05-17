import type { Order, OrderItem, Prisma } from '@prisma/client'

type Tx = Prisma.TransactionClient

type OrderItemForStock = Pick<OrderItem, 'productId' | 'variantId' | 'quantity'>

type OrderForStockRelease = Pick<Order, 'id' | 'stockReleasedAt'> & {
  items: OrderItemForStock[]
}

const DEFAULT_RESERVATION_MINUTES = 60

export function getStockReservationExpiresAt(paymentMethod: string, from = new Date()) {
  if (paymentMethod !== 'mercadopago') return null

  const minutes = Number(process.env.ORDER_STOCK_RESERVATION_MINUTES)
  const safeMinutes =
    Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_RESERVATION_MINUTES

  return new Date(from.getTime() + safeMinutes * 60 * 1000)
}

export async function releaseOrderStockReservation(
  tx: Tx,
  order: OrderForStockRelease,
  data: Prisma.OrderUpdateManyMutationInput = {},
) {
  if (order.stockReleasedAt) return false

  const releasedAt = new Date()
  const update = await tx.order.updateMany({
    where: { id: order.id, stockReleasedAt: null },
    data: {
      stockReleasedAt: releasedAt,
      ...data,
    },
  })

  if (update.count !== 1) return false

  for (const item of order.items) {
    if (!item.productId) continue

    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      })
    }

    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  }

  return true
}

export async function reserveCouponForOrder(
  tx: Tx,
  {
    couponId,
    userId,
    orderId,
    amount,
  }: {
    couponId: string
    userId: string
    orderId: string
    amount: number
  },
) {
  const coupon = await tx.coupon.findUnique({
    where: { id: couponId },
    select: { maxUses: true },
  })

  if (!coupon) throw new Error('COUPON_EXHAUSTED')

  const now = new Date()
  const couponUpdate = await tx.coupon.updateMany({
    where: {
      id: couponId,
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      ...(coupon.maxUses ? { usedCount: { lt: coupon.maxUses } } : {}),
    },
    data: { usedCount: { increment: 1 } },
  })

  if (couponUpdate.count !== 1) throw new Error('COUPON_EXHAUSTED')

  await tx.couponRedemption.create({
    data: {
      couponId,
      userId,
      orderId,
      amount,
    },
  })
}

export async function releaseCouponRedemption(tx: Tx, orderId: string, releaseReason: string) {
  const redemption = await tx.couponRedemption.findUnique({ where: { orderId } })
  if (!redemption || redemption.releasedAt) return false

  await tx.couponRedemption.update({
    where: { orderId },
    data: { releasedAt: new Date(), releaseReason },
  })

  await tx.coupon.updateMany({
    where: { id: redemption.couponId, usedCount: { gt: 0 } },
    data: { usedCount: { decrement: 1 } },
  })

  return true
}

export async function releaseExpiredStockReservations(limit = 25) {
  const now = new Date()
  const expiredOrders = await prismaSafeFindExpiredReservations(now, limit)

  for (const order of expiredOrders) {
    await prismaSafeReleaseExpiredReservation(order.id)
  }
}

async function prismaSafeFindExpiredReservations(now: Date, limit: number) {
  const { prisma } = await import('@/lib/prisma')

  return prisma.order.findMany({
    where: {
      paymentMethod: 'mercadopago',
      payment: false,
      paymentStatus: 'PENDING',
      stockReleasedAt: null,
      stockReservationExpiresAt: { lt: now },
    },
    include: { items: true },
    orderBy: { stockReservationExpiresAt: 'asc' },
    take: limit,
  })
}

async function prismaSafeReleaseExpiredReservation(orderId: string) {
  const { prisma } = await import('@/lib/prisma')

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order || order.payment || order.paymentStatus !== 'PENDING') return

    const released = await releaseOrderStockReservation(tx, order, {
      status: 'CANCELLED',
      paymentStatus: 'FAILED',
      cancelReason: 'Reserva expirada sin pago confirmado',
    })

    if (released) {
      await releaseCouponRedemption(tx, order.id, 'Reserva expirada sin pago confirmado')
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          status: 'CANCELLED',
          note: 'Reserva expirada sin pago confirmado',
        },
      })
    }
  })
}
