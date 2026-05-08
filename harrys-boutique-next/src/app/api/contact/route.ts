import * as React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Text } from '@react-email/components'
import { handleApiError, protectMutation, validateBody } from '@/lib/api-utils'
import { sendEmail } from '@/lib/email'

const contactSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  asunto: z.string().trim().min(3).max(120),
  mensaje: z.string().trim().min(10).max(1500),
  website: z.string().max(200).optional(),
})

function contactMessageEmail({
  nombre,
  email,
  asunto,
  mensaje,
}: {
  nombre: string
  email: string
  asunto: string
  mensaje: string
}) {
  return React.createElement(
    'div',
    null,
    React.createElement(Text, null, React.createElement('strong', null, 'Nombre:'), ` ${nombre}`),
    React.createElement(Text, null, React.createElement('strong', null, 'Email:'), ` ${email}`),
    React.createElement(Text, null, React.createElement('strong', null, 'Asunto:'), ` ${asunto}`),
    React.createElement(Text, { style: { whiteSpace: 'pre-wrap' } }, mensaje),
  )
}

export async function POST(req: NextRequest) {
  const protectionError = await protectMutation(req, {
    keyPrefix: 'contact:create',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  })
  if (protectionError) return protectionError

  const { data, error } = await validateBody(req, contactSchema)
  if (error) return error

  if (data!.website) {
    return NextResponse.json({ success: true })
  }

  try {
    const to = process.env.CONTACT_EMAIL ?? process.env.RESEND_FROM_EMAIL
    if (!to) {
      return NextResponse.json(
        { success: false, message: 'Canal de contacto no configurado' },
        { status: 503 },
      )
    }

    const result = await sendEmail({
      to,
      subject: `Contacto Harry's Boutique: ${data!.asunto}`,
      react: contactMessageEmail(data!),
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'No se pudo enviar el mensaje' },
        { status: 503 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
