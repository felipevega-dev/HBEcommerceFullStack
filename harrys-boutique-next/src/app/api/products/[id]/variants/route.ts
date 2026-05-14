import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidateCatalogCache } from '@/lib/cache'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { buildDefaultVariants, syncProductVariantStock } from '@/lib/product-variants'

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().trim().min(1),
  color: z.string().trim().optional(),
  stock: z.number().int().min(0),
  sku: z.string().trim().min(1).nullable().optional(),
  active: z.boolean().optional(),
})

const variantsBodySchema = z.object({
  variants: z.array(variantSchema).min(1).max(200),
})

function getSizes(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        stock: true,
        sizes: true,
        colors: true,
        variants: { orderBy: [{ size: 'asc' }, { color: 'asc' }] },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        stock: product.stock,
        variants:
          product.variants.length > 0
            ? product.variants
            : buildDefaultVariants(getSizes(product.sizes), product.colors, product.stock),
      },
    })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:products:variants',
    maxRequests: 40,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, variantsBodySchema)
  if (validationError) return validationError

  try {
    const { id } = await params
    const duplicateKeys = new Set<string>()
    for (const variant of data!.variants) {
      const key = `${variant.size.trim()}::${variant.color?.trim() ?? ''}`
      if (duplicateKeys.has(key)) {
        return NextResponse.json(
          { success: false, message: 'Hay variantes repetidas por talla/color' },
          { status: 409 },
        )
      }
      duplicateKeys.add(key)
    }

    await prisma.$transaction(async (tx) => {
      await syncProductVariantStock(tx, id, data!.variants)
    })

    revalidateCatalogCache()
    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
