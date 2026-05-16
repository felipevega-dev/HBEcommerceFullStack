import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAdminAuth, validateBody } from '@/lib/api-utils'
import { sendEmail } from '@/lib/email'
import OrderConfirmation from '@/lib/email/templates/order-confirmation'
import OrderStatusUpdate from '@/lib/email/templates/order-status-update'
import { getSiteUrl } from '@/lib/site'

const resendSchema = z.object({
  type: z.enum(['confirmation', 'status']).default('confirmation'),
})

function formatAddress(value: unknown) {
  const address = value as Record<string, string> | null
  if (!address) return 'Dirección no disponible'
  return [address.street, address.city, address.region, address.country].filter(Boolean).join(', ')
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:orders:resend-email',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, resendSchema)
  if (validationError) return validationError

  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true } },
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'Orden no encontrada' }, { status: 404 })
    }

    if (!order.user.email) {
      return NextResponse.json(
        { success: false, message: 'La orden no tiene email de cliente' },
        { status: 400 },
      )
    }

    if (data!.type === 'status') {
      await sendEmail({
        to: order.user.email,
        subject: `Actualización de tu pedido #${id}`,
        react: OrderStatusUpdate({
          orderId: id,
          customerName: order.user.name ?? '',
          previousStatus: order.status,
          newStatus: order.status,
          frontendUrl: getSiteUrl(),
        }),
      })
    } else {
      const total = Number(order.amount)
      await sendEmail({
        to: order.user.email,
        subject: `Confirmación de tu pedido #${id}`,
        react: OrderConfirmation({
          orderId: id,
          customerName: order.user.name ?? '',
          items: order.items.map((item) => ({
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            size: item.size,
            image: item.image,
          })),
          subtotal: total,
          shippingFee: 0,
          total,
          address: formatAddress(order.addressSnapshot),
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
