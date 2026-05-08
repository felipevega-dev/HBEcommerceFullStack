import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { sendEmail } from '@/lib/email'
import OrderConfirmation from '@/lib/email/templates/order-confirmation'
import { CURRENCY_CODE } from '@/lib/commerce'
import { toPaymentMinorUnits } from '@/lib/checkout'

function getPaymentClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado')
  }

  return new Payment(new MercadoPagoConfig({ accessToken }))
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false

  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return mismatch === 0
}

/**
 * Verify MercadoPago webhook signature.
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
async function verifySignature(req: NextRequest): Promise<boolean> {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return false

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  const dataId = new URL(req.url).searchParams.get('data.id')

  if (!xSignature || !xRequestId || !dataId) return false

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

  return timingSafeEqual(computed, v1)
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
    const payment = getPaymentClient()
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

    const paymentAmount = toPaymentMinorUnits(Number(paymentData.transaction_amount ?? 0))
    const orderAmount = toPaymentMinorUnits(Number(existingOrder.amount))
    const currencyId = paymentData.currency_id

    if (currencyId !== CURRENCY_CODE || paymentAmount !== orderAmount) {
      console.error('[Webhook] Amount or currency mismatch', {
        orderId,
        paymentId,
        paymentAmount,
        orderAmount,
        currencyId,
      })
      return NextResponse.json({ received: true, skipped: 'amount_mismatch' })
    }

    const processed = await prisma.$transaction(async (tx) => {
      const orderUpdate = await tx.order.updateMany({
        where: { id: orderId, payment: false },
        data: { status: 'PROCESSING', payment: true },
      })

      if (orderUpdate.count !== 1) return false

      if (existingOrder.couponCode) {
        await tx.coupon.updateMany({
          where: { code: existingOrder.couponCode },
          data: { usedCount: { increment: 1 } },
        })
      }

      await tx.cart.deleteMany({ where: { userId: existingOrder.userId } })
      return true
    })

    if (!processed) {
      return NextResponse.json({ received: true, skipped: 'already_processed' })
    }

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
      const subtotal = orderWithDetails.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      )
      const discountAmount = Number(orderWithDetails.discountAmount ?? 0)
      const shippingFee = Math.max(0, total + discountAmount - subtotal)

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
          shippingFee,
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
