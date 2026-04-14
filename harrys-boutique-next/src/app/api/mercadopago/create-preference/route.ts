import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleApiError, validateBody } from '@/lib/api-utils'
import { z } from 'zod'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const itemSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
})

const preferenceSchema = z.object({
  items: z.array(itemSchema).min(1),
  amount: z.number().positive(),
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
    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: data!.items.map((item) => ({
          id: item.name.toLowerCase().replace(/\s+/g, '-'),
          title: item.size ? `${item.name} (${item.size})` : item.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'CLP',
        })),
        payer: {
          name: data!.address.firstname,
          surname: data!.address.lastname,
          email: data!.address.email ?? session!.user.email,
        },
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/orders?payment=success`,
          failure: `${process.env.NEXTAUTH_URL}/checkout?payment=failure`,
          pending: `${process.env.NEXTAUTH_URL}/orders?payment=pending`,
        },
        auto_return: 'approved',
        external_reference: data!.orderId,
      },
    })

    return NextResponse.json({
      success: true,
      preferenceId: result.id,
      initPoint: result.init_point,        // production redirect URL
      sandboxInitPoint: result.sandbox_init_point, // sandbox redirect URL
    })
  } catch (e) {
    return handleApiError(e)
  }
}
