import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAuth, validateBody } from '@/lib/api-utils'
import { findMatchingVariant, getAvailableStockForSelection } from '@/lib/product-variants'
import { resolveProductPurchaseChannel } from '@/lib/mercado-libre'

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

  const protectionError = await protectMutation(req, {
    keyPrefix: 'cart:merge',
    maxRequests: 20,
    windowMs: 5 * 60 * 1000,
    keySuffix: session!.user.id,
  })
  if (protectionError) return protectionError

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
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          stock: true,
          active: true,
          mercadoLibreUrl: true,
          mercadoLibreItemId: true,
          variants: { select: { id: true, size: true, color: true, stock: true, active: true } },
        },
      })

      if (!product?.active) continue
      if (resolveProductPurchaseChannel(product).type === 'mercadolibre') continue

      const variant = findMatchingVariant(product.variants, size, color)
      const availableStock = getAvailableStockForSelection(product, size, color)

      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId, size, color },
      })

      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, availableStock)
        if (nextQuantity <= 0) continue

        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: nextQuantity, variantId: variant?.id },
        })
      } else {
        if (quantity > availableStock) continue

        await prisma.cartItem.create({
          data: { cartId: cart.id, productId, variantId: variant?.id, quantity, size, color },
        })
      }
    }

    const mergedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { product: { mercadoLibreUrl: null } },
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

    return NextResponse.json({ success: true, cart: mergedCart })
  } catch (e) {
    return handleApiError(e)
  }
}
