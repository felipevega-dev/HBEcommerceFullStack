import { NextRequest, NextResponse } from 'next/server'
import { protectMutation, requireAuth, handleApiError, validateBody } from '@/lib/api-utils'
import { z } from 'zod'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { CURRENCY_CODE } from '@/lib/commerce'
import { roundMoney } from '@/lib/checkout'
import { releaseExpiredStockReservations } from '@/lib/order-lifecycle'
import { getSiteUrl } from '@/lib/site'

const preferenceSchema = z.object({
  orderId: z.string().uuid(),
  address: z.object({
    firstname: z.string(),
    lastname: z.string().optional(),
    email: z.string().email().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }),
})

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth(req)
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'payments:create-preference',
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
    keySuffix: session!.user.id,
  })
  if (protectionError) return protectionError

  const { data, error: validationError } = await validateBody(req, preferenceSchema)
  if (validationError) return validationError

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: 'MercadoPago no configurado' },
      { status: 500 },
    )
  }

  try {
    await releaseExpiredStockReservations().catch((cleanupError) => {
      console.warn('[MercadoPago Preference] Failed to release expired reservations:', cleanupError)
    })

    const order = await prisma.order.findUnique({
      where: { id: data!.orderId },
      include: { items: true },
    })

    if (!order || order.userId !== session!.user.id) {
      return NextResponse.json({ success: false, message: 'Pedido no encontrado' }, { status: 404 })
    }

    if (order.payment || order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { success: false, message: 'Este pedido ya fue pagado' },
        { status: 400 },
      )
    }

    if (order.stockReleasedAt || order.status === 'CANCELLED') {
      return NextResponse.json(
        {
          success: false,
          message:
            'La reserva de stock de este pedido expiró. Vuelve al carrito para generar un nuevo pedido.',
        },
        { status: 409 },
      )
    }

    if (order.stockReservationExpiresAt && order.stockReservationExpiresAt <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          message:
            'La reserva de stock de este pedido expiró. Vuelve al carrito para generar un nuevo pedido.',
        },
        { status: 409 },
      )
    }

    if (order.paymentMethod !== 'mercadopago') {
      return NextResponse.json(
        { success: false, message: 'El pedido no fue creado para MercadoPago' },
        { status: 400 },
      )
    }

    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)
    const siteUrl = getSiteUrl()

    const result = await preference.create({
      body: {
        items: [
          {
            id: order.id,
            title: `Pedido Harry's Boutique #${order.id.slice(-8).toUpperCase()}`,
            description: `${order.items.length} producto${order.items.length === 1 ? '' : 's'} con envio y descuentos aplicados`,
            quantity: 1,
            unit_price: roundMoney(Number(order.amount)),
            currency_id: CURRENCY_CODE,
          },
        ],
        payer: {
          name: data!.address.firstname,
          surname: data!.address.lastname,
          email: data!.address.email ?? session!.user.email,
        },
        back_urls: {
          success: `${siteUrl}/orders?payment=success`,
          failure: `${siteUrl}/checkout?payment=failure`,
          pending: `${siteUrl}/orders?payment=pending`,
        },
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        auto_return: 'approved',
        external_reference: order.id,
      },
    })

    return NextResponse.json({
      success: true,
      preferenceId: result.id,
      initPoint: result.init_point, // production redirect URL
      sandboxInitPoint: result.sandbox_init_point, // sandbox redirect URL
    })
  } catch (e) {
    return handleApiError(e)
  }
}
