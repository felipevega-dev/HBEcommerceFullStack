import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { AdminProductList } from '@/components/admin/product-list'

export const metadata: Metadata = { title: "Productos - Admin Harry's Boutique" }

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    subCategory?: string
    status?: string
    stock?: string
    bestSeller?: string
    mercadoLibre?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {
    ...(params.search ? { name: { contains: params.search, mode: 'insensitive' as const } } : {}),
    ...(params.category ? { category: { name: params.category } } : {}),
    ...(params.subCategory ? { subCategory: params.subCategory } : {}),
    ...(params.status === 'active' ? { active: true } : {}),
    ...(params.status === 'inactive' ? { active: false } : {}),
    ...(params.bestSeller === 'true' ? { bestSeller: true } : {}),
    ...(params.stock === 'out' ? { stock: 0 } : {}),
    ...(params.stock === 'low' ? { stock: { gt: 0, lte: 5 } } : {}),
    ...(params.stock === 'available' ? { stock: { gt: 5 } } : {}),
    ...(params.mercadoLibre === 'published' ? { mercadoLibreUrl: { not: null } } : {}),
    ...(params.mercadoLibre === 'unpublished' ? { mercadoLibreUrl: null } : {}),
  }

  const [rawProducts, total, rawCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } }, _count: { select: { variants: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, subcategories: true },
    }),
  ])

  const products = rawProducts.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    images: product.images,
    active: product.active,
    bestSeller: product.bestSeller,
    stock: product.stock,
    subCategory: product.subCategory,
    category: product.category,
    variantCount: product._count.variants,
    mercadoLibreUrl: product.mercadoLibreUrl,
  }))

  return (
    <div className="space-y-6">
      <div className="ui-page-header">
        <div>
          <p className="ui-eyebrow">CatÃ¡logo</p>
          <h1 className="mt-1 text-3xl">Productos</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new/bulk"
            className="ui-button ui-button-secondary"
            title="Importar productos desde CSV"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Importar CSV
          </Link>

          <Link href="/admin/products/wizard/new" className="ui-button ui-button-primary">
            + Nuevo producto
          </Link>
        </div>
      </div>
      <AdminProductList
        products={products}
        total={total}
        page={page}
        limit={limit}
        categories={rawCategories}
      />
    </div>
  )
}
