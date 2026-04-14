import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AdminOrderList } from '@/components/admin/order-list'
import { OrderStatus } from '@prisma/client'

export const metadata: Metadata = { title: "Órdenes — Admin Harry's Boutique" }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const where = params.status ? { status: params.status as OrderStatus } : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Órdenes</h1>
      <AdminOrderList
        orders={orders.map((o) => ({
          id: o.id,
          amount: Number(o.amount),
          status: o.status,
          payment: o.payment,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt.toISOString(),
          addressSnapshot: o.addressSnapshot,
          user: { name: o.user.name, email: o.user.email },
          items: o.items.map((i) => ({
            id: i.id,
            name: i.name,
            price: Number(i.price),
            quantity: i.quantity,
            size: i.size,
            image: i.image,
          })),
        }))}
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  )
}
