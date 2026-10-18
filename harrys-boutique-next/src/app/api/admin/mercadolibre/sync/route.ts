import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, protectMutation, requireAdminAuth } from '@/lib/api-utils'
import { logAuditAction } from '@/lib/audit-log'
import { revalidateCatalogCache, revalidateProductPages } from '@/lib/cache'
import { executeMercadoLibreSync, type MercadoLibreSyncExecution } from '@/lib/mercado-libre-sync'
import { getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FAILURE_STATUS: Record<Extract<MercadoLibreSyncExecution, { ok: false }>['code'], number> = {
  not_configured: 400,
  not_connected: 409,
  api_error: 502,
  error: 500,
}

/** POST /api/admin/mercadolibre/sync — manual sync of every listed product. */
export async function POST(req: NextRequest) {
  const { error, session } = await requireAdminAuth()
  if (error) return error

  const protectionError = await protectMutation(req, {
    keyPrefix: 'admin:mercadolibre:sync',
    maxRequests: 6,
    windowMs: 10 * 60 * 1000,
  })
  if (protectionError) return protectionError

  try {
    const result = await executeMercadoLibreSync()

    if (!result.ok) {
      return NextResponse.json(
        { success: false, code: result.code, message: result.message },
        { status: FAILURE_STATUS[result.code] },
      )
    }

    revalidateCatalogCache()
    revalidateProductPages()

    await logAuditAction(
      session!.user.id,
      'mercadolibre.sync',
      'mercadolibre',
      null,
      { ...result.summary },
      getClientIp(req),
      req.headers.get('user-agent'),
    )

    return NextResponse.json({ success: true, summary: result.summary })
  } catch (e) {
    return handleApiError(e)
  }
}
