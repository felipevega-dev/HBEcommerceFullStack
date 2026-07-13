import { unstable_cache } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { canUseDatabaseFallback, logDatabaseFallback } from '@/lib/db-fallback'
import {
  buildProductOrderBy,
  buildProductWhere,
  splitParam,
  type CollectionParams,
} from '@/lib/collection-params'

const COLLECTION_PAGE_SIZE = 12

export interface CollectionFacet {
  value: string
  count: number
}

const getCachedCategories = unstable_cache(
  async () => prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ['collection-categories'],
  { revalidate: 300, tags: ['collection'] },
)

function buildFacetConditions(params: CollectionParams, excludedFacet: 'colors' | 'sizes') {
  const selectedCategories = splitParam(params.category)
  const selectedSubcategories = splitParam(params.subCategory)
  const selectedColors = splitParam(params.colors)
  const selectedSizes = splitParam(params.sizes)
  const conditions: Prisma.Sql[] = [Prisma.sql`p."active" = true`]

  if (params.search) {
    const search = `%${params.search}%`
    conditions.push(Prisma.sql`(p."name" ILIKE ${search} OR p."description" ILIKE ${search})`)
  }
  if (selectedCategories.length) {
    conditions.push(Prisma.sql`c."name" IN (${Prisma.join(selectedCategories)})`)
  }
  if (selectedSubcategories.length) {
    conditions.push(Prisma.sql`p."subCategory" IN (${Prisma.join(selectedSubcategories)})`)
  }
  if (params.bestSeller === 'true') {
    conditions.push(Prisma.sql`p."bestSeller" = true`)
  }
  if (excludedFacet !== 'colors' && selectedColors.length) {
    conditions.push(Prisma.sql`p."colors" && ARRAY[${Prisma.join(selectedColors)}]::text[]`)
  }
  if (excludedFacet !== 'sizes' && selectedSizes.length) {
    conditions.push(Prisma.sql`p."sizes" @> ${JSON.stringify(selectedSizes)}::jsonb`)
  }
  if (params.minPrice) {
    conditions.push(Prisma.sql`p."price" >= ${Number(params.minPrice)}`)
  }
  if (params.maxPrice) {
    conditions.push(Prisma.sql`p."price" <= ${Number(params.maxPrice)}`)
  }

  return Prisma.join(conditions, ' AND ')
}

const getCachedCollectionFacets = unstable_cache(
  async (params: CollectionParams) => {
    const [colors, sizes] = await Promise.all([
      prisma.$queryRaw<Array<{ value: string; count: bigint }>>(Prisma.sql`
        SELECT facet.value, COUNT(DISTINCT p."id") AS count
        FROM "products" p
        INNER JOIN "categories" c ON c."id" = p."categoryId"
        CROSS JOIN LATERAL unnest(p."colors") AS facet(value)
        WHERE ${buildFacetConditions(params, 'colors')}
        GROUP BY facet.value
        ORDER BY facet.value ASC
      `),
      prisma.$queryRaw<Array<{ value: string; count: bigint }>>(Prisma.sql`
        SELECT facet.value, COUNT(DISTINCT p."id") AS count
        FROM "products" p
        INNER JOIN "categories" c ON c."id" = p."categoryId"
        CROSS JOIN LATERAL jsonb_array_elements_text(p."sizes") AS facet(value)
        WHERE ${buildFacetConditions(params, 'sizes')}
        GROUP BY facet.value
        ORDER BY facet.value ASC
      `),
    ])

    return {
      colors: colors.map((facet) => ({ value: facet.value, count: Number(facet.count) })),
      sizes: sizes.map((facet) => ({ value: facet.value, count: Number(facet.count) })),
    }
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
      getCachedCollectionFacets(params),
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
