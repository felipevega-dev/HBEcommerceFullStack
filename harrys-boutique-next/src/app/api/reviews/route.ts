import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAuth, getPagination, validateBody } from '@/lib/api-utils'

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(500),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    if (!productId)
      return NextResponse.json({ success: false, message: 'productId requerido' }, { status: 400 })

    const { page, limit, skip } = getPagination(searchParams)

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: { user: { select: { name: true, profileImage: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
    ])

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + reviews.length < total,
      },
    })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { data, error: validationError } = await validateBody(req, createReviewSchema)
  if (validationError) return validationError

  try {
    const { productId, rating, comment } = data!
    const userId = session!.user.id

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Ya has revisado este producto' },
        { status: 400 },
      )
    }

    const review = await prisma.review.create({
      data: { userId, productId, rating, comment },
      include: { user: { select: { name: true, profileImage: true } } },
    })

    // Update product rating
    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAverage: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating,
      },
    })

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
}
