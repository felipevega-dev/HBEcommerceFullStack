import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, protectMutation, requireAdminAuth } from '@/lib/api-utils'
import { logAuditAction } from '@/lib/audit-log'
import { disconnectMercadoLibre } from '@/lib/mercado-libre-auth'
import { getMercadoLibreIntegrationStatus } from '@/lib/mercado-libre-sync'
import { getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

/** GET /api/admin/mercadolibre/connection — integration status for the admin panel. */
export async function GET() {
  const { error } = await requireAdminAuth()
  if (error) return error

  try {
    const status = await getMercadoLibreIntegrationStatus()
    return NextResponse.json({ success: true, status })
  } catch (e) {
    return handleApiError(e)
  }
}

/** DELETE /api/admin/mercadolibre/connection — forget the seller tokens. */
export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:mercadolibre:disconnect',
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const removed = await disconnectMercadoLibre()

    await logAuditAction(
      session!.user.id,
      'mercadolibre.disconnect',
      'mercadolibre',
      null,
      { removed },
      getClientIp(req),
      req.headers.get('user-agent'),
    )

    return NextResponse.json({ success: true, removed })
  } catch (e) {
    return handleApiError(e)
  }
}
