import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidateCatalogCache } from '@/lib/cache'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'

const categorySchema = z.object({
  name: z.string().min(1),
  subcategories: z.array(z.string()).min(1),
  slug: z.string().min(1).max(120).optional(),
  homeImage: z.string().url().optional().nullable(),
  homeDescription: z.string().max(240).optional().nullable(),
  homeHref: z.string().max(240).optional().nullable(),
  active: z.boolean().optional().default(true),
  homeVisible: z.boolean().optional().default(false),
  homeOrder: z.number().int().min(0).max(9999).optional().default(0),
})

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json({ success: true, categories })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:categories:create',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, categorySchema)
  if (validationError) return validationError

  try {
    const category = await prisma.category.create({ data: data! })
    revalidateCatalogCache()
    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
}
