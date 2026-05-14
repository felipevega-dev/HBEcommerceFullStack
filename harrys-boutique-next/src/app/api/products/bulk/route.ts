import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidateCatalogCache } from '@/lib/cache'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { generateSlug } from '@/lib/utils'

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  active: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
  price: z.number().positive().optional(),
  categoryId: z.string().uuid().optional(),
  subCategory: z.string().min(1).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  delete: z.boolean().optional(),
})

const bulkCreateSchema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        seoTitle: z.string().trim().max(70).optional(),
        seoDescription: z.string().trim().max(160).optional(),
        price: z.number().positive(),
        originalPrice: z.number().positive().optional(),
        images: z.array(z.string().url()).min(1).max(4),
        categoryId: z.string().uuid(),
        subCategory: z.string().min(1),
        colors: z.array(z.string().min(1)).min(1).optional(),
        sizes: z.array(z.string().min(1)).min(1).optional(),
        sku: z.string().trim().min(1).optional(),
        stock: z.number().int().min(0).optional(),
        active: z.boolean().optional(),
        bestSeller: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(500),
})

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:products:bulk-create',
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, bulkCreateSchema)
  if (validationError) return validationError

  try {
    const created = await prisma.$transaction(async (tx) => {
      const products = []
      const skuValues = data!.products.flatMap((item) => (item.sku ? [item.sku] : []))

      if (new Set(skuValues).size !== skuValues.length) {
        throw new Error('DUPLICATE_SKU_IN_IMPORT')
      }

      if (skuValues.length > 0) {
        const existingSkus = await tx.product.findMany({
          where: { sku: { in: skuValues } },
          select: { sku: true },
        })

        if (existingSkus.length > 0) {
          throw new Error(`SKU_ALREADY_EXISTS:${existingSkus.map((item) => item.sku).join(', ')}`)
        }
      }

      for (const item of data!.products) {
        const baseSlug = generateSlug(item.name)
        const existing = await tx.product.findFirst({ where: { slug: { startsWith: baseSlug } } })
        const slug = existing
          ? `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
          : baseSlug

        const product = await tx.product.create({
          data: {
            name: item.name,
            description: item.description,
            seoTitle: item.seoTitle,
            seoDescription: item.seoDescription,
            price: item.price,
            originalPrice: item.originalPrice,
            images: item.images,
            categoryId: item.categoryId,
            subCategory: item.subCategory,
            colors: item.colors ?? ['Unico'],
            sizes: item.sizes ?? ['UNICA'],
            sku: item.sku,
            stock: item.stock ?? 0,
            active: item.active ?? true,
            bestSeller: item.bestSeller ?? false,
            slug,
          },
        })

        products.push(product)
      }

      return products
    })

    revalidateCatalogCache()
    return NextResponse.json(
      { success: true, created: created.length, products: created },
      { status: 201 },
    )
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'DUPLICATE_SKU_IN_IMPORT') {
        return NextResponse.json(
          { success: false, message: 'El CSV contiene SKUs repetidos' },
          { status: 409 },
        )
      }

      if (e.message.startsWith('SKU_ALREADY_EXISTS:')) {
        return NextResponse.json(
          {
            success: false,
            message: `Ya existen productos con estos SKUs: ${e.message.replace('SKU_ALREADY_EXISTS:', '')}`,
          },
          { status: 409 },
        )
      }
    }

    return handleApiError(e)
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:products:bulk-update',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, bulkUpdateSchema)
  if (validationError) return validationError

  try {
    const {
      ids,
      active,
      bestSeller,
      stock,
      price,
      categoryId,
      subCategory,
      discountPercent,
      delete: shouldDelete,
    } = data!

    if (shouldDelete) {
      const result = await prisma.product.deleteMany({ where: { id: { in: ids } } })
      revalidateCatalogCache()

      return NextResponse.json({
        success: true,
        updated: result.count,
        message: `${result.count} productos eliminados`,
      })
    }

    // Build update data
    const updateData: any = {}

    if (active !== undefined) updateData.active = active
    if (bestSeller !== undefined) updateData.bestSeller = bestSeller
    if (stock !== undefined) updateData.stock = stock
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (subCategory !== undefined) updateData.subCategory = subCategory

    // Handle price updates
    if (price !== undefined) {
      updateData.price = price
    }

    // Handle discount application
    if (discountPercent !== undefined) {
      // Get current products to calculate new prices
      const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, price: true },
      })

      // Update each product with discounted price
      const updatePromises = products.map((product) => {
        const currentPrice = Number(product.price)
        const discountedPrice = currentPrice * (1 - discountPercent / 100)

        return prisma.product.update({
          where: { id: product.id },
          data: {
            originalPrice: currentPrice,
            price: discountedPrice,
          },
        })
      })

      await Promise.all(updatePromises)
      revalidateCatalogCache()

      return NextResponse.json({
        success: true,
        updated: products.length,
        message: `Descuento del ${discountPercent}% aplicado a ${products.length} productos`,
      })
    }

    // Standard bulk update
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    })
    revalidateCatalogCache()

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `${result.count} productos actualizados`,
    })
  } catch (e) {
    return handleApiError(e)
  }
}
