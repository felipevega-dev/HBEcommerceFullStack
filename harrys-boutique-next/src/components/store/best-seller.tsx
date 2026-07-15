import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from './product-card'
import { BrandIcon } from '@/components/ui/brand-icon'
import { canUseDatabaseFallback, logDatabaseFallback } from '@/lib/db-fallback'
import type { MercadoLibreListingStatus } from '@/lib/mercado-libre'

type BestSellerProduct = {
  id: string
  slug: string
  name: string
  price: { toNumber: () => number }
  images: string[]
  ratingAverage: number
  ratingCount: number
  mercadoLibreUrl: string | null
  mercadoLibreItemId: string | null
  mercadoLibreStatus: MercadoLibreListingStatus
}

export async function BestSeller() {
  let raw: BestSellerProduct[] = []

  try {
    raw = await prisma.product.findMany({
      where: { bestSeller: true, active: true },
      orderBy: { ratingAverage: 'desc' },
      take: 5,
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        images: true,
        ratingAverage: true,
        ratingCount: true,
        mercadoLibreUrl: true,
        mercadoLibreItemId: true,
        mercadoLibreStatus: true,
      },
    })
  } catch (error) {
    if (!canUseDatabaseFallback(error)) throw error
    logDatabaseFallback('BestSeller', error)
  }
  const products = raw.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price.toNumber(),
    images: p.images,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    mercadoLibreUrl: p.mercadoLibreUrl,
    mercadoLibreItemId: p.mercadoLibreItemId,
    mercadoLibreStatus: p.mercadoLibreStatus,
  }))

  return (
    <section className="space-y-12">
      <div className="text-center space-y-4">
        <h2
          className="text-3xl font-medium text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Los Más Vendidos
        </h2>
        <p className="text-gray-600 text-sm max-w-2xl mx-auto">
          Descubre nuestros productos más populares, elegidos por nuestros clientes
        </p>
      </div>

      {products.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-[3/4] mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="text-center">
        <Link
          href="/collection?bestSeller=true"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-text-primary)] px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-text-primary)] hover:text-white"
        >
          Ver más vendidos
          <BrandIcon name="chevron-right" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
