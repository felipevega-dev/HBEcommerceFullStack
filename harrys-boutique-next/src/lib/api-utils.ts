import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import type { Role } from '@prisma/client'

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
