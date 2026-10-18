import { createHmac, timingSafeEqual } from 'node:crypto'
import { getSiteUrl } from '@/lib/site'

/**
 * Guest checkout access: an order placed without an account can be viewed by
 * whoever holds its HMAC token, either from the cookie set at checkout or from
 * the link sent by email. Tokens are derived, never stored.
 */
export const GUEST_ORDER_COOKIE = 'hb_guest_orders'
export const GUEST_ORDER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

const MAX_REMEMBERED_ORDERS = 10
const ENTRY_SEPARATOR = ','
const TOKEN_SEPARATOR = ':'

function getSigningKey() {
  const secret = process.env.GUEST_ORDER_SECRET?.trim() || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('Falta NEXTAUTH_SECRET para firmar el acceso de invitados a sus pedidos')
  }
  return createHmac('sha256', secret).update('harrys-boutique:guest-orders').digest()
}

export function createGuestOrderToken(orderId: string) {
  return createHmac('sha256', getSigningKey()).update(orderId).digest('base64url')
}

export function verifyGuestOrderToken(orderId: string, token: string | null | undefined) {
  if (!orderId || !token) return false
  const expected = Buffer.from(createGuestOrderToken(orderId))
  const received = Buffer.from(token)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

/** Returns the order ids in the cookie whose tokens verify, most recent first. */
export function parseGuestOrderCookie(value: string | null | undefined): string[] {
  if (!value) return []

  const ids: string[] = []
  for (const entry of value.split(ENTRY_SEPARATOR)) {
    const [orderId, token] = entry.split(TOKEN_SEPARATOR)
    if (orderId && token && !ids.includes(orderId) && verifyGuestOrderToken(orderId, token)) {
      ids.push(orderId)
    }
  }
  return ids
}

export function hasGuestOrderAccess(cookieValue: string | null | undefined, orderId: string) {
  return parseGuestOrderCookie(cookieValue).includes(orderId)
}

/** New cookie value with `orderId` first; keeps the last few guest orders. */
export function appendGuestOrder(cookieValue: string | null | undefined, orderId: string) {
  const ids = [orderId, ...parseGuestOrderCookie(cookieValue).filter((id) => id !== orderId)]
  return ids
    .slice(0, MAX_REMEMBERED_ORDERS)
    .map((id) => `${id}${TOKEN_SEPARATOR}${createGuestOrderToken(id)}`)
    .join(ENTRY_SEPARATOR)
}

export function guestOrderCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: GUEST_ORDER_COOKIE_MAX_AGE,
  }
}

/** Absolute URL for the order page; guest orders carry their access token. */
export function getOrderTrackingUrl(order: { id: string; userId: string | null }) {
  const url = new URL(`/orders/${order.id}`, getSiteUrl())
  if (!order.userId) url.searchParams.set('token', createGuestOrderToken(order.id))
  return url.toString()
}
