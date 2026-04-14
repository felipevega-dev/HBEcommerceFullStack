import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { DashboardMetrics } from '@/components/admin/dashboard-metrics'
import { RecentOrders } from '@/components/admin/recent-orders'

export const metadata: Metadata = { title: "Dashboard — Admin Harry's Boutique" }

export default async function AdminDashboardPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalOrders, pendingOrders, totalProducts, totalUsers, monthlyRevenue, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.aggregate({
        where: { payment: true, createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ])

  const metrics = {
    totalOrders,
    pendingOrders,
    totalProducts,
    totalUsers,
    monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <DashboardMetrics metrics={metrics} />
      <RecentOrders
        orders={recentOrders.map((o) => ({
          id: o.id,
          amount: Number(o.amount),
          status: o.status,
          createdAt: o.createdAt.toISOString(),
          user: { name: o.user.name, email: o.user.email },
        }))}
      />
    </div>
  )
}
