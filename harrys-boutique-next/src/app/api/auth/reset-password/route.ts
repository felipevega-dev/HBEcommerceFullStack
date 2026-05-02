import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPasswordResetToken } from '@/lib/auth/password-reset'

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[A-ZÁÉÍÓÚÑ]/, 'La contraseña debe contener al menos una mayúscula'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'La contraseña no cumple los requisitos.' },
        { status: 400 },
      )
    }

    const { token, password } = parsed.data
    const tokenHash = hashPasswordResetToken(token)

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    })

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'El enlace de recuperación venció o ya fue usado.' },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: { not: resetToken.id },
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, message: 'No pudimos restablecer la contraseña.' },
      { status: 500 },
    )
  }
}
