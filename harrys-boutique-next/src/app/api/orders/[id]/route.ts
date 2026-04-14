import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, requireAuth, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { OrderStatus } from '@prisma/client'
import { sendEmail } from '@/lib/email'
import OrderStatusUpdate from '@/lib/email/templates/order-status-update'

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order)
      return NextResponse.json({ success: false, message: 'Orden no encontrada' }, { status: 404 })

    // Users can only see their own orders; admins can see all
    const isAdmin = ['OWNER', 'ADMIN', 'MODERATOR'].includes(session!.user.role)
    if (!isAdmin && order.userId !== session!.user.id) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 })
    }

    return NextResponse.json({ success: true, order })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const { data, error: validationError } = await validateBody(req, updateStatusSchema)
  if (validationError) return validationError

  try {
    const { id } = await params

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    })
    const previousStatus = existing?.status ?? data!.status

    const order = await prisma.order.update({
      where: { id },
      data: { status: data!.status },
      include: { user: { select: { email: true, name: true } } },
    })

    if (order.user?.email) {
      try {
        await sendEmail({
          to: order.user.email,
          subject: `Actualización de tu pedido #${id}`,
          react: OrderStatusUpdate({
            orderId: id,
            customerName: order.user.name ?? '',
            previousStatus: previousStatus as string,
            newStatus: data!.status,
            frontendUrl: process.env.NEXTAUTH_URL ?? '',
          }),
        })
      } catch (emailError) {
        console.error('[Order PUT] Failed to send status update email:', emailError)
      }
    } else {
      console.warn(`[Order PUT] No email for order ${id}, skipping status update email`)
    }

    return NextResponse.json({ success: true, order })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const { id } = await params
    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Orden eliminada' })
  } catch (e) {
    return handleApiError(e)
  }
}
