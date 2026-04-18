import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AdminOrderList } from '@/components/admin/order-list'
import { OrderStatus } from '@prisma/client'

export const metadata: Metadata = { title: "Órdenes — Admin Harry's Boutique" }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    status?: string
    search?: string
    dateFrom?: string
    dateTo?: string
    paymentStatus?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {}

  if (params.status) {
    where.status = params.status as OrderStatus
  }

  if (params.paymentStatus) {
    where.payment = params.paymentStatus === 'paid'
  }

  if (params.search) {
    const search = params.search.toLowerCase()
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }

  if (params.dateFrom || params.dateTo) {
    where.createdAt = {}
    if (params.dateFrom) {
      where.createdAt.gte = new Date(params.dateFrom)
    }
    if (params.dateTo) {
      const dateTo = new Date(params.dateTo)
      dateTo.setHours(23, 59, 59, 999)
      where.createdAt.lte = dateTo
    }
  }

  const [orders, total, stats] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Órdenes</h1>
      </div>
      <AdminOrderList
        orders={orders.map((o) => ({
          id: o.id,
          amount: Number(o.amount),
          status: o.status,
          payment: o.payment,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
          addressSnapshot: o.addressSnapshot,
          couponCode: o.couponCode,
          discountAmount: o.discountAmount ? Number(o.discountAmount) : null,
          user: { name: o.user.name, email: o.user.email },
          items: o.items.map((i) => ({
            id: i.id,
            name: i.name,
            price: Number(i.price),
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            image: i.image,
          })),
        }))}
        total={total}
        page={page}
        limit={limit}
        stats={stats.map((s) => ({
          status: s.status,
          count: s._count.id,
          total: Number(s._sum.amount ?? 0),
        }))}
      />
    </div>
  )
}
