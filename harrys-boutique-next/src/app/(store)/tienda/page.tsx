import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { serialize } from '@/lib/serialize'
import { type CollectionParams } from '@/lib/collection-params'
import { CollectionFilters } from '@/components/store/collection-filters'
import { ProductGrid } from '@/components/store/product-grid'
import { SortSelect } from '@/components/store/sort-select'
import { SearchInput } from '@/components/store/search-input'
import {
  StoreCategoryRow,
  StoreEditorialHeader,
  StoreTrustStrip,
} from '@/components/store/store-editorial-header'
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
  const canonical = `${baseUrl}/tienda${canonicalQuery ? `?${canonicalQuery}` : ''}`
  const titleParts = [subCategory, category].filter(Boolean)
  const title =
    titleParts.length > 0
      ? `${titleParts.join(' - ')} para mascotas | Harry's Boutique`
      : "Tienda de ropa para mascotas | Harry's Boutique"
  const description =
    titleParts.length > 0
      ? `Descubre ${titleParts.join(' ')} para mascotas en Harry's Boutique. Diseños handmade y compra segura en Chile.`
      : "Explora ropa y accesorios handmade para mascotas en Harry's Boutique. Diseños con identidad, creados en Chile."
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
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<CollectionParams>
}) {
  const params = await searchParams
  const { categories, page, products, sort, total, totalPages, uniqueColors, uniqueSizes } =
    await getCollectionPageData(params)

  const serializedProducts = serialize(products)
  const serializedCategories = serialize(categories)

  return (
    <>
      <div className="-mx-4 sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]">
        <StoreEditorialHeader />
      </div>

      <div className="mx-auto w-full max-w-[1536px] pt-6">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex gap-2 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href="/" className="transition-colors hover:text-[var(--color-text-primary)]">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--color-text-primary)]">
              Tienda
            </li>
          </ol>
        </nav>

        <StoreCategoryRow categories={serializedCategories} />
        <StoreTrustStrip />

        <div id="catalogo" className="flex flex-col gap-8 sm:flex-row lg:gap-10">
          <CollectionFilters
            categories={serializedCategories}
            colors={uniqueColors}
            sizes={uniqueSizes}
            currentParams={params}
          />
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-4 rounded-[1.35rem] border border-[var(--color-stitch-line)] bg-[var(--color-surface)]/80 p-4 shadow-[var(--shadow-editorial)] backdrop-blur">
              <div className="min-w-0">
                <p className="ui-eyebrow">SELECCIÓN HARRY&apos;S</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {total} {total === 1 ? 'producto' : 'productos'} para descubrir
                </p>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
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
    </>
  )
}
