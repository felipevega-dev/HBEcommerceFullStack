'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BrandIcon } from '@/components/ui/brand-icon'
import { EmptyState } from '@/components/ui/design-system'
import { ProductCard } from './product-card'
import type { MercadoLibreListingStatus } from '@/lib/mercado-libre'

interface Product {
  id: string
  slug?: string
  name: string
  price: number | { toNumber: () => number }
  images: string[]
  ratingAverage: number
  ratingCount: number
  wishlisted?: boolean
  showWishlist?: boolean
  bestSeller?: boolean
  originalPrice?: number
  mercadoLibreUrl?: string | null
  mercadoLibreItemId?: string | null
  mercadoLibreStatus?: MercadoLibreListingStatus
}

interface Props {
  products: Product[]
  currentPage: number
  totalPages: number
  total: number
  sort?: string
}

export function ProductGrid({ products, currentPage, totalPages }: Props) {
  const searchParams = useSearchParams()
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadWishlistIds() {
      try {
        const res = await fetch('/api/wishlist?idsOnly=true', { cache: 'no-store' })
        if (!res.ok) {
          if (!cancelled) setWishlistIds([])
          return
        }

        const data = await res.json()
        if (!cancelled && data.success) {
          setWishlistIds(Array.isArray(data.productIds) ? data.productIds : [])
        }
      } catch {
        if (!cancelled) {
          setWishlistIds([])
        }
      }
    }

    loadWishlistIds()

    return () => {
      cancelled = true
    }
  }, [])

  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds])
  const pagesToRender = useMemo(() => {
    const pages = new Set<number>([1, totalPages, currentPage])

    for (let page = currentPage - 2; page <= currentPage + 2; page++) {
      if (page >= 1 && page <= totalPages) pages.add(page)
    }

    return [...pages].sort((a, b) => a - b)
  }, [currentPage, totalPages])

  function buildPageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    return `?${params.toString()}`
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No encontramos productos"
        description="Prueba con otros filtros para descubrir nuestras prendas y accesorios."
        action={
          <Link href="/tienda" className="ui-button ui-button-secondary">
            Limpiar filtros
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {products.map((product) => {
          const price = typeof product.price === 'number' ? product.price : product.price.toNumber()
          return (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                price,
                wishlisted: wishlistSet.has(product.id),
                showWishlist: true,
              }}
            />
          )
        })}
      </div>

      {currentPage === 1 && (
        <aside className="relative grid overflow-hidden rounded-[1.75rem] border border-[var(--color-stitch-line)] bg-[var(--color-panel)] shadow-[var(--shadow-editorial)] sm:grid-cols-[0.85fr_1.15fr]">
          <div className="relative min-h-52 overflow-hidden sm:min-h-72">
            <Image
              src="/nosotrosfull.png"
              alt="El oficio handmade de Harry's Boutique"
              fill
              sizes="(max-width: 640px) 100vw, 35vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-panel)]/25" />
          </div>
          <div className="relative flex flex-col justify-center px-7 py-9 sm:px-10 lg:px-14">
            <div className="pointer-events-none absolute inset-3 rounded-[1.15rem] border border-dashed border-[var(--color-dashed)]" />
            <div className="relative">
              <p className="ui-eyebrow">HECHO A MANO EN CHILE</p>
              <h2 className="ui-display mt-3 text-4xl leading-none sm:text-5xl">
                Cada detalle tiene una historia.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Bordados, combinaciones y terminaciones creadas en series pequeñas para que cada
                prenda conserve el carácter de nuestro atelier.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="ui-button ui-button-primary ui-button-sm rounded-full"
                >
                  Conoce nuestra historia <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/contact"
                  className="ui-button ui-button-secondary ui-button-sm rounded-full"
                >
                  Consultar un diseño
                </Link>
              </div>
            </div>
          </div>
        </aside>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {currentPage > 1 && (
            <Link
              href={buildPageHref(currentPage - 1)}
              className="ui-button ui-button-secondary h-10 w-10 px-0 text-sm"
              aria-label="Pagina anterior"
            >
              <BrandIcon name="chevron-left" className="h-4 w-4" />
            </Link>
          )}
          {pagesToRender.map((page, index) => (
            <div key={page} className="flex items-center gap-2">
              {index > 0 && page - pagesToRender[index - 1] > 1 && (
                <span className="px-1 text-sm text-[var(--color-text-muted)]">...</span>
              )}
              <Link
                href={buildPageHref(page)}
                className={`ui-button text-sm ${page === currentPage ? 'ui-button-primary' : 'ui-button-secondary'}`}
              >
                {page}
              </Link>
            </div>
          ))}
          {currentPage < totalPages && (
            <Link
              href={buildPageHref(currentPage + 1)}
              className="ui-button ui-button-secondary h-10 w-10 px-0 text-sm"
              aria-label="Pagina siguiente"
            >
              <BrandIcon name="chevron-right" className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] aspect-[3/4] mb-3" />
          <div className="animate-pulse h-4 bg-[var(--color-surface-2)] rounded w-3/4 mb-2" />
          <div className="animate-pulse h-4 bg-[var(--color-surface-2)] rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
