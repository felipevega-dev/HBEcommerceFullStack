import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { auth } from '@/auth'
import {
  buildProductOrderBy,
  buildProductWhere,
  splitParam,
  type CollectionParams,
} from '@/lib/collection-params'
import { CollectionFilters } from '@/components/store/collection-filters'
import { ProductGrid } from '@/components/store/product-grid'
import { SortSelect } from '@/components/store/sort-select'
import { SearchInput } from '@/components/store/search-input'

export const metadata: Metadata = {
  title: "Colecciones — Harry's Boutique",
  description: 'Explora toda nuestra colección de ropa y accesorios para mascotas.',
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<CollectionParams>
}) {
  const params = await searchParams
  const session = await auth()

  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 12
  const skip = (page - 1) * limit
  const sort = params.sort ?? 'latest'

  const selectedColors = splitParam(params.colors)
  const selectedSizes = splitParam(params.sizes)

  const where = buildProductWhere(params)
  const orderBy = buildProductOrderBy(sort)

  const [products, total, categories, allProducts, wishlistIds] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        originalPrice: true,
        images: true,
        ratingAverage: true,
        ratingCount: true,
        bestSeller: true,
        colors: true,
        sizes: true,
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: { active: true },
      select: { colors: true, sizes: true },
    }),
    session?.user?.id
      ? prisma.wishlist.findMany({
          where: { userId: session.user.id },
          select: { productId: true },
        })
      : Promise.resolve([]),
  ])

  // Filter by colors/sizes after fetching (stored as JSON arrays in DB)
  const filteredProducts =
    selectedColors.length > 0 || selectedSizes.length > 0
      ? products.filter((p) => {
          const productSizes = Array.isArray(p.sizes) ? (p.sizes as string[]) : []
          const colorMatch =
            selectedColors.length === 0 || p.colors.some((c) => selectedColors.includes(c))
          const sizeMatch =
            selectedSizes.length === 0 || productSizes.some((s) => selectedSizes.includes(s))
          return colorMatch && sizeMatch
        })
      : products

  const serializedProducts = filteredProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price.toNumber(),
    originalPrice: p.originalPrice != null ? p.originalPrice.toNumber() : undefined,
    images: p.images,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    bestSeller: p.bestSeller,
  }))
  const serializedCategories = serialize(categories)
  const wishlistSet = new Set(wishlistIds.map((w) => w.productId))

  const uniqueColors = [...new Set(allProducts.flatMap((p) => p.colors))].sort()
  const uniqueSizes = [
    ...new Set(allProducts.flatMap((p) => (Array.isArray(p.sizes) ? (p.sizes as string[]) : []))),
  ]

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="pt-6">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="flex gap-2 text-sm text-[var(--color-text-muted)]">
          <li>
            <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[var(--color-text-primary)]">
            Colecciones
          </li>
        </ol>
      </nav>

      <div className="mb-8 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-medium mb-2">Colecciones</h1>
        <p className="text-[var(--color-text-secondary)]">
          Descubrí nuestra colección completa de ropa y accesorios para mascotas
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-8">
        <CollectionFilters
          categories={serializedCategories}
          colors={uniqueColors}
          sizes={uniqueSizes}
          currentParams={params}
        />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {total} {total === 1 ? 'producto' : 'productos'}
            </p>
            <div className="flex items-center gap-3">
              <Suspense>
                <SearchInput defaultValue={params.search} />
              </Suspense>
              <SortSelect current={sort} />
            </div>
          </div>
          <ProductGrid
            products={serializedProducts}
            currentPage={page}
            totalPages={totalPages}
            total={total}
            sort={sort}
            wishlistSet={wishlistSet}
          />
        </div>
      </div>
    </div>
  )
}
