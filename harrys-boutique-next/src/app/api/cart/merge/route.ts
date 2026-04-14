import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAuth, validateBody } from '@/lib/api-utils'

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  size: z.string().min(1),
  color: z.string().optional(),
})

const mergeBodySchema = z.object({
  items: z.array(cartItemSchema),
})

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { data, error: validationError } = await validateBody(req, mergeBodySchema)
  if (validationError) return validationError

  try {
    const userId = session!.user.id

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    for (const item of data!.items) {
      const { productId, quantity, size, color = '' } = item

      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId, size },
      })

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        })
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity, size, color },
        })
      }
    }

    const mergedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                colors: true,
                sizes: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, cart: mergedCart })
  } catch (e) {
    return handleApiError(e)
  }
}
