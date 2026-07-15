import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { serialize } from '@/lib/serialize'
import { type CollectionParams } from '@/lib/collection-params'
import { CollectionFilters } from '@/components/store/collection-filters'
import { ProductGrid } from '@/components/store/product-grid'
import { SortSelect } from '@/components/store/sort-select'
import { SearchInput } from '@/components/store/search-input'
import { StoreEditorialHeader } from '@/components/store/store-editorial-header'
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
    <div className="pt-6">
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

      <StoreEditorialHeader categories={serializedCategories} />

      <div className="flex flex-col gap-8 sm:flex-row">
        <CollectionFilters
          categories={serializedCategories}
          colors={uniqueColors}
          sizes={uniqueSizes}
          currentParams={params}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-6 rounded-[1.35rem] border border-[#eadfce] bg-white/80 p-4 shadow-[0_8px_24px_rgba(70,48,35,0.05)] backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#a96808]">
                SELECCIÓN HARRY&apos;S
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {total} {total === 1 ? 'producto' : 'productos'} para descubrir
              </p>
            </div>
            <div className="mt-3 grid w-full grid-cols-2 items-center gap-3 sm:mt-0 sm:flex sm:w-auto">
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

      <section className="my-16 rounded-[2rem] border border-[#eadfce] bg-[#fffaf4] px-7 py-10 sm:px-11 lg:px-14">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold tracking-[0.22em] text-[#a96808]">
            GUÍA HARRY&apos;S
          </p>
          <h2
            className="mt-3 text-4xl leading-none text-[#1b1b1b] sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Elegir con cariño también es parte de la experiencia.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              number: '01',
              title: 'Encuentra su talla',
              text: 'Mide cuello, pecho y largo sin apretar. En cada ficha encontrarás las opciones disponibles para ese diseño.',
            },
            {
              number: '02',
              title: 'Elige su personalidad',
              text: 'Explora colores, bordados y colecciones inspiradas en las historias que hacen única a cada mascota.',
            },
            {
              number: '03',
              title: 'Compra con confianza',
              text: 'Los productos publicados en Mercado Libre se pagan y despachan desde su plataforma oficial y protegida.',
            },
          ].map((item) => (
            <article
              key={item.number}
              className="rounded-[1.25rem] border border-[#eadfce] bg-white p-5"
            >
              <p className="text-xs font-bold text-[#d79a18]">{item.number}</p>
              <h3 className="mt-3 text-base font-semibold text-[#2f2823]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6f625a]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
