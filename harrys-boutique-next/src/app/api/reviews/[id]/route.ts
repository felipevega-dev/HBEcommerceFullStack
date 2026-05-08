import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'

const patchSchema = z.object({
  approved: z.boolean(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:reviews:update',
    maxRequests: 60,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, patchSchema)
  if (validationError) return validationError

  try {
    const { id } = await params
    const review = await prisma.review.update({
      where: { id },
      data: { approved: data!.approved },
    })

    // Update product rating stats
    const stats = await prisma.review.aggregate({
      where: { productId: review.productId, approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    })
    await prisma.product.update({
      where: { id: review.productId },
      data: {
        ratingAverage: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating,
      },
    })

    return NextResponse.json({ success: true, review })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:reviews:delete',
    maxRequests: 40,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const { id } = await params
    const review = await prisma.review.delete({ where: { id } })

    // Update product rating stats
    const stats = await prisma.review.aggregate({
      where: { productId: review.productId, approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    })
    await prisma.product.update({
      where: { id: review.productId },
      data: {
        ratingAverage: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating,
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
