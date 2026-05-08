import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth, handleApiError, protectMutation } from '@/lib/api-utils'

export async function PUT(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:hero:reorder',
    maxRequests: 30,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const { slides } = await req.json()

    if (!Array.isArray(slides)) {
      return NextResponse.json({ success: false, message: 'Formato inválido' }, { status: 400 })
    }

    // Update order for each slide
    await Promise.all(
      slides.map((slide: { id: string; order: number }) =>
        prisma.heroSlide.update({
          where: { id: slide.id },
          data: { order: slide.order },
        }),
      ),
    )

    // Revalidate the home page and admin page to show updated order
    revalidatePath('/', 'page')
    revalidatePath('/admin/hero', 'page')

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
