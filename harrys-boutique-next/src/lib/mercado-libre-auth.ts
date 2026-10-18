import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import type { MercadoLibreConnection } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/site'

export const MERCADO_LIBRE_AUTH_URL = 'https://auth.mercadolibre.cl/authorization'
export const MERCADO_LIBRE_API_URL = 'https://api.mercadolibre.com'
export const MERCADO_LIBRE_OAUTH_COOKIE = 'hb_ml_oauth'
export const MERCADO_LIBRE_OAUTH_COOKIE_MAX_AGE = 10 * 60

const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000

export interface MercadoLibreOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface MercadoLibreTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope?: string
  user_id: number | string
  refresh_token: string
}

export interface MercadoLibreConnectionSummary {
  mlUserId: string
  nickname: string | null
  connectedAt: string
  expiresAt: string
  lastSyncAt: string | null
  lastSyncError: string | null
}

export class MercadoLibreApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message)
    this.name = 'MercadoLibreApiError'
  }
}

export class MercadoLibreNotConfiguredError extends Error {
  constructor() {
    super(
      'Mercado Libre no está configurado: faltan MERCADOLIBRE_CLIENT_ID o MERCADOLIBRE_CLIENT_SECRET',
    )
    this.name = 'MercadoLibreNotConfiguredError'
  }
}

export class MercadoLibreNotConnectedError extends Error {
  constructor() {
    super('Mercado Libre no está conectado. Autoriza la cuenta desde Configuración.')
    this.name = 'MercadoLibreNotConnectedError'
  }
}

// ─── Configuration ────────────────────────────────────────────────────────────

export function getMercadoLibreRedirectUri() {
  const configured = process.env.MERCADOLIBRE_REDIRECT_URI?.trim()
  return configured || `${getSiteUrl()}/api/admin/mercadolibre/callback`
}

export function getMercadoLibreOAuthConfig(): MercadoLibreOAuthConfig | null {
  const clientId = process.env.MERCADOLIBRE_CLIENT_ID?.trim()
  const clientSecret = process.env.MERCADOLIBRE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) return null

  return { clientId, clientSecret, redirectUri: getMercadoLibreRedirectUri() }
}

export function isMercadoLibreConfigured() {
  return getMercadoLibreOAuthConfig() !== null
}

// ─── Authorization URL and PKCE ───────────────────────────────────────────────

