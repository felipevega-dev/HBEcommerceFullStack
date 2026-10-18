import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/api-utils'
import {
  MERCADO_LIBRE_OAUTH_COOKIE,
  MERCADO_LIBRE_OAUTH_COOKIE_MAX_AGE,
  buildMercadoLibreAuthorizationUrl,
  createMercadoLibreOAuthState,
  getMercadoLibreOAuthConfig,
} from '@/lib/mercado-libre-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/mercadolibre/connect
 * Starts the OAuth flow with the seller's Mercado Libre account (admin only).
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdminAuth()
  if (error) {
    return NextResponse.redirect(new URL('/login?callbackUrl=%2Fadmin%2Fsettings', req.url))
  }

  const settingsUrl = new URL('/admin/settings', req.url)
  const config = getMercadoLibreOAuthConfig()
  if (!config) {
    settingsUrl.searchParams.set('mercadolibre', 'not_configured')
    return NextResponse.redirect(settingsUrl)
  }

  const { state, codeVerifier, codeChallenge } = createMercadoLibreOAuthState()
  const response = NextResponse.redirect(
    buildMercadoLibreAuthorizationUrl({
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      state,
      codeChallenge,
    }),
  )

  response.cookies.set({
    name: MERCADO_LIBRE_OAUTH_COOKIE,
    value: `${state}.${codeVerifier}`,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/admin/mercadolibre',
    maxAge: MERCADO_LIBRE_OAUTH_COOKIE_MAX_AGE,
  })

  return response
}
