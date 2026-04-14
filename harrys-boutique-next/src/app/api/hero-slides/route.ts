import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdminAuth, validateBody } from '@/lib/api-utils'

const createSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  productId: z.string().uuid(),
  image: z.string().url(),
})

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
      include: { product: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ success: true, slides })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const { data, error: validationError } = await validateBody(req, createSchema)
  if (validationError) return validationError

  try {
    const count = await prisma.heroSlide.count()
    const slide = await prisma.heroSlide.create({
      data: { ...data!, order: count },
      include: { product: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ success: true, slide }, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
}
