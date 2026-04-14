import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAuth, validateBody } from '@/lib/api-utils'

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  size: z.string().min(1),
  color: z.string().optional(),
})

const updateItemSchema = z.object({
  cartItemId: z.string().uuid(),
  quantity: z.number().int().min(0),
})

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session!.user.id },
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
    return NextResponse.json({ success: true, cart: cart ?? { items: [] } })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { data, error: validationError } = await validateBody(req, addItemSchema)
  if (validationError) return validationError

  try {
    const userId = session!.user.id
    const { productId, quantity, size, color = '' } = data!

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    // Check if item already exists
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

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, price: true, images: true } } },
        },
      },
    })

    return NextResponse.json({ success: true, cart: updatedCart })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { data, error: validationError } = await validateBody(req, updateItemSchema)
  if (validationError) return validationError

  try {
    const { cartItemId, quantity } = data!

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } })
    } else {
      await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session!.user.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, price: true, images: true } } },
        },
      },
    })

    return NextResponse.json({ success: true, cart })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  try {
    await prisma.cart.deleteMany({ where: { userId: session!.user.id } })
    return NextResponse.json({ success: true, message: 'Carrito vaciado' })
  } catch (e) {
    return handleApiError(e)
  }
}
