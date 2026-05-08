import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'

const updateSchema = z.object({
  active: z.boolean().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:coupons:update',
    maxRequests: 30,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, updateSchema)
  if (validationError) return validationError

  try {
    const { id } = await params
    const updateData: any = {}

    if (data!.active !== undefined) updateData.active = data!.active
    if (data!.maxUses !== undefined) updateData.maxUses = data!.maxUses
    if (data!.expiresAt !== undefined) {
      updateData.expiresAt = data!.expiresAt ? new Date(data!.expiresAt) : null
    }

    const coupon = await prisma.coupon.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, coupon })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:coupons:delete',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const { id } = await params
    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
