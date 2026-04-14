import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError, validateBody } from '@/lib/api-utils'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  profileImage: z.string().url().optional(),
})

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  try {
    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      include: { addresses: { orderBy: { isDefault: 'desc' } } },
      omit: { password: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { data, error: validationError } = await validateBody(req, updateProfileSchema)
  if (validationError) return validationError

  try {
    const user = await prisma.user.update({
      where: { id: session!.user.id },
      data: {
        ...(data!.name && { name: data!.name }),
        ...(data!.profileImage && { profileImage: data!.profileImage }),
      },
      omit: { password: true },
    })

    return NextResponse.json({ success: true, user })
  } catch (e) {
    return handleApiError(e)
  }
}
