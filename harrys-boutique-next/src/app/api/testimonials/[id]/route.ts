import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'

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

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:testimonials:update',
    maxRequests: 30,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:testimonials:delete',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const { id } = await params
    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
