import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { canUseDatabaseFallback, logDatabaseFallback } from '@/lib/db-fallback'
import {
  buildProductOrderBy,
  buildProductWhere,
  type CollectionParams,
} from '@/lib/collection-params'

const COLLECTION_PAGE_SIZE = 12

const getCachedCategories = unstable_cache(
  async () => prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ['collection-categories'],
  { revalidate: 300, tags: ['collection'] },
)

const getCachedCollectionFacets = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { colors: true, sizes: true },
    })

    const colors = [...new Set(products.flatMap((product) => product.colors))].sort()
    const sizes = [
      ...new Set(
        products.flatMap((product) =>
          Array.isArray(product.sizes) ? (product.sizes as string[]) : [],
        ),
      ),
    ]

    return { colors, sizes }
  },
  ['collection-facets'],
  { revalidate: 300, tags: ['collection'] },
)

const getCachedCollectionListing = unstable_cache(
  async (params: CollectionParams) => {
    const page = Math.max(1, parseInt(params.page ?? '1'))
    const skip = (page - 1) * COLLECTION_PAGE_SIZE
    const sort = params.sort ?? 'latest'
    const where = buildProductWhere(params)
    const orderBy = buildProductOrderBy(sort)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: COLLECTION_PAGE_SIZE,
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
    ])

    return {
      page,
      sort,
      total,
      totalPages: Math.ceil(total / COLLECTION_PAGE_SIZE),
      products: products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price.toNumber(),
        originalPrice: product.originalPrice != null ? product.originalPrice.toNumber() : undefined,
        images: product.images,
        ratingAverage: product.ratingAverage,
        ratingCount: product.ratingCount,
        bestSeller: product.bestSeller,
      })),
    }
  },
  ['collection-listing'],
  { revalidate: 300, tags: ['collection'] },
)

export async function getCollectionPageData(params: CollectionParams) {
  try {
    const [categories, facets, listing] = await Promise.all([
      getCachedCategories(),
      getCachedCollectionFacets(),
      getCachedCollectionListing(params),
    ])

    return {
      categories,
      uniqueColors: facets.colors,
      uniqueSizes: facets.sizes,
      ...listing,
    }
  } catch (error) {
    if (!canUseDatabaseFallback(error)) throw error

    logDatabaseFallback('CollectionPageData', error)
    return {
      categories: [],
      uniqueColors: [],
      uniqueSizes: [],
      page: Math.max(1, parseInt(params.page ?? '1')),
      sort: params.sort ?? 'latest',
      total: 0,
      totalPages: 0,
      products: [],
    }
  }
}

export { COLLECTION_PAGE_SIZE }
