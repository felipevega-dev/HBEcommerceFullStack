import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/api-utils'
import { logAuditAction } from '@/lib/audit-log'
import {
  MERCADO_LIBRE_OAUTH_COOKIE,
  exchangeMercadoLibreCode,
  fetchMercadoLibreUser,
  getMercadoLibreOAuthConfig,
  safeEqual,
  saveMercadoLibreConnection,
} from '@/lib/mercado-libre-auth'
import { getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

type CallbackOutcome =
  | 'connected'
  | 'not_configured'
  | 'denied'
  | 'invalid_state'
  | 'exchange_failed'

/**
 * GET /api/admin/mercadolibre/callback
 * Receives the authorization code from Mercado Libre and stores the seller tokens.
 */
export async function GET(req: NextRequest) {
  const { error, session } = await requireAdminAuth()
  if (error) {
    return NextResponse.redirect(new URL('/login?callbackUrl=%2Fadmin%2Fsettings', req.url))
  }

  const redirectWith = (outcome: CallbackOutcome) => {
    const settingsUrl = new URL('/admin/settings', req.url)
    settingsUrl.searchParams.set('mercadolibre', outcome)
    const response = NextResponse.redirect(settingsUrl)
    response.cookies.set({
      name: MERCADO_LIBRE_OAUTH_COOKIE,
      value: '',
      maxAge: 0,
      path: '/api/admin/mercadolibre',
    })
    return response
  }

  const config = getMercadoLibreOAuthConfig()
  if (!config) return redirectWith('not_configured')

  const params = req.nextUrl.searchParams
  if (params.get('error')) return redirectWith('denied')

  const code = params.get('code')
  const state = params.get('state')
  const [expectedState, codeVerifier] =
    req.cookies.get(MERCADO_LIBRE_OAUTH_COOKIE)?.value.split('.') ?? []

  if (!code || !state || !expectedState || !codeVerifier || !safeEqual(state, expectedState)) {
    return redirectWith('invalid_state')
  }

  try {
    const tokens = await exchangeMercadoLibreCode(config, { code, codeVerifier })
    const user = await fetchMercadoLibreUser(tokens.access_token).catch(() => null)
    const connection = await saveMercadoLibreConnection(tokens, {
      nickname: user?.nickname ?? null,
      connectedById: session!.user.id,
    })

    await logAuditAction(
      session!.user.id,
      'mercadolibre.connect',
      'mercadolibre',
      connection.mlUserId,
      { nickname: connection.nickname },
      getClientIp(req),
      req.headers.get('user-agent'),
    )

    return redirectWith('connected')
  } catch (e) {
    console.error('[MercadoLibre OAuth] Token exchange failed', e)
    return redirectWith('exchange_failed')
  }
}
