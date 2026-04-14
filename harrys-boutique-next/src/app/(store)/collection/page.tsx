import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { auth } from '@/auth'
import { CollectionFilters } from '@/components/store/collection-filters'
import { ProductGrid } from '@/components/store/product-grid'
import { SortSelect } from '@/components/store/sort-select'
import { SearchInput } from '@/components/store/search-input'

export const metadata: Metadata = {
  title: "Colecciones — Harry's Boutique",
  description: 'Explora toda nuestra colección de ropa y accesorios para mascotas.',
}

interface SearchParams {
  category?: string
  subCategory?: string
  colors?: string
  sizes?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  page?: string
  search?: string
  bestSeller?: string
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const session = await auth()
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 12
  const skip = (page - 1) * limit

  const selectedCategories = params.category ? params.category.split(',') : []
  const selectedSubcategories = params.subCategory ? params.subCategory.split(',') : []
  const selectedColors = params.colors ? params.colors.split(',') : []
  const selectedSizes = params.sizes ? params.sizes.split(',') : []

  const where = {
    active: true,
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: 'insensitive' as const } },
        { description: { contains: params.search, mode: 'insensitive' as const } },
      ],
    }),
    ...(selectedCategories.length > 0 && { category: { name: { in: selectedCategories } } }),
    ...(selectedSubcategories.length > 0 && { subCategory: { in: selectedSubcategories } }),
    ...(params.bestSeller === 'true' && { bestSeller: true }),
    ...((params.minPrice || params.maxPrice) && {
      price: {
        ...(params.minPrice && { gte: parseFloat(params.minPrice) }),
        ...(params.maxPrice && { lte: parseFloat(params.maxPrice) }),
      },
    }),
  }

  const sort = params.sort ?? 'latest'
  const orderBy =
    sort === 'price_asc'
      ? { price: 'asc' as const }
      : sort === 'price_desc'
        ? { price: 'desc' as const }
        : sort === 'rating'
          ? { ratingAverage: 'desc' as const }
          : { createdAt: 'desc' as const }

  const [products, total, categories, allProducts, wishlistIds] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit }),
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

  // Filter by colors/sizes after fetching (since they're arrays in JSON)
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

  // Serialize Decimal fields before passing to Client Components
  const serializedProducts = serialize(filteredProducts).map((p) => ({
    ...p,
    price: Number(p.price),
  }))
  const serializedCategories = serialize(categories)

  // Build wishlist set for fast lookup
  const wishlistSet = new Set(wishlistIds.map((w) => w.productId))

  // Extract unique colors and sizes from all products
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

      {/* Page header */}
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