function toBase64Url(buffer: Buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function createMercadoLibreOAuthState() {
  const state = toBase64Url(randomBytes(24))
  const codeVerifier = toBase64Url(randomBytes(48))
  const codeChallenge = toBase64Url(createHash('sha256').update(codeVerifier).digest())
  return { state, codeVerifier, codeChallenge }
}

export function buildMercadoLibreAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  codeChallenge,
}: {
  clientId: string
  redirectUri: string
  state: string
  codeChallenge?: string
}) {
  const url = new URL(MERCADO_LIBRE_AUTH_URL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  if (codeChallenge) {
    url.searchParams.set('code_challenge', codeChallenge)
    url.searchParams.set('code_challenge_method', 'S256')
  }
  return url.toString()
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function requestMercadoLibreToken(
  params: Record<string, string>,
): Promise<MercadoLibreTokenResponse> {
  const response = await fetch(`${MERCADO_LIBRE_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
    cache: 'no-store',
  })

  const body = await parseJsonSafely(response)
  if (!response.ok) {
    throw new MercadoLibreApiError(
      `Mercado Libre rechazó la solicitud de token (${response.status})`,
      response.status,
      body,
    )
  }

  const tokens = body as Partial<MercadoLibreTokenResponse> | null
  if (!tokens?.access_token || !tokens.refresh_token || !tokens.expires_in) {
    throw new MercadoLibreApiError('Respuesta de token incompleta de Mercado Libre', 502, body)
  }

  return tokens as MercadoLibreTokenResponse
}

export function exchangeMercadoLibreCode(
  config: MercadoLibreOAuthConfig,
  { code, codeVerifier }: { code: string; codeVerifier?: string },
) {
  return requestMercadoLibreToken({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
  })
}

export function refreshMercadoLibreToken(config: MercadoLibreOAuthConfig, refreshToken: string) {
  return requestMercadoLibreToken({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
  })
}

export async function mercadoLibreFetch<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${MERCADO_LIBRE_API_URL}${path}`, {
    ...init,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  const body = await parseJsonSafely(response)
  if (!response.ok) {
    throw new MercadoLibreApiError(
      `Mercado Libre respondió ${response.status} en ${path.split('?')[0]}`,
      response.status,
      body,
    )
  }

  return body as T
}

export function fetchMercadoLibreUser(accessToken: string) {
  return mercadoLibreFetch<{ id: number; nickname?: string; site_id?: string }>(
    '/users/me',
    accessToken,
  )
}

// ─── Token encryption at rest ─────────────────────────────────────────────────

function getTokenEncryptionKey() {
  const secret = process.env.MERCADOLIBRE_TOKEN_SECRET?.trim() || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('Falta MERCADOLIBRE_TOKEN_SECRET o NEXTAUTH_SECRET para cifrar tokens')
  }
  return createHash('sha256').update(secret).digest()
}

export function encryptMercadoLibreSecret(plain: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getTokenEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${toBase64Url(iv)}.${toBase64Url(tag)}.${toBase64Url(encrypted)}`
}

export function decryptMercadoLibreSecret(payload: string) {
  const [version, iv, tag, data] = payload.split('.')
  if (version !== 'v1' || !iv || !tag || !data) {
    throw new Error('Token de Mercado Libre almacenado en un formato desconocido')
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getTokenEncryptionKey(),
    Buffer.from(iv, 'base64url'),
  )
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(data, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

// ─── Persistence ──────────────────────────────────────────────────────────────

export function getMercadoLibreConnection() {
  return prisma.mercadoLibreConnection.findFirst({ orderBy: { createdAt: 'asc' } })
}

export function toMercadoLibreConnectionSummary(
  connection: MercadoLibreConnection,
): MercadoLibreConnectionSummary {
  return {
    mlUserId: connection.mlUserId,
    nickname: connection.nickname,
    connectedAt: connection.createdAt.toISOString(),
    expiresAt: connection.expiresAt.toISOString(),
    lastSyncAt: connection.lastSyncAt?.toISOString() ?? null,
    lastSyncError: connection.lastSyncError,
  }
}

export function getTokenExpiry(tokens: MercadoLibreTokenResponse, from = Date.now()) {
  return new Date(from + tokens.expires_in * 1000)
}

export async function saveMercadoLibreConnection(
  tokens: MercadoLibreTokenResponse,
  { nickname, connectedById }: { nickname?: string | null; connectedById?: string | null },
) {
  const mlUserId = String(tokens.user_id)
  const data = {
    nickname: nickname ?? null,
    accessToken: encryptMercadoLibreSecret(tokens.access_token),
    refreshToken: encryptMercadoLibreSecret(tokens.refresh_token),
    expiresAt: getTokenExpiry(tokens),
    scope: tokens.scope ?? null,
    connectedById: connectedById ?? null,
    lastSyncError: null,
  }

  return prisma.$transaction(async (tx) => {
    // The store works with a single seller account.
    await tx.mercadoLibreConnection.deleteMany({ where: { mlUserId: { not: mlUserId } } })
    return tx.mercadoLibreConnection.upsert({
      where: { mlUserId },
      update: data,
      create: { mlUserId, ...data },
    })
  })
}

export async function disconnectMercadoLibre() {
  const result = await prisma.mercadoLibreConnection.deleteMany({})
  return result.count
}

export async function recordMercadoLibreSyncResult(connectionId: string, error: string | null) {
  await prisma.mercadoLibreConnection.update({
    where: { id: connectionId },
    data: { lastSyncAt: new Date(), lastSyncError: error },
  })
}

/**
 * Returns a valid access token for the connected seller, refreshing it when it
 * is about to expire. Mercado Libre refresh tokens are single-use, so the new
 * pair is persisted before returning.
 */
export async function getMercadoLibreAccessToken(): Promise<{
  accessToken: string
  connection: MercadoLibreConnection
} | null> {
  const config = getMercadoLibreOAuthConfig()
  if (!config) throw new MercadoLibreNotConfiguredError()

  const connection = await getMercadoLibreConnection()
  if (!connection) return null

  if (connection.expiresAt.getTime() - Date.now() > TOKEN_REFRESH_MARGIN_MS) {
    return { accessToken: decryptMercadoLibreSecret(connection.accessToken), connection }
  }

  const refreshed = await refreshMercadoLibreToken(
    config,
    decryptMercadoLibreSecret(connection.refreshToken),
  )

  const updated = await prisma.mercadoLibreConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: encryptMercadoLibreSecret(refreshed.access_token),
      refreshToken: encryptMercadoLibreSecret(refreshed.refresh_token),
      expiresAt: getTokenExpiry(refreshed),
      scope: refreshed.scope ?? connection.scope,
    },
  })

  return { accessToken: refreshed.access_token, connection: updated }
}
