import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdminAuth, validateBody } from '@/lib/api-utils'

const categorySchema = z.object({
  name: z.string().min(1),
  subcategories: z.array(z.string()).min(1),
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

  const { data, error: validationError } = await validateBody(req, categorySchema)
  if (validationError) return validationError

  try {
    const category = await prisma.category.create({ data: data! })
    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
}
