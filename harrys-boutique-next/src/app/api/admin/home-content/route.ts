import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  slug: z.string().max(120).nullable().optional(),
  homeImage: z.string().url().nullable().optional(),
  homeDescription: z.string().max(240).nullable().optional(),
  homeHref: z.string().max(240).nullable().optional(),
  active: z.boolean().optional(),
  homeVisible: z.boolean(),
  homeOrder: z.number().int().min(0).max(9999),
})

const productSchema = z.object({
  productId: z.string().uuid(),
  section: z.string().min(1).max(40).default('FEATURED'),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(9999),
})

const instagramSchema = z.object({
  id: z.string().uuid(),
  instagramUrl: z.string().url(),
  altText: z.string().min(1).max(160),
  homeCaption: z.string().max(500).nullable().optional(),
  likes: z.number().int().min(0).nullable().optional(),
  homeVisible: z.boolean(),
  homeOrder: z.number().int().min(0).max(9999),
})

const categoryBlockSchema = z.object({
  categoryId: z.string().uuid(),
  mode: z.enum(['AUTO', 'MANUAL']),
  maxItems: z.number().int().min(1).max(24),
  visible: z.boolean(),
  order: z.number().int().min(0).max(9999),
  products: z
    .array(
      z.object({
        productId: z.string().uuid(),
        visible: z.boolean(),
        order: z.number().int().min(0).max(9999),
      }),
    )
    .max(100),
})

const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(120).optional(),
  subcategories: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  homeImage: z.string().url().nullable().optional(),
  homeDescription: z.string().max(240).nullable().optional(),
  homeHref: z.string().max(240).nullable().optional(),
  active: z.boolean().default(true),
  homeVisible: z.boolean().default(false),
  homeOrder: z.number().int().min(0).max(9999).default(0),
})

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('category'), data: categorySchema }),
  z.object({ action: z.literal('categories'), data: z.array(categorySchema).max(100) }),
  z.object({ action: z.literal('products'), data: z.array(productSchema).max(100) }),
  z.object({ action: z.literal('instagram'), data: instagramSchema }),
  z.object({ action: z.literal('categoryBlock'), data: categoryBlockSchema }),
  z.object({ action: z.literal('createCategory'), data: createCategorySchema }),
])

export async function PUT(request: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(request, {
    keyPrefix: 'admin:home-content:update',
    maxRequests: 60,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(request, requestSchema)
  if (validationError) return validationError

  try {
    if (data!.action === 'categories') {
      await prisma.$transaction(
        data!.data.map(({ id, ...categoryData }) =>
          prisma.category.update({ where: { id }, data: categoryData }),
        ),
      )
      return NextResponse.json({ success: true })
    }

    if (data!.action === 'category') {
      const { id, ...categoryData } = data!.data
      const category = await prisma.category.update({
        where: { id },
        data: categoryData,
      })
      return NextResponse.json({ success: true, category })
    }

    if (data!.action === 'products') {
      const visibleProducts = data!.data.filter((item) => item.visible)
      if (visibleProducts.length < 4) {
        return NextResponse.json(
          { message: 'Debes mantener al menos 4 productos destacados visibles' },
          { status: 400 },
        )
      }
      await prisma.$transaction(async (tx) => {
        await tx.homeProductSelection.deleteMany({ where: { section: 'FEATURED' } })
        if (data!.data.length > 0) {
          await tx.homeProductSelection.createMany({
            data: data!.data.map((item) => ({ ...item, section: 'FEATURED' })),
          })
        }
      })
      return NextResponse.json({ success: true })
    }

    if (data!.action === 'categoryBlock') {
      const blockData = data!.data
      const category = await prisma.category.findUnique({
        where: { id: blockData.categoryId },
        select: { id: true },
      })
      if (!category) {
        return NextResponse.json({ message: 'Categoría no encontrada' }, { status: 404 })
      }

      const productIds = blockData.products.map((item) => item.productId)
      const products = productIds.length
        ? await prisma.product.findMany({
            where: { id: { in: productIds }, active: true, categoryId: blockData.categoryId },
            select: { id: true },
          })
        : []
      if (products.length !== new Set(productIds).size) {
        return NextResponse.json(
          { message: 'Solo puedes seleccionar productos activos de esta categoría' },
          { status: 400 },
        )
      }

      await prisma.$transaction(async (tx) => {
        const block = await tx.homeCategoryBlock.upsert({
          where: { categoryId: blockData.categoryId },
          create: {
            categoryId: blockData.categoryId,
            mode: blockData.mode,
            maxItems: blockData.maxItems,
            visible: blockData.visible,
            order: blockData.order,
          },
          update: {
            mode: blockData.mode,
            maxItems: blockData.maxItems,
            visible: blockData.visible,
            order: blockData.order,
          },
        })
        await tx.homeCategoryProduct.deleteMany({ where: { blockId: block.id } })
        if (blockData.mode === 'MANUAL' && blockData.products.length > 0) {
          await tx.homeCategoryProduct.createMany({
            data: blockData.products.map((item) => ({ ...item, blockId: block.id })),
          })
        }
      })
      return NextResponse.json({ success: true })
    }

    if (data!.action === 'createCategory') {
      const category = await prisma.category.create({ data: data!.data })
      return NextResponse.json({ success: true, category }, { status: 201 })
    }

    const { id, ...instagramData } = data!.data
    const instagram = await prisma.instagramPost.update({
      where: { id },
      data: instagramData,
    })
    return NextResponse.json({ success: true, instagram })
  } catch (apiError) {
    return handleApiError(apiError)
  }
}
