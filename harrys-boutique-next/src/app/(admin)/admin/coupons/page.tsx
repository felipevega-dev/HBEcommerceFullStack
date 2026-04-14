import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AdminCouponList } from '@/components/admin/coupon-list'

export const metadata: Metadata = { title: "Cupones — Admin Harry's Boutique" }

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cupones</h1>
      <AdminCouponList
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          discountType: c.discountType,
          discountValue: Number(c.discountValue),
          minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
          maxUses: c.maxUses,
          usedCount: c.usedCount,
          expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
          active: c.active,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
