// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  appendGuestOrder,
  createGuestOrderToken,
  getOrderTrackingUrl,
  hasGuestOrderAccess,
  parseGuestOrderCookie,
  verifyGuestOrderToken,
} from '../guest-orders'

const ORDER_A = '0b6f8d7e-5c1a-4d3b-9e2f-1a2b3c4d5e6f'
const ORDER_B = '9c1d2e3f-4a5b-4c6d-8e7f-0a1b2c3d4e5f'

describe('guest order access tokens', () => {
  beforeEach(() => {
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret-with-at-least-32-characters')
    vi.stubEnv('GUEST_ORDER_SECRET', '')
    vi.stubEnv('NEXT_PUBLIC_FRONTEND_URL', 'https://harrys.test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates deterministic, URL-safe tokens bound to the order id', () => {
    const token = createGuestOrderToken(ORDER_A)

    expect(token).toMatch(/^[A-Za-z0-9_-]{40,}$/)
    expect(createGuestOrderToken(ORDER_A)).toBe(token)
    expect(createGuestOrderToken(ORDER_B)).not.toBe(token)
  })

  it('verifies only the token of the same order and secret', () => {
    const token = createGuestOrderToken(ORDER_A)

    expect(verifyGuestOrderToken(ORDER_A, token)).toBe(true)
    expect(verifyGuestOrderToken(ORDER_B, token)).toBe(false)
    expect(verifyGuestOrderToken(ORDER_A, token.slice(0, -1) + 'x')).toBe(false)
    expect(verifyGuestOrderToken(ORDER_A, '')).toBe(false)
    expect(verifyGuestOrderToken(ORDER_A, null)).toBe(false)

    vi.stubEnv('NEXTAUTH_SECRET', 'another-secret-with-at-least-32-characters')
    expect(verifyGuestOrderToken(ORDER_A, token)).toBe(false)
  })

  it('keeps the most recent guest orders first in the cookie and drops forged entries', () => {
    const first = appendGuestOrder(undefined, ORDER_A)
    const second = appendGuestOrder(`${first},${ORDER_B}:forged`, ORDER_B)

    expect(parseGuestOrderCookie(second)).toEqual([ORDER_B, ORDER_A])
    expect(hasGuestOrderAccess(second, ORDER_A)).toBe(true)
    expect(hasGuestOrderAccess(`${ORDER_B}:forged`, ORDER_B)).toBe(false)
    expect(parseGuestOrderCookie(undefined)).toEqual([])
    expect(parseGuestOrderCookie('garbage')).toEqual([])
  })

  it('remembers at most ten guest orders', () => {
    let cookie: string | undefined
    const ids = Array.from({ length: 12 }, (_, index) => `order-${index}`)
    for (const id of ids) cookie = appendGuestOrder(cookie, id)

    const remembered = parseGuestOrderCookie(cookie)
    expect(remembered).toHaveLength(10)
    expect(remembered[0]).toBe('order-11')
    expect(remembered).not.toContain('order-0')
  })

  it('adds the access token only to guest order links', () => {
    const guestUrl = new URL(getOrderTrackingUrl({ id: ORDER_A, userId: null }))
    expect(guestUrl.origin + guestUrl.pathname).toBe(`https://harrys.test/orders/${ORDER_A}`)
    expect(verifyGuestOrderToken(ORDER_A, guestUrl.searchParams.get('token'))).toBe(true)

    expect(getOrderTrackingUrl({ id: ORDER_A, userId: 'user-1' })).toBe(
      `https://harrys.test/orders/${ORDER_A}`,
    )
  })

  it('prefers a dedicated GUEST_ORDER_SECRET when it is configured', () => {
    const withNextAuth = createGuestOrderToken(ORDER_A)
    vi.stubEnv('GUEST_ORDER_SECRET', 'dedicated-guest-order-secret-value')

    expect(createGuestOrderToken(ORDER_A)).not.toBe(withNextAuth)
  })
})
