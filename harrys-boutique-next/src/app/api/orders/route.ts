import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import type { Coupon } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  handleApiError,
  protectMutation,
  requireAuth,
  requireAdminAuth,
  getPagination,
  validateBody,
} from '@/lib/api-utils'
import {
  calculateCheckoutTotals,
  calculateSubtotal,
  resolveCheckoutItems,
  validateCouponForSubtotal,
} from '@/lib/checkout'
import { getPricingSettings, isCashOnDeliveryEnabled } from '@/lib/commerce-settings'
import { GUEST_ORDER_COOKIE, appendGuestOrder, guestOrderCookieOptions } from '@/lib/guest-orders'
import { getClientIp } from '@/lib/rate-limiter'
import {
  getStockReservationExpiresAt,
  releaseExpiredStockReservations,
  reserveCouponForOrder,
} from '@/lib/order-lifecycle'
import { resolveProductPurchaseChannel } from '@/lib/mercado-libre'
import { checkoutAddressSchema } from '@/lib/validations/checkout-address'

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().positive(),
  size: z.string(),
  color: z.string().optional(),
  image: z.string().optional(),
})

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  address: checkoutAddressSchema,
  paymentMethod: z.enum(['COD', 'mercadopago']),
  couponCode: z.string().optional(),
})

// GET — user orders or admin all orders
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const isAdmin = searchParams.get('admin') === 'true'

  if (isAdmin) {
    const { error, session } = await requireAdminAuth()
    if (error) return error

    const { page, limit, skip } = getPagination(searchParams)
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const paymentStatus = searchParams.get('paymentStatus')?.toUpperCase()

    const where = {
      ...(status && { status: status as never }),
      ...(paymentMethod && { paymentMethod }),
      ...(paymentStatus &&
        ['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(paymentStatus) && {
          paymentStatus: paymentStatus as never,
        }),
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { user: { select: { name: true, email: true } }, items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  }

  // User orders
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { page, limit, skip } = getPagination(searchParams)

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session!.user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId: session!.user.id } }),
  ])

  return NextResponse.json({
    success: true,
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const viewer = session?.user ?? null

  const protectionError = await protectMutation(req, {
    keyPrefix: 'orders:create',
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
    keySuffix: viewer?.id ?? `guest:${getClientIp(req)}`,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, createOrderSchema)
  if (validationError) return validationError

  try {
    await releaseExpiredStockReservations().catch((cleanupError) => {
      console.warn('[Orders POST] Failed to release expired reservations:', cleanupError)
    })

    const { items, address, paymentMethod, couponCode } = data!

    if (paymentMethod === 'COD') {
      if (!viewer) {
        return NextResponse.json(
          {
            success: false,
            code: 'COD_REQUIRES_ACCOUNT',
            message:
              'El pago contra entrega requiere una cuenta. Inicia sesión o paga con MercadoPago.',
          },
          { status: 403 },
        )
      }

      if (!(await isCashOnDeliveryEnabled())) {
        return NextResponse.json(
          {
            success: false,
            code: 'COD_DISABLED',
            message: 'El pago contra entrega no está disponible por ahora.',
          },
          { status: 400 },
        )
      }
    }

    const productIds = [...new Set(items.map((item) => item.productId))]
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        stock: true,
        active: true,
        colors: true,
        sizes: true,
        mercadoLibreUrl: true,
        mercadoLibreItemId: true,
        variants: {
          select: { id: true, size: true, color: true, stock: true, active: true },
        },
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, message: 'Uno de los productos ya no existe o no está disponible' },
        { status: 400 },
      )
    }

    const mercadoLibreProducts = products.filter(
      (product) => resolveProductPurchaseChannel(product).type === 'mercadolibre',
    )
    if (mercadoLibreProducts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          code: 'MERCADOLIBRE_ONLY',
          message: `Estos productos ahora se compran en Mercado Libre: ${mercadoLibreProducts
            .map((product) => product.name)
            .join(', ')}`,
        },
        { status: 409 },
      )
    }

    const resolvedItems = resolveCheckoutItems(items, products)
    const subtotal = calculateSubtotal(resolvedItems)
    const pricingSettings = await getPricingSettings()

    let appliedCouponId: string | undefined
    let appliedCouponCode: string | undefined
    let couponToApply: Coupon | null = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })

      if (coupon && validateCouponForSubtotal(coupon, subtotal)) {
        appliedCouponId = coupon.id
        appliedCouponCode = coupon.code
        couponToApply = coupon
      } else {
        return NextResponse.json(
          { success: false, message: 'El cupón no es válido para este pedido' },
          { status: 400 },
        )
      }
    }

    const totals = calculateCheckoutTotals(resolvedItems, couponToApply, pricingSettings)

    const order = await prisma.$transaction(async (tx) => {
      const now = new Date()
      const stockReservationExpiresAt = getStockReservationExpiresAt(paymentMethod, now)

      for (const item of resolvedItems) {
        if (item.variantId) {
          const variantUpdate = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              active: true,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          })

          if (variantUpdate.count !== 1) {
            throw new Error(`STOCK_INSUFFICIENT:${item.name}`)
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          const stockUpdate = await tx.product.updateMany({
            where: {
              id: item.productId,
              active: true,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          })

          if (stockUpdate.count !== 1) {
            throw new Error(`STOCK_INSUFFICIENT:${item.name}`)
          }
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: viewer?.id ?? null,
          customerEmail: address.email.trim().toLowerCase(),
          customerName: `${address.firstname} ${address.lastname ?? ''}`.trim(),
          amount: totals.total,
          addressSnapshot: address,
          paymentMethod,
          paymentStatus: 'PENDING',
          paymentProvider: paymentMethod === 'mercadopago' ? 'mercadopago' : 'cash_on_delivery',
          stockReservedAt: now,
          stockReservationExpiresAt,
          couponCode: appliedCouponCode,
          discountAmount: totals.discountAmount > 0 ? totals.discountAmount : undefined,
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              image: item.image,
            })),
          },
        },
        include: { items: true },
      })

      if (appliedCouponId) {
        await reserveCouponForOrder(tx, {
          couponId: appliedCouponId,
          userId: viewer?.id ?? null,
          orderId: createdOrder.id,
          amount: totals.discountAmount,
        })
      }

      if (paymentMethod === 'COD' && viewer) {
        await tx.cart.deleteMany({ where: { userId: viewer.id } })
      }

      return createdOrder
    })

    const response = NextResponse.json({ success: true, order, guest: !viewer }, { status: 201 })

    if (!viewer) {
      // Lets the guest open /orders/[id] (payment return page) from this browser.
      response.cookies.set({
        name: GUEST_ORDER_COOKIE,
        value: appendGuestOrder(req.cookies.get(GUEST_ORDER_COOKIE)?.value, order.id),
        ...guestOrderCookieOptions(),
      })
    }

    return response
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.startsWith('STOCK_INSUFFICIENT:')) {
        return NextResponse.json(
          {
            success: false,
            message: `Stock insuficiente para ${e.message.replace('STOCK_INSUFFICIENT:', '')}`,
          },
          { status: 409 },
        )
      }

      if (e.message === 'COUPON_EXHAUSTED') {
        return NextResponse.json(
          { success: false, message: 'El cupón ya alcanzó su límite de usos' },
          { status: 409 },
        )
      }
    }

    return handleApiError(e)
  }
}
