

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

  const [rawProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  // Manually serialize products to avoid passing functions to client components
  const products = rawProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    images: p.images,
    active: p.active,
    bestSeller: p.bestSeller,
    stock: p.stock,
    subCategory: p.subCategory,
    category: p.category,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <div className="flex gap-3">
          {/* Bulk Import - Coming Soon */}
          <button
            disabled
            className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm cursor-not-allowed flex items-center gap-2"
            title="Próximamente: Importar productos desde Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Importar Excel
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Próximamente</span>
          </button>
          
          {/* Create New Product */}
          <Link
            href="/admin/products/new"
            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
          >
            + Nuevo producto
          </Link>
        </div>
      </div>
      <AdminProductList
        products={products}
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  )
}
