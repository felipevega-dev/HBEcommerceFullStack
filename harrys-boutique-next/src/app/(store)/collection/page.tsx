import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { serialize } from '@/lib/serialize'
import { type CollectionParams } from '@/lib/collection-params'
import { CollectionFilters } from '@/components/store/collection-filters'
import { ProductGrid } from '@/components/store/product-grid'
import { SortSelect } from '@/components/store/sort-select'
import { SearchInput } from '@/components/store/search-input'
import { getCollectionPageData } from '@/lib/collection-data'
import { getSiteUrl } from '@/lib/site'

export const revalidate = 300

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CollectionParams>
}): Promise<Metadata> {
  const params = await searchParams
  const baseUrl = getSiteUrl()
  const canonicalParams = new URLSearchParams()
  const category = params.category?.split(',').filter(Boolean)[0]
  const subCategory = params.subCategory?.split(',').filter(Boolean)[0]
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  if (category) canonicalParams.set('category', category)
  if (subCategory) canonicalParams.set('subCategory', subCategory)
  if (page > 1) canonicalParams.set('page', String(page))

  const canonicalQuery = canonicalParams.toString()
  const canonical = `${baseUrl}/collection${canonicalQuery ? `?${canonicalQuery}` : ''}`
  const titleParts = [subCategory, category].filter(Boolean)
  const title =
    titleParts.length > 0
      ? `${titleParts.join(' - ')} para mascotas | Harry's Boutique`
      : "Colecciones para mascotas | Harry's Boutique"
  const description =
    titleParts.length > 0
      ? `Compra ${titleParts.join(' ')} para mascotas en Harry's Boutique. Productos seleccionados, estilo premium y despacho en Chile.`
      : "Explora la coleccion completa de ropa y accesorios premium para mascotas en Harry's Boutique."
  const hasDuplicateFilterSurface = Boolean(
    params.colors ||
    params.sizes ||
    params.minPrice ||
    params.maxPrice ||
    params.sort ||
    params.search ||
    params.bestSeller,
  )

  return {
    title,
    description,
    alternates: { canonical },
    robots: hasDuplicateFilterSurface ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Harry's Boutique",
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<CollectionParams>
}) {
  const params = await searchParams
  const { categories, page, products, sort, total, totalPages, uniqueColors, uniqueSizes } =
    await getCollectionPageData(params)

  const serializedProducts = products
  const serializedCategories = serialize(categories)

  return (
    <div className="pt-6">
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
          Descubre nuestra coleccion completa de ropa y accesorios para mascotas
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
          <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {total} {total === 1 ? 'producto' : 'productos'}
            </p>
            <div className="grid w-full grid-cols-2 items-center gap-3 sm:flex sm:w-auto">
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
          />
        </div>
      </div>
    </div>
  )
}
