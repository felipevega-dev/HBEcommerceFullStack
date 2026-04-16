import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, getPagination, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { generateSlug } from '@/lib/utils'
import { buildProductWhere, buildProductOrderBy } from '@/lib/collection-params'

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1).max(4),
  categoryId: z.string().uuid(),
  subCategory: z.string().min(1),
  colors: z.array(z.string()).min(1),
  sizes: z.array(z.string()).min(1),
  bestSeller: z.boolean().optional(),
  active: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = getPagination(searchParams)
    const sort = searchParams.get('sort') ?? 'latest'

    const params = {
      search: searchParams.get('search') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      subCategory: searchParams.get('subCategory') ?? undefined,
      bestSeller: searchParams.get('bestSeller') ?? undefined,
      minPrice: searchParams.get('minPrice') ?? undefined,
      maxPrice: searchParams.get('maxPrice') ?? undefined,
    }

    const where = buildProductWhere(params)
    const orderBy = buildProductOrderBy(sort)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: { select: { name: true } } },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + products.length < total,
    })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const { data, error: validationError } = await validateBody(req, createProductSchema)
  if (validationError) {
    console.error('Validation error:', validationError)
    return validationError
  }

  try {
    console.log('Creating product with data:', JSON.stringify(data, null, 2))
    
    // Generate unique slug from name
    const baseSlug = generateSlug(data!.name)
    const existing = await prisma.product.findFirst({ where: { slug: { startsWith: baseSlug } } })
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug

    const product = await prisma.product.create({ data: { ...data!, slug } })
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (e) {
    console.error('Product creation error:', e)
    return handleApiError(e)
  }
}
