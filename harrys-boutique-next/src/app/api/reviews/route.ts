import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  getPagination,
  handleApiError,
  protectMutation,
  requireAuth,
  validateBody,
} from '@/lib/api-utils'

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
        where: { productId, approved: true },
        include: { user: { select: { name: true, profileImage: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId, approved: true } }),
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

  const protectionError = await protectMutation(req, {
    keyPrefix: 'reviews:create',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    keySuffix: session!.user.id,
  })
  if (protectionError) return protectionError

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

    const purchased = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        items: { some: { productId } },
      },
      select: { id: true },
    })

    if (!purchased) {
      return NextResponse.json(
        {
          success: false,
          message: 'Solo puedes reseñar productos de pedidos entregados',
        },
        { status: 403 },
      )
    }

    const review = await prisma.review.create({
      data: { userId, productId, rating, comment, approved: false },
      include: { user: { select: { name: true, profileImage: true } } },
    })

    return NextResponse.json(
      {
        success: true,
        review,
        message: 'Reseña recibida. Se publicará después de moderación.',
      },
      { status: 201 },
    )
  } catch (e) {
    return handleApiError(e)
  }
}
