import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import React from 'react'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { PasswordResetEmail } from '@/lib/email/templates/password-reset'
import { createPasswordResetToken, getPasswordResetExpiry } from '@/lib/auth/password-reset'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const genericResponse = {
  success: true,
  message: 'Si existe una cuenta con ese email, enviaremos instrucciones para restablecerla.',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(genericResponse)
    }

    const email = parsed.data.email.trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    })

    if (!user) {
      return NextResponse.json(genericResponse)
    }

    const { token, tokenHash } = createPasswordResetToken()

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: getPasswordResetExpiry(),
      },
    })

    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000'
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`

    await sendEmail({
      to: user.email,
      subject: "Restablece tu contraseña de Harry's Boutique",
      react: React.createElement(PasswordResetEmail, {
        name: user.name,
        resetUrl,
      }),
    })

    return NextResponse.json(genericResponse)
  } catch {
    return NextResponse.json(genericResponse)
  }
}
