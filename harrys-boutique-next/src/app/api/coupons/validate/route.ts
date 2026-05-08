import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, validateBody } from '@/lib/api-utils'
import { calculateDiscountAmount, calculateShippingForSubtotal } from '@/lib/checkout'
import { getPricingSettings } from '@/lib/commerce-settings'

const validateSchema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().positive(),
})

export async function POST(req: NextRequest) {
  const protectionError = await protectMutation(req, {
    keyPrefix: 'coupons:validate',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error } = await validateBody(req, validateSchema)
  if (error) return error

  try {
    const { code, orderAmount } = data!
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

    if (!coupon || !coupon.active) {
      return NextResponse.json({ valid: false, reason: 'Cupón inválido o expirado' })
    }

    const now = new Date()
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json({ valid: false, reason: 'El cupón ha expirado' })
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, reason: 'El cupón ha alcanzado su límite de usos' })
    }
    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        valid: false,
        reason: `Monto mínimo de orden: $${coupon.minOrderAmount}`,
      })
    }

    const pricingSettings = await getPricingSettings()
    const discountAmount = calculateDiscountAmount(
      coupon,
      orderAmount,
      calculateShippingForSubtotal(orderAmount, pricingSettings),
    )

    return NextResponse.json({
      valid: true,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount,
    })
  } catch (e) {
    return handleApiError(e)
  }
}
