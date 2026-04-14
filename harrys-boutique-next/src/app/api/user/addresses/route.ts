import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError, validateBody } from '@/lib/api-utils'
import { z } from 'zod'

const addressSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  phone: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
})

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session!.user.id },
      orderBy: { isDefault: 'desc' },
    })
    return NextResponse.json({ success: true, addresses })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { data, error: validationError } = await validateBody(req, addressSchema)
  if (validationError) return validationError

  try {
    const existingCount = await prisma.address.count({ where: { userId: session!.user.id } })
    if (existingCount >= 2) {
      return NextResponse.json(
        { success: false, message: 'Solo puedes tener hasta 2 direcciones guardadas' },
        { status: 400 },
      )
    }

    // If this is the first address or isDefault is true, unset other defaults
    if (data!.isDefault || existingCount === 0) {
      await prisma.address.updateMany({
        where: { userId: session!.user.id },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: session!.user.id,
        firstname: data!.firstname,
        lastname: data!.lastname,
        phone: data!.phone,
        street: data!.street,
        city: data!.city,
        region: data!.region,
        postalCode: data!.postalCode,
        country: data!.country,
        isDefault: data!.isDefault || existingCount === 0,
      },
    })

    return NextResponse.json({ success: true, address }, { status: 201 })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const action = searchParams.get('action')

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID requerido' }, { status: 400 })
  }

  try {
    // Verify ownership
    const existing = await prisma.address.findFirst({ where: { id, userId: session!.user.id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Dirección no encontrada' },
        { status: 404 },
      )
    }

    if (action === 'setDefault') {
      await prisma.address.updateMany({
        where: { userId: session!.user.id },
        data: { isDefault: false },
      })
      const address = await prisma.address.update({ where: { id }, data: { isDefault: true } })
      return NextResponse.json({ success: true, address })
    }

    const { data, error: validationError } = await validateBody(req, addressSchema.partial())
    if (validationError) return validationError

    const address = await prisma.address.update({ where: { id }, data: data! })
    return NextResponse.json({ success: true, address })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID requerido' }, { status: 400 })
  }

  try {
    const existing = await prisma.address.findFirst({ where: { id, userId: session!.user.id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Dirección no encontrada' },
        { status: 404 },
      )
    }

    await prisma.address.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
