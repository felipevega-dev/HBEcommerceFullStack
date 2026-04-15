import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdminAuth, validateBody } from '@/lib/api-utils'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  order: z.number().int().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const { data, error: validationError } = await validateBody(req, updateSchema)
  if (validationError) return validationError

  try {
    const { id } = await params
    const slide = await prisma.heroSlide.update({ where: { id }, data: data! })
    
    // Revalidate pages to show updated slide
    revalidatePath('/', 'page')
    revalidatePath('/admin/hero', 'page')
    
    return NextResponse.json({ success: true, slide })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const { id } = await params
    await prisma.heroSlide.delete({ where: { id } })
    
    // Revalidate pages to show updated slides
    revalidatePath('/', 'page')
    revalidatePath('/admin/hero', 'page')
    
    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
