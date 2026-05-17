import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, protectMutation, requireAdminAuth } from '@/lib/api-utils'
import { getSettingsMap } from '@/lib/commerce-settings'
import { CONTENT_SETTING_KEYS, normalizeSettingsUpdate } from '@/lib/store-settings'
import { getClientIp } from '@/lib/rate-limiter'

export async function GET() {
  try {
    const map = await getSettingsMap()
    return NextResponse.json({ success: true, settings: map })
  } catch (e) {
    return handleApiError(e)
  }
}

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAdminAuth()
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

    const currentSettings = await getSettingsMap()
    const changedEntries = Object.entries(normalized).filter(
      ([key, value]) => currentSettings[key] !== value,
    )

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        Object.entries(normalized).map(([key, value]) =>
          tx.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          }),
        ),
      )

      if (changedEntries.length > 0) {
        await tx.auditLog.create({
          data: {
            userId: session!.user.id,
            action: 'settings.update',
            resource: 'settings',
            changes: {
              settings: Object.fromEntries(
                changedEntries.map(([key, value]) => [
                  key,
                  CONTENT_SETTING_KEYS.has(key)
                    ? { changed: true }
                    : { from: currentSettings[key] ?? null, to: value },
                ]),
              ),
            },
            ip: getClientIp(req),
            userAgent: req.headers.get('user-agent'),
          },
        })
      }
    })

    const map = await getSettingsMap()
    return NextResponse.json({ success: true, settings: map })
  } catch (e) {
    return handleApiError(e)
  }
}
