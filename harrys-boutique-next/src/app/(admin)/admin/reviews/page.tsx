import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ReviewsManager } from '@/components/admin/reviews-manager'

export const metadata: Metadata = { title: "Reseñas — Admin Harry's Boutique" }

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit
  const approved =
    params.status === 'pending' ? false : params.status === 'approved' ? true : undefined

  const where = approved !== undefined ? { approved } : {}

  const [reviews, total, pendingCount] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.review.count({ where: { approved: false } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Reseñas</h1>
        {pendingCount > 0 && (
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <ReviewsManager
        reviews={reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          approved: r.approved,
          createdAt: r.createdAt.toISOString(),
          user: { name: r.user.name, email: r.user.email },
          product: { id: r.product.id, name: r.product.name },
        }))}
        total={total}
        page={page}
        limit={limit}
        currentStatus={params.status}
      />
    </div>
  )
}
