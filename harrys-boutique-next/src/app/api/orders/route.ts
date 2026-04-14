import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  handleApiError,
  requireAuth,
  requireAdminAuth,
  getPagination,
  validateBody,
} from '@/lib/api-utils'

const addressSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
})

const orderItemSchema = z.object({
  productId: z.string().uuid().optional(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  size: z.string(),
  color: z.string().optional(),
  image: z.string().optional(),
})

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  address: addressSchema,
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

    const where = {
      ...(status && { status: status as never }),
      ...(paymentMethod && { paymentMethod }),
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
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { data, error: validationError } = await validateBody(req, createOrderSchema)
  if (validationError) return validationError

  try {
    const { items, address, paymentMethod, couponCode } = data!

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingFee = 10
    let discountAmount = 0

    // Validate coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (coupon && coupon.active) {
        const now = new Date()
        const notExpired = !coupon.expiresAt || coupon.expiresAt > now
        const notExceeded = !coupon.maxUses || coupon.usedCount < coupon.maxUses
        const meetsMinimum = !coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount)

        if (notExpired && notExceeded && meetsMinimum) {
          discountAmount =
            coupon.discountType === 'PERCENTAGE'
              ? Math.floor((subtotal * Number(coupon.discountValue)) / 100)
              : Number(coupon.discountValue)

          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          })
        }
      }
    }

    const amount = subtotal + shippingFee - discountAmount

    const order = await prisma.order.create({
      data: {
        userId: session!.user.id,
        amount,
        addressSnapshot: address,
        paymentMethod,
        couponCode: couponCode?.toUpperCase(),
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color ?? '',
            image: item.image ?? '',
          })),
        },
      },
      include: { items: true },
    })

    // Clear cart after COD order
    if (paymentMethod === 'COD') {
      await prisma.cart.deleteMany({ where: { userId: session!.user.id } })
    }

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
}
