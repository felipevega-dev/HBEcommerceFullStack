import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  handleApiError,
  protectMutation,
  requireAuth,
  requireAdminAuth,
  validateBody,
} from '@/lib/api-utils'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { sendEmail } from '@/lib/email'
import OrderStatusUpdate from '@/lib/email/templates/order-status-update'
import { getSiteUrl } from '@/lib/site'
import { releaseCouponRedemption, releaseOrderStockReservation } from '@/lib/order-lifecycle'

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  internalNotes: z.string().max(5000).optional(),
  courier: z.string().max(100).optional(),
  trackingNumber: z.string().max(120).optional(),
  cancelReason: z.string().max(500).optional(),
  refundReason: z.string().max(500).optional(),
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
  const { error, session } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:orders:update',
    maxRequests: 40,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, updateStatusSchema)
  if (validationError) return validationError

  try {
    const { id } = await params

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Orden no encontrada' }, { status: 404 })
    }

    if (data!.status && existing.status === 'CANCELLED' && data!.status !== 'CANCELLED') {
      return NextResponse.json(
        { success: false, message: 'Una orden cancelada no se reactiva desde este panel' },
        { status: 409 },
      )
    }

    const previousStatus = existing.status
    const shouldReleaseInventory = data!.status === 'CANCELLED' && previousStatus !== 'CANCELLED'

    const order = await prisma.$transaction(async (tx) => {
      if (shouldReleaseInventory) {
        await releaseOrderStockReservation(tx, existing, {
          cancelReason: data!.cancelReason ?? 'Cancelada desde admin',
        })

        await releaseCouponRedemption(
          tx,
          existing.id,
          data!.cancelReason ?? 'Cancelada desde admin',
        )
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          ...(data!.status ? { status: data!.status } : {}),
          ...(data!.paymentStatus
            ? {
                paymentStatus: data!.paymentStatus,
                payment: data!.paymentStatus === 'PAID',
                paidAt:
                  data!.paymentStatus === 'PAID' && !existing.paidAt ? new Date() : existing.paidAt,
              }
            : {}),
          ...(data!.internalNotes !== undefined ? { internalNotes: data!.internalNotes } : {}),
          ...(data!.courier !== undefined ? { courier: data!.courier } : {}),
          ...(data!.trackingNumber !== undefined ? { trackingNumber: data!.trackingNumber } : {}),
          ...(data!.cancelReason !== undefined ? { cancelReason: data!.cancelReason } : {}),
          ...(data!.refundReason !== undefined ? { refundReason: data!.refundReason } : {}),
          ...(data!.status === 'SHIPPED' && !existing.shippedAt ? { shippedAt: new Date() } : {}),
          ...(data!.status === 'DELIVERED' && !existing.deliveredAt
            ? { deliveredAt: new Date() }
            : {}),
        },
        include: { user: { select: { email: true, name: true } } },
      })

      if (data!.status && data!.status !== previousStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            previousStatus,
            status: data!.status,
            note: data!.cancelReason,
          },
        })
      }

      const auditChanges = Object.fromEntries(
        Object.entries({
          previousStatus,
          status: data!.status,
          paymentStatus: data!.paymentStatus,
          internalNotesChanged: data!.internalNotes !== undefined,
          courier: data!.courier,
          trackingNumber: data!.trackingNumber,
          cancelReason: data!.cancelReason,
          refundReason: data!.refundReason,
        }).filter(([, value]) => value !== undefined),
      )

      await tx.auditLog.create({
        data: {
          userId: session!.user.id,
          action: 'order.update',
          resource: 'order',
          resourceId: id,
          changes: auditChanges,
        },
      })

      return updatedOrder
    })

    if (data!.status && data!.status !== previousStatus && order.user?.email) {
      try {
        await sendEmail({
          to: order.user.email,
          subject: `Actualización de tu pedido #${id}`,
          react: OrderStatusUpdate({
            orderId: id,
            customerName: order.user.name ?? '',
            previousStatus: previousStatus as string,
            newStatus: data!.status,
            frontendUrl: getSiteUrl(),
          }),
        })
      } catch (emailError) {
        console.error('[Order PUT] Failed to send status update email:', emailError)
      }
    } else if (data!.status && data!.status !== previousStatus) {
      console.warn(`[Order PUT] No email for order ${id}, skipping status update email`)
    }

    return NextResponse.json({ success: true, order })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:orders:delete',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const { id } = await params
    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Orden no encontrada' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      if (existing.status !== 'CANCELLED') {
        await releaseOrderStockReservation(tx, existing, {
          status: 'CANCELLED',
          cancelReason: 'Eliminada desde admin',
        })

        await releaseCouponRedemption(tx, existing.id, 'Eliminada desde admin')
      }

      await tx.order.delete({ where: { id } })

      await tx.auditLog.create({
        data: {
          userId: session!.user.id,
          action: 'order.delete',
          resource: 'order',
          resourceId: id,
          changes: { previousStatus: existing.status },
        },
      })
    })
    return NextResponse.json({ success: true, message: 'Orden eliminada' })
  } catch (e) {
    return handleApiError(e)
  }
}
