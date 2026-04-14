import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { sendEmail } from '@/lib/email'
import OrderConfirmation from '@/lib/email/templates/order-confirmation'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MercadoPago sends different event types
    const { type, data } = body

    if (type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = data?.id
    if (!paymentId) {
      return NextResponse.json({ received: true })
    }

    // Fetch payment details from MercadoPago
    const payment = new Payment(client)
    const paymentData = await payment.get({ id: paymentId })

    if (paymentData.status !== 'approved') {
      return NextResponse.json({ received: true })
    }

    // Find order by external_reference (order ID)
    const orderId = paymentData.external_reference
    if (!orderId) {
      return NextResponse.json({ received: true })
    }

    // Update order atomically
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
        payment: true,
      },
    })

    // Clear user cart
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (order) {
      await prisma.cart.deleteMany({ where: { userId: order.userId } })

      // Fetch order with items and user for confirmation email
      const orderWithDetails = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          user: { select: { email: true, name: true } },
        },
      })

      if (orderWithDetails?.user?.email) {
        try {
          const SHIPPING_FEE = 10
          const total = Number(orderWithDetails.amount)
          const subtotal = total - SHIPPING_FEE

          await sendEmail({
            to: orderWithDetails.user.email,
            subject: `Confirmación de tu pedido #${orderId} — Harry's Boutique`,
            react: OrderConfirmation({
              orderId,
              customerName: orderWithDetails.user.name ?? '',
              items: orderWithDetails.items.map((item) => ({
                name: item.name,
                price: Number(item.price),
                quantity: item.quantity,
                size: item.size,
                image: item.image || undefined,
              })),
              subtotal,
              shippingFee: SHIPPING_FEE,
              total,
              address: JSON.stringify(orderWithDetails.addressSnapshot),
            }),
          })
        } catch (emailError) {
          console.error('[Webhook] Failed to send order confirmation email:', emailError)
        }
      }
    }

    return NextResponse.json({ received: true, processed: true })
  } catch (e) {
    return handleApiError(e)
  }
}
