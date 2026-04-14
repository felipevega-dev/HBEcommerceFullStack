/**
 * Shared type and parser for collection/catalog search params.
 * Used by collection/page.tsx, collection-filters.tsx, and the products API.
 */

export interface CollectionParams {
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

export type CollectionParamsResolved = Record<string, string | undefined>

/** Parse raw searchParams into a typed, sanitized CollectionParams object */
export function parseCollectionParams(raw: CollectionParamsResolved): CollectionParams {
  return {
    category: raw.category || undefined,
    subCategory: raw.subCategory || undefined,
    colors: raw.colors || undefined,
    sizes: raw.sizes || undefined,
    minPrice: raw.minPrice || undefined,
    maxPrice: raw.maxPrice || undefined,
    sort: raw.sort || undefined,
    page: raw.page || undefined,
    search: raw.search || undefined,
    bestSeller: raw.bestSeller || undefined,
  }
}

/** Split a comma-separated param value into an array, filtering empty strings */
export function splitParam(value: string | undefined): string[] {
  if (!value) return []
  return value.split(',').filter(Boolean)
}

/** Build a Prisma `where` clause from CollectionParams */
export function buildProductWhere(params: CollectionParams) {
  const selectedCategories = splitParam(params.category)
  const selectedSubcategories = splitParam(params.subCategory)

  return {
    active: true,
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: 'insensitive' as const } },
        { description: { contains: params.search, mode: 'insensitive' as const } },
      ],
    }),
    ...(selectedCategories.length > 0 && {
      category: { name: { in: selectedCategories } },
    }),
    ...(selectedSubcategories.length > 0 && {
      subCategory: { in: selectedSubcategories },
    }),
    ...(params.bestSeller === 'true' && { bestSeller: true }),
    ...((params.minPrice || params.maxPrice) && {
      price: {
        ...(params.minPrice && { gte: parseFloat(params.minPrice) }),
        ...(params.maxPrice && { lte: parseFloat(params.maxPrice) }),
      },
    }),
  }
}

/** Build a Prisma `orderBy` clause from a sort string */
export function buildProductOrderBy(sort: string) {
  switch (sort) {
    case 'price_asc':
      return { price: 'asc' as const }
    case 'price_desc':
      return { price: 'desc' as const }
    case 'rating':
      return { ratingAverage: 'desc' as const }
    case 'oldest':
      return { createdAt: 'asc' as const }
    default:
      return { createdAt: 'desc' as const }
  }
}
