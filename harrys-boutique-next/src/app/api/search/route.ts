import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enforceRateLimit, handleApiError, requireAdminAuth } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  const { error, session } = await requireAdminAuth()
  if (error) return error

  const rateLimitError = await enforceRateLimit(req, {
    keyPrefix: 'admin:global-search',
    maxRequests: 120,
    windowMs: 60 * 1000,
    keySuffix: session!.user.id,
  })
  if (rateLimitError) return rateLimitError

  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.trim() ?? ''
    const type = searchParams.get('type') ?? 'all'

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], orders: [], users: [] })
    }

    const [products, orders, users] = await Promise.all([
      type === 'all' || type === 'products'
        ? prisma.product.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            select: { id: true, name: true, price: true, images: true, active: true, stock: true },
            take: 10,
          })
        : Promise.resolve([]),

      type === 'all' || type === 'orders'
        ? prisma.order.findMany({
            where: {
              OR: [
                { id: { contains: query, mode: 'insensitive' } },
                { user: { name: { contains: query, mode: 'insensitive' } } },
                { user: { email: { contains: query, mode: 'insensitive' } } },
              ],
            },
            select: {
              id: true,
              status: true,
              amount: true,
              createdAt: true,
              user: { select: { name: true, email: true } },
            },
            take: 10,
          })
        : Promise.resolve([]),

      type === 'all' || type === 'users'
        ? prisma.user.findMany({
            where: {
              role: 'USER',
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            take: 10,
          })
        : Promise.resolve([]),
    ])

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.images[0] ?? null,
        active: p.active,
        stock: p.stock,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        amount: Number(o.amount),
        createdAt: o.createdAt.toISOString(),
        customer: { name: o.user.name, email: o.user.email },
      })),
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
      })),
    })
  } catch (e) {
    return handleApiError(e)
  }
}
