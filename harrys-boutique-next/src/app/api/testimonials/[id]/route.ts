import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdminAuth, validateBody } from '@/lib/api-utils'

const patchSchema = z.object({
  active: z.boolean().optional(),
  order: z.number().int().optional(),
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  comment: z.string().min(1).max(500).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const { data, error: validationError } = await validateBody(req, patchSchema)
  if (validationError) return validationError

  try {
    const { id } = await params
    const testimonial = await prisma.testimonial.update({ where: { id }, data: data! })
    return NextResponse.json({ success: true, testimonial })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const { id } = await params
    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
