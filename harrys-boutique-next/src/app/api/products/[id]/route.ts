import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidateCatalogCache } from '@/lib/cache'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { generateSlug } from '@/lib/utils'
import { getMercadoLibreValidationError, MERCADO_LIBRE_LISTING_STATUSES } from '@/lib/mercado-libre'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  seoTitle: z.string().trim().max(70).nullable().optional(),
  seoDescription: z.string().trim().max(160).nullable().optional(),
  mercadoLibreUrl: z.string().url().nullable().optional(),
  mercadoLibreItemId: z
    .string()
    .trim()
    .regex(/^MLC\d+$/i)
    .nullable()
    .optional(),
  mercadoLibreStatus: z.enum(MERCADO_LIBRE_LISTING_STATUSES).optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().nullable().optional(),
  images: z.array(z.string()).min(1).max(4).optional(),
  categoryId: z.string().uuid().optional(),
  subCategory: z.string().min(1).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  bestSeller: z.boolean().optional(),
  active: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: { include: { user: { select: { name: true, profileImage: true } } } },
      },
    })
    if (!product)
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 },
      )
    return NextResponse.json({ success: true, product })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:products:update',
    maxRequests: 60,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, updateProductSchema)
  if (validationError) return validationError

  try {
    const { id } = await params
    const current = await prisma.product.findUnique({
      where: { id },
      select: { mercadoLibreUrl: true, mercadoLibreItemId: true, mercadoLibreStatus: true },
    })
    if (!current) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 },
      )
    }
    const mercadoLibreError = getMercadoLibreValidationError({ ...current, ...data! })
    if (mercadoLibreError) {
      return NextResponse.json({ success: false, message: mercadoLibreError }, { status: 400 })
    }

    // If name changed, regenerate slug
    let slug: string | undefined
    if (data!.name) {
      const baseSlug = generateSlug(data!.name)
      const existing = await prisma.product.findFirst({
        where: { slug: { startsWith: baseSlug }, NOT: { id } },
      })
      slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug
    }
    const product = await prisma.product.update({
      where: { id },
      data: { ...data!, ...(slug ? { slug } : {}) },
    })
    revalidateCatalogCache()
    return NextResponse.json({ success: true, product })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:products:delete',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    revalidateCatalogCache()
    return NextResponse.json({ success: true, message: 'Producto eliminado' })
  } catch (e) {
    return handleApiError(e)
  }
}
