import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAuth, validateBody } from '@/lib/api-utils'

const wishlistSchema = z.object({ productId: z.string().uuid() })

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session!.user.id },
      include: {
        product: {
          select: { id: true, name: true, price: true, images: true, ratingAverage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, wishlist })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { data, error: validationError } = await validateBody(req, wishlistSchema)
  if (validationError) return validationError

  try {
    const item = await prisma.wishlist.upsert({
      where: { userId_productId: { userId: session!.user.id, productId: data!.productId } },
      update: {},
      create: { userId: session!.user.id, productId: data!.productId },
    })
    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  if (!productId)
    return NextResponse.json({ success: false, message: 'productId requerido' }, { status: 400 })

  try {
    await prisma.wishlist.deleteMany({
      where: { userId: session!.user.id, productId },
    })
    return NextResponse.json({ success: true, message: 'Eliminado de favoritos' })
  } catch (e) {
    return handleApiError(e)
  }
}
