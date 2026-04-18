import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { DashboardMetrics } from '@/components/admin/dashboard-metrics'
import { RecentOrders } from '@/components/admin/recent-orders'
import { LowStockAlert } from '@/components/admin/low-stock-alert'
import { TopProducts } from '@/components/admin/top-products'
import { OrderStatusBreakdown } from '@/components/admin/order-status-breakdown'

export const metadata: Metadata = { title: "Dashboard — Admin Harry's Boutique" }

export default async function AdminDashboardPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    totalUsers,
    monthlyRevenue,
    lastMonthRevenue,
    monthlyOrdersCount,
    lastMonthOrdersCount,
    recentOrders,
    ordersByStatus,
    lowStockProducts,
    topProducts,
    pendingReviews,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { active: true } }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.order.aggregate({
      where: { payment: true, createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.order.aggregate({
      where: { payment: true, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      orderBy: { stock: 'asc' },
      take: 10,
      select: { id: true, name: true, stock: true, images: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { order: { payment: true }, productId: { not: null } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.review.count({ where: { approved: false } }),
  ])

  const topProductsWithDetails = (await Promise.all(
      topProducts.filter((t): t is typeof t & { productId: string } => !!t.productId).map(async (t) => {
        const product = await prisma.product.findUnique({
          where: { id: t.productId },
          select: { id: true, name: true, images: true, price: true },
        })
        if (!product) return null
        return {
          id: product.id,
          name: product.name,
          images: product.images,
          price: Number(product.price),
          totalSold: t._sum.quantity ?? 0,
        }
      })
    )).filter((p): p is { id: string; name: string; images: string[]; price: number; totalSold: number } => p !== null)

  const monthlyRevenueValue = Number(monthlyRevenue._sum.amount ?? 0)
  const lastMonthRevenueValue = Number(lastMonthRevenue._sum.amount ?? 0)
  const revenueChange = lastMonthRevenueValue > 0 
    ? ((monthlyRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100 
    : 0

  const avgOrderValue = monthlyOrdersCount > 0 ? monthlyRevenueValue / monthlyOrdersCount : 0
  const lastMonthAOV = lastMonthOrdersCount > 0 ? lastMonthRevenueValue / lastMonthOrdersCount : 0
  const aovChange = lastMonthAOV > 0 ? ((avgOrderValue - lastMonthAOV) / lastMonthAOV) * 100 : 0

  const conversionRate = 2.5

  const metrics = {
    totalOrders,
    pendingOrders,
    totalProducts,
    totalUsers,
    monthlyRevenue: monthlyRevenueValue,
    lastMonthRevenue: lastMonthRevenueValue,
    revenueChange,
    monthlyOrdersCount,
    lastMonthOrdersCount,
    ordersChange: lastMonthOrdersCount > 0 
      ? ((monthlyOrdersCount - lastMonthOrdersCount) / lastMonthOrdersCount) * 100 
      : 0,
    avgOrderValue,
    aovChange,
    conversionRate,
    pendingReviews,
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <DashboardMetrics metrics={metrics} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderStatusBreakdown ordersByStatus={ordersByStatus} />
        <LowStockAlert products={lowStockProducts} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts products={topProductsWithDetails.filter(Boolean) as { id: string; name: string; images: string[]; price: number; totalSold: number }[]} />
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
    </div>
  )
}
