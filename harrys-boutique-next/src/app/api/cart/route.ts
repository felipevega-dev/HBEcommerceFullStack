import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAuth, validateBody } from '@/lib/api-utils'
import { findMatchingVariant, getAvailableStockForSelection } from '@/lib/product-variants'

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
                variants: {
                  select: { id: true, size: true, color: true, stock: true, active: true },
                },
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

  const protectionError = await protectMutation(req, {
    keyPrefix: 'cart:mutate',
    maxRequests: 60,
    windowMs: 5 * 60 * 1000,
    keySuffix: session!.user.id,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, addItemSchema)
  if (validationError) return validationError

  try {
    const userId = session!.user.id
    const { productId, quantity, size, color = '' } = data!
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stock: true,
        active: true,
        variants: { select: { id: true, size: true, color: true, stock: true, active: true } },
      },
    })

    if (!product?.active) {
      return NextResponse.json(
        { success: false, message: 'Producto no disponible' },
        { status: 400 },
      )
    }

    const variant = findMatchingVariant(product.variants, size, color)
    const availableStock = getAvailableStockForSelection(product, size, color)

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    // Check if item already exists
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, size, color },
    })

    if (existing) {
      if (existing.quantity + quantity > availableStock) {
        return NextResponse.json(
          { success: false, message: 'Stock insuficiente para esta talla/color' },
          { status: 409 },
        )
      }

      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity, variantId: variant?.id },
      })
    } else {
      if (quantity > availableStock) {
        return NextResponse.json(
          { success: false, message: 'Stock insuficiente para esta talla/color' },
          { status: 409 },
        )
      }

      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId: variant?.id, quantity, size, color },
      })
    }

    const updatedCart = await prisma.cart.findUnique({
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
                variants: {
                  select: { id: true, size: true, color: true, stock: true, active: true },
                },
              },
            },
          },
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

  const protectionError = await protectMutation(req, {
    keyPrefix: 'cart:mutate',
    maxRequests: 60,
    windowMs: 5 * 60 * 1000,
    keySuffix: session!.user.id,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, updateItemSchema)
  if (validationError) return validationError

  try {
    const userId = session!.user.id
    const { cartItemId, quantity } = data!

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cart: { userId } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
            active: true,
            variants: { select: { id: true, size: true, color: true, stock: true, active: true } },
          },
        },
      },
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: 'Item de carrito no encontrado' },
        { status: 404 },
      )
    }

    if (quantity > 0) {
      const availableStock = getAvailableStockForSelection(
        cartItem.product,
        cartItem.size,
        cartItem.color,
      )
      if (quantity > availableStock) {
        return NextResponse.json(
          { success: false, message: 'Stock insuficiente para esta talla/color' },
          { status: 409 },
        )
      }
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartItem.id } })
    } else {
      await prisma.cartItem.update({ where: { id: cartItem.id }, data: { quantity } })
    }

    const cart = await prisma.cart.findUnique({
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
                variants: {
                  select: { id: true, size: true, color: true, stock: true, active: true },
                },
              },
            },
          },
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

  const protectionError = await protectMutation(req, {
    keyPrefix: 'cart:mutate',
    maxRequests: 60,
    windowMs: 5 * 60 * 1000,
    keySuffix: session!.user.id,
  })
  if (protectionError) return protectionError

  try {
    await prisma.cart.deleteMany({ where: { userId: session!.user.id } })
    return NextResponse.json({ success: true, message: 'Carrito vaciado' })
  } catch (e) {
    return handleApiError(e)
  }
}
