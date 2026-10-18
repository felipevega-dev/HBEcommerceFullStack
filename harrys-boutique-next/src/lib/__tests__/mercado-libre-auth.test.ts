// @vitest-environment node
import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { prisma, tx } = vi.hoisted(() => ({
  prisma: {
    mercadoLibreConnection: {
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  tx: {
    mercadoLibreConnection: { deleteMany: vi.fn(), upsert: vi.fn() },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma }))

import {
  MercadoLibreApiError,
  MercadoLibreNotConfiguredError,
  buildMercadoLibreAuthorizationUrl,
  createMercadoLibreOAuthState,
  decryptMercadoLibreSecret,
  encryptMercadoLibreSecret,
  exchangeMercadoLibreCode,
  getMercadoLibreAccessToken,
  getMercadoLibreOAuthConfig,
  refreshMercadoLibreToken,
  saveMercadoLibreConnection,
} from '../mercado-libre-auth'

const config = {
  clientId: 'app-id',
  clientSecret: 'app-secret',
  redirectUri: 'https://harrys.test/api/admin/mercadolibre/callback',
}

const tokens = {
  access_token: 'access-1',
  token_type: 'Bearer',
  expires_in: 21600,
  scope: 'offline_access read write',
  user_id: 123456,
  refresh_token: 'refresh-1',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function base64Url(buffer: Buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fetchMock = vi.fn()

describe('Mercado Libre OAuth helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('NEXTAUTH_SECRET', 'x'.repeat(40))
    vi.stubEnv('NEXT_PUBLIC_FRONTEND_URL', 'https://harrys.test')
    vi.stubEnv('MERCADOLIBRE_CLIENT_ID', 'app-id')
    vi.stubEnv('MERCADOLIBRE_CLIENT_SECRET', 'app-secret')
    vi.stubEnv('MERCADOLIBRE_REDIRECT_URI', '')
    vi.stubEnv('MERCADOLIBRE_TOKEN_SECRET', '')
    prisma.$transaction.mockImplementation(async (fn: (client: typeof tx) => unknown) => fn(tx))
    tx.mercadoLibreConnection.deleteMany.mockResolvedValue({ count: 0 })
    tx.mercadoLibreConnection.upsert.mockImplementation(async (args: { create: object }) => ({
      id: 'conn-1',
      ...args.create,
    }))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('derives the redirect URI from the site URL when none is configured', () => {
    expect(getMercadoLibreOAuthConfig()).toEqual(config)
  })

  it('prefers an explicitly configured redirect URI', () => {
    vi.stubEnv('MERCADOLIBRE_REDIRECT_URI', 'https://custom.test/callback')
    expect(getMercadoLibreOAuthConfig()?.redirectUri).toBe('https://custom.test/callback')
  })

  it('is not configured without client credentials', () => {
    vi.stubEnv('MERCADOLIBRE_CLIENT_SECRET', '')
    expect(getMercadoLibreOAuthConfig()).toBeNull()
  })

  it('builds the Chilean authorization URL with PKCE', () => {
    const url = new URL(
      buildMercadoLibreAuthorizationUrl({
        clientId: 'app-id',
        redirectUri: config.redirectUri,
        state: 'state-1',
        codeChallenge: 'challenge-1',
      }),
    )

    expect(url.origin + url.pathname).toBe('https://auth.mercadolibre.cl/authorization')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'app-id',
      redirect_uri: config.redirectUri,
      state: 'state-1',
      code_challenge: 'challenge-1',
      code_challenge_method: 'S256',
    })
  })

  it('creates a fresh state and an S256 code challenge', () => {
    const first = createMercadoLibreOAuthState()
    const second = createMercadoLibreOAuthState()

    expect(first.state).not.toBe(second.state)
    expect(first.codeVerifier).not.toBe(second.codeVerifier)
    expect(first.codeChallenge).toBe(
      base64Url(createHash('sha256').update(first.codeVerifier).digest()),
    )
  })

  it('encrypts secrets at rest and rejects tampered payloads', () => {
    const encrypted = encryptMercadoLibreSecret('APP_USR-token')

    expect(encrypted).not.toContain('APP_USR-token')
    expect(encryptMercadoLibreSecret('APP_USR-token')).not.toBe(encrypted)
    expect(decryptMercadoLibreSecret(encrypted)).toBe('APP_USR-token')

    const [version, iv, tag, data] = encrypted.split('.')
    const tampered = [version, iv, tag, data.slice(0, -2) + 'AA'].join('.')
    expect(() => decryptMercadoLibreSecret(tampered)).toThrow()
    expect(() => decryptMercadoLibreSecret('plain-text')).toThrow()
  })

  it('exchanges the authorization code with a form-encoded request', async () => {
    fetchMock.mockResolvedValue(jsonResponse(tokens))

    await expect(
      exchangeMercadoLibreCode(config, { code: 'TG-123', codeVerifier: 'verifier-1' }),
    ).resolves.toEqual(tokens)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.mercadolibre.com/oauth/token')
    expect(init.method).toBe('POST')
    expect(new Headers(init.headers).get('content-type')).toBe('application/x-www-form-urlencoded')
    expect(Object.fromEntries(new URLSearchParams(String(init.body)))).toEqual({
      grant_type: 'authorization_code',
      client_id: 'app-id',
      client_secret: 'app-secret',
      code: 'TG-123',
      redirect_uri: config.redirectUri,
      code_verifier: 'verifier-1',
    })
  })

  it('sends the refresh grant with the stored refresh token', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ...tokens, access_token: 'access-2' }))

    await refreshMercadoLibreToken(config, 'refresh-1')

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(Object.fromEntries(new URLSearchParams(String(init.body)))).toEqual({
      grant_type: 'refresh_token',
      client_id: 'app-id',
      client_secret: 'app-secret',
      refresh_token: 'refresh-1',
    })
  })

  it('raises a typed error when Mercado Libre rejects the token request', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'invalid_grant' }, 400))

    await expect(exchangeMercadoLibreCode(config, { code: 'bad' })).rejects.toBeInstanceOf(
      MercadoLibreApiError,
    )
  })

  it('rejects token responses that are missing fields', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ access_token: 'only-access' }))

    await expect(refreshMercadoLibreToken(config, 'refresh-1')).rejects.toBeInstanceOf(
      MercadoLibreApiError,
    )
  })

  it('stores encrypted tokens and keeps a single seller account', async () => {
    const connection = await saveMercadoLibreConnection(tokens, {
      nickname: 'HARRYS',
      connectedById: 'admin-1',
    })

    expect(tx.mercadoLibreConnection.deleteMany).toHaveBeenCalledWith({
      where: { mlUserId: { not: '123456' } },
    })
    const upsertArgs = tx.mercadoLibreConnection.upsert.mock.calls[0][0] as {
      where: { mlUserId: string }
      create: { accessToken: string; refreshToken: string; expiresAt: Date; nickname: string }
    }
    expect(upsertArgs.where).toEqual({ mlUserId: '123456' })
    expect(upsertArgs.create.nickname).toBe('HARRYS')
    expect(upsertArgs.create.accessToken).not.toBe('access-1')
    expect(decryptMercadoLibreSecret(upsertArgs.create.accessToken)).toBe('access-1')
    expect(decryptMercadoLibreSecret(upsertArgs.create.refreshToken)).toBe('refresh-1')
    expect(upsertArgs.create.expiresAt.getTime()).toBeGreaterThan(Date.now() + 21000 * 1000)
    expect(connection.id).toBe('conn-1')
  })

  it('returns the stored access token while it is still valid', async () => {
    prisma.mercadoLibreConnection.findFirst.mockResolvedValue({
      id: 'conn-1',
      accessToken: encryptMercadoLibreSecret('access-1'),
      refreshToken: encryptMercadoLibreSecret('refresh-1'),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      scope: null,
    })

    const result = await getMercadoLibreAccessToken()

    expect(result?.accessToken).toBe('access-1')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(prisma.mercadoLibreConnection.update).not.toHaveBeenCalled()
  })

  it('refreshes an expiring token and persists the rotated pair', async () => {
    prisma.mercadoLibreConnection.findFirst.mockResolvedValue({
      id: 'conn-1',
      accessToken: encryptMercadoLibreSecret('access-1'),
      refreshToken: encryptMercadoLibreSecret('refresh-1'),
      expiresAt: new Date(Date.now() + 60 * 1000),
      scope: 'offline_access',
    })
    fetchMock.mockResolvedValue(
      jsonResponse({ ...tokens, access_token: 'access-2', refresh_token: 'refresh-2' }),
    )
    prisma.mercadoLibreConnection.update.mockImplementation(async (args: { data: object }) => ({
      id: 'conn-1',
      ...args.data,
    }))

    const result = await getMercadoLibreAccessToken()

    expect(result?.accessToken).toBe('access-2')
    const updateArgs = prisma.mercadoLibreConnection.update.mock.calls[0][0] as {
      where: { id: string }
      data: { accessToken: string; refreshToken: string }
    }
    expect(updateArgs.where).toEqual({ id: 'conn-1' })
    expect(decryptMercadoLibreSecret(updateArgs.data.accessToken)).toBe('access-2')
    expect(decryptMercadoLibreSecret(updateArgs.data.refreshToken)).toBe('refresh-2')
  })

  it('returns null when no seller account is connected', async () => {
    prisma.mercadoLibreConnection.findFirst.mockResolvedValue(null)

    await expect(getMercadoLibreAccessToken()).resolves.toBeNull()
  })

  it('fails fast when the integration is not configured', async () => {
    vi.stubEnv('MERCADOLIBRE_CLIENT_ID', '')

    await expect(getMercadoLibreAccessToken()).rejects.toBeInstanceOf(
      MercadoLibreNotConfiguredError,
    )
  })
})
