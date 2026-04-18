import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AdminCustomerList } from '@/components/admin/customer-list'

export const metadata: Metadata = { title: "Clientes — Admin Harry's Boutique" }

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; segment?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const where = {
    role: 'USER' as const,
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: 'insensitive' as const } },
        { email: { contains: params.search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const allUsers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      orders: {
        select: { amount: true, createdAt: true, status: true },
        where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      },
    },
  }) as unknown as {
    id: string
    name: string
    email: string
    role: string
    tags: string[]
    createdAt: Date
    orders: { amount: { toNumber: () => number }; createdAt: Date; status: string }[]
  }[]

  const now = new Date()
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const calculateSegment = (user: {
    createdAt: Date
    orders: { amount: { toNumber: () => number }; createdAt: Date; status: string }[]
  }): string => {
    const totalSpent = user.orders.reduce((sum, o) => sum + o.amount.toNumber(), 0)
    const orderCount = user.orders.length
    const lastOrderDate = user.orders[0]?.createdAt
    const recentOrders = user.orders.filter((o) => o.createdAt > oneMonthAgo).length

    if (totalSpent >= 500000) return 'vip'
    if (orderCount >= 5) return 'frequent'
    if (recentOrders === 0 && lastOrderDate && lastOrderDate < new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)) return 'at_risk'
    if (orderCount === 0 || (orderCount === 1 && now.getTime() - user.createdAt.getTime() < 30 * 24 * 60 * 60 * 1000)) return 'new'
    return 'regular'
  }

  const usersWithSegment = allUsers.map((u) => {
    const totalSpent = u.orders.reduce((sum, o) => sum + o.amount.toNumber(), 0)
    const orderCount = u.orders.length
    const lastOrderDate = u.orders[0]?.createdAt

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      tags: u.tags,
      segment: calculateSegment(u),
      clv: totalSpent,
      orderCount,
      lastOrderDate: lastOrderDate?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    }
  })

  let filteredUsers = usersWithSegment
  if (params.segment) {
    filteredUsers = usersWithSegment.filter((u) => u.segment === params.segment)
  }

  const total = filteredUsers.length
  const paginatedUsers = filteredUsers.slice(skip, skip + limit)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <AdminCustomerList
        users={paginatedUsers}
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  )
}