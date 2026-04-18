import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdminAuth, validateBody } from '@/lib/api-utils'

const createSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default(''),
  comment: z.string().min(1).max(500),
  rating: z.number().int().min(1).max(5).default(5),
  avatar: z.string().url().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional().default('PENDING'),
})

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, testimonials })
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
    const maxOrder = await prisma.testimonial.aggregate({ _max: { order: true } })
    const testimonial = await prisma.testimonial.create({
      data: { 
        ...data!, 
        order: (maxOrder._max.order ?? 0) + 1,
        status: data!.status ?? 'PENDING',
      },
    })
    return NextResponse.json({ success: true, testimonial }, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
}
