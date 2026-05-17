import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAdminAuth } from '@/lib/api-utils'
import { getSettingsMap } from '@/lib/commerce-settings'
import { normalizeSettingsUpdate } from '@/lib/store-settings'

export async function GET() {
  try {
    const map = await getSettingsMap()
    return NextResponse.json({ success: true, settings: map })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:settings:update',
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const updates: Record<string, unknown> = await req.json()
    const { normalized, errors } = normalizeSettingsUpdate(updates)

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    await Promise.all(
      Object.entries(normalized).map(([key, value]) =>
        prisma.settings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    )
    const map = await getSettingsMap()
    return NextResponse.json({ success: true, settings: map })
  } catch (e) {
    return handleApiError(e)
  }
}
