import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { DiscountType } from '@prisma/client'

const createCouponSchema = z.object({
  code: z.string().min(3).max(20).transform((val) => val.toUpperCase()),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().positive().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
})

export async function GET() {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ success: true, coupons })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const { data, error: validationError } = await validateBody(req, createCouponSchema)
  if (validationError) return validationError

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data!.code,
        discountType: data!.discountType,
        discountValue: data!.discountValue,
        minOrderAmount: data!.minOrderAmount ?? null,
        maxUses: data!.maxUses ?? null,
        expiresAt: data!.expiresAt ? new Date(data!.expiresAt) : null,
      },
    })
    return NextResponse.json({ success: true, coupon }, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
}
