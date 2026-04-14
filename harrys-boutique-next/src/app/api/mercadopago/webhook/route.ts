import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { sendEmail } from '@/lib/email'
import OrderConfirmation from '@/lib/email/templates/order-confirmation'

const SHIPPING_FEE = 10

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

/**
 * Verify MercadoPago webhook signature.
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
async function verifySignature(req: NextRequest): Promise<boolean> {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET!

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  const dataId = new URL(req.url).searchParams.get('data.id')

  if (!xSignature || !xRequestId) return false

  // Parse ts and v1 from x-signature header
  const parts = Object.fromEntries(xSignature.split(',').map((p) => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  // Build the manifest string
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

  // HMAC-SHA256
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest))
  const computed = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return computed === v1
}

export async function POST(req: NextRequest) {
  try {
    // Verify signature
    const valid = await verifySignature(req)
    if (!valid) {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json({ received: true }) // Always 200 to MP
    }

    const body = await req.json()
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

    // external_reference is the orderId (set in create-preference)
    const orderId = paymentData.external_reference
    if (!orderId) {
      console.error('[Webhook] No external_reference in payment', paymentId)
      return NextResponse.json({ received: true })
    }

    // Check order exists before updating
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } })
    if (!existingOrder) {
      console.error('[Webhook] Order not found:', orderId)
      return NextResponse.json({ received: true })
    }

    // Idempotency: skip if already processed
    if (existingOrder.payment === true) {
      return NextResponse.json({ received: true, skipped: 'already_processed' })
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING', payment: true },
    })

    // Clear user cart
    await prisma.cart.deleteMany({ where: { userId: existingOrder.userId } })

    // Send confirmation email (non-blocking)
    const orderWithDetails = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { email: true, name: true } },
      },
    })

    if (orderWithDetails?.user?.email) {
      const total = Number(orderWithDetails.amount)
      const subtotal = total - SHIPPING_FEE

      sendEmail({
        to: orderWithDetails.user.email,
        subject: `Confirmación de tu pedido #${orderId.slice(-8).toUpperCase()} — Harry's Boutique`,
        react: OrderConfirmation({
          orderId: orderId.slice(-8).toUpperCase(),
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
      }).catch((err) => {
        console.error('[Webhook] Failed to send confirmation email:', err)
      })
    }

    return NextResponse.json({ received: true, processed: true })
  } catch (e) {
    return handleApiError(e)
  }
}
