import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import type { Role } from '@prisma/client'
import { getSiteUrl } from '@/lib/site'
import { getClientIp, getRateLimitState, RateLimitUnavailableError } from '@/lib/rate-limiter'

const ADMIN_ROLES: Role[] = ['OWNER', 'ADMIN', 'MODERATOR']

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function getSession() {
  return auth()
}

export async function requireAuth(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return {
      error: NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 }),
    }
  }
  return { session }
}

export async function requireAdminAuth() {
  const session = await auth()
  if (!session?.user) {
    return {
      error: NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 }),
    }
  }
  if (!ADMIN_ROLES.includes(session.user.role)) {
    return {
      error: NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 }),
    }
  }
  return { session }
}

export async function protectMutation(
  req: NextRequest,
  options: { keyPrefix: string; maxRequests: number; windowMs: number; keySuffix?: string },
) {
  const originError = requireTrustedOrigin(req)
  if (originError) return originError

  return enforceRateLimit(req, options)
}

export function requireTrustedOrigin(req: NextRequest) {
  const candidate = req.headers.get('origin') ?? req.headers.get('referer')

  if (!candidate) {
    return NextResponse.json({ success: false, message: 'Origen no permitido' }, { status: 403 })
  }

  let requestOrigin: string
  try {
    requestOrigin = new URL(candidate).origin
  } catch {
    return NextResponse.json({ success: false, message: 'Origen no permitido' }, { status: 403 })
  }

  const allowedOrigins = new Set<string>([req.nextUrl.origin])

  try {
    allowedOrigins.add(new URL(getSiteUrl()).origin)
  } catch {
    // Ignore invalid env value and fall back to request origin.
  }

  if (!allowedOrigins.has(requestOrigin)) {
    return NextResponse.json({ success: false, message: 'Origen no permitido' }, { status: 403 })
  }

  return null
}

export async function enforceRateLimit(
  req: NextRequest,
  options: { keyPrefix: string; maxRequests: number; windowMs: number; keySuffix?: string },
) {
  const key = `${options.keyPrefix}:${options.keySuffix ?? getClientIp(req)}`
  let result: Awaited<ReturnType<typeof getRateLimitState>>
  try {
    result = await getRateLimitState(key, options.maxRequests, options.windowMs)
  } catch (error) {
    if (error instanceof RateLimitUnavailableError || process.env.NODE_ENV === 'production') {
      console.error('[Rate limit] Distributed limiter unavailable', error)
      return NextResponse.json(
        { success: false, message: 'Servicio temporalmente no disponible. Intenta nuevamente.' },
        { status: 503 },
      )
    }

    throw error
  }

  if (result.allowed) return null

  const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))

  return NextResponse.json(
    { success: false, message: 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Remaining': '0',
      },
    },
  )
}

// ─── Validation ───────────────────────────────────────────────────────────────

export async function validateBody<T>(req: NextRequest, schema: z.ZodSchema<T>) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return {
        error: NextResponse.json(
          { success: false, errors: parsed.error.flatten().fieldErrors },
          { status: 400 },
        ),
      }
    }
    return { data: parsed.data }
  } catch {
    return {
      error: NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 }),
    }
  }
}

// ─── Error handler ────────────────────────────────────────────────────────────

export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error)
  const message =
    process.env.NODE_ENV === 'development' ? String(error) : 'Error interno del servidor'
  return NextResponse.json({ success: false, message }, { status: 500 })
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
