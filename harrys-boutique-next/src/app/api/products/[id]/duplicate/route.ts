import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAdminAuth } from '@/lib/api-utils'
import { revalidateCatalogCache } from '@/lib/cache'
import { generateSlug } from '@/lib/utils'

async function buildUniqueSlug(name: string) {
  const baseSlug = generateSlug(name)

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? '' : `-${Date.now().toString(36)}-${attempt}`
    const slug = `${baseSlug}${suffix}`
    const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) return slug
  }

  return `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:products:duplicate',
    maxRequests: 40,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const { id } = await params
    const source = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    })

    if (!source) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 },
      )
    }

    const name = `${source.name} (copia)`
    const slug = await buildUniqueSlug(name)
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku: null,
        description: source.description,
        seoTitle: null,
        seoDescription: null,
        price: source.price,
        originalPrice: source.originalPrice,
        images: source.images,
        categoryId: source.categoryId,
        subCategory: source.subCategory,
        colors: source.colors,
        sizes: source.sizes ?? [],
        bestSeller: false,
        active: false,
        stock: source.stock,
        variants: {
          create: source.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            sku: null,
            active: variant.active,
          })),
        },
      },
    })

    revalidateCatalogCache()

    return NextResponse.json({
      success: true,
      message: 'Producto duplicado como borrador',
      product,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
