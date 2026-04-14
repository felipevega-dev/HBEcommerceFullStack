import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { AdminProductList } from '@/components/admin/product-list'

export const metadata: Metadata = { title: "Productos — Admin Harry's Boutique" }

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const where = params.search
    ? { name: { contains: params.search, mode: 'insensitive' as const } }
    : {}

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>
      <AdminProductList
        products={serialize(products).map((p) => ({ ...p, price: Number(p.price) }))}
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  )
}
