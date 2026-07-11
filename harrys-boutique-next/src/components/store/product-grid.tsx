'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BrandIcon } from '@/components/ui/brand-icon'
import { ProductCard } from './product-card'

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
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-[var(--color-text-muted)]">
        <p>No encontramos productos con estos filtros.</p>
        <Link
          href="/collection"
          className="text-sm font-medium text-[var(--color-text-primary)] underline-offset-4 hover:underline"
        >
          Limpiar filtros
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {currentPage > 1 && (
            <Link
              href={buildPageHref(currentPage - 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-sm"
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
                className={`rounded-[var(--radius-md)] border px-4 py-2 text-sm ${page === currentPage ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-[var(--color-border)] hover:bg-[var(--color-surface)]'}`}
              >
                {page}
              </Link>
            </div>
          ))}
          {currentPage < totalPages && (
            <Link
              href={buildPageHref(currentPage + 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-sm"
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="mb-3 aspect-[3/4] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]" />
          <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-[var(--color-surface-2)]" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--color-surface-2)]" />
        </div>
      ))}
    </div>
  )
}
