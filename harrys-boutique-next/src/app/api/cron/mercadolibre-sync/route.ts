import { NextRequest, NextResponse } from 'next/server'
import { revalidateCatalogCache, revalidateProductPages } from '@/lib/cache'
import { safeEqual } from '@/lib/mercado-libre-auth'
import { executeMercadoLibreSync } from '@/lib/mercado-libre-sync'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/mercadolibre-sync
 * Scheduled by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { success: false, message: 'CRON_SECRET no configurado' },
      { status: 503 },
    )
  }

  const authorization = req.headers.get('authorization') ?? ''
  if (!safeEqual(authorization, `Bearer ${secret}`)) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }

  const result = await executeMercadoLibreSync()

  if (!result.ok) {
    // Not connected / not configured is an operator decision, not a cron failure.
    const status = result.code === 'api_error' || result.code === 'error' ? 502 : 200
    return NextResponse.json(
      { success: false, code: result.code, message: result.message },
      { status },
    )
  }

  revalidateCatalogCache()
  revalidateProductPages()

  return NextResponse.json({ success: true, summary: result.summary })
}
