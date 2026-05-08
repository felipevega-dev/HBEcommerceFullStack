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
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-4">
        <p>No encontramos productos con estos filtros.</p>
        <Link href="/collection" className="text-sm underline">
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
              className="inline-flex h-10 w-10 items-center justify-center border rounded-lg hover:bg-gray-50 text-sm"
              aria-label="Pagina anterior"
            >
              <BrandIcon name="chevron-left" className="h-4 w-4" />
            </Link>
          )}
          {pagesToRender.map((page, index) => (
            <div key={page} className="flex items-center gap-2">
              {index > 0 && page - pagesToRender[index - 1] > 1 && (
                <span className="px-1 text-sm text-gray-400">...</span>
              )}
              <Link
                href={buildPageHref(page)}
                className={`px-4 py-2 border rounded-lg text-sm ${page === currentPage ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
              >
                {page}
              </Link>
            </div>
          ))}
          {currentPage < totalPages && (
            <Link
              href={buildPageHref(currentPage + 1)}
              className="inline-flex h-10 w-10 items-center justify-center border rounded-lg hover:bg-gray-50 text-sm"
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
          <div className="bg-gray-200 rounded-lg aspect-[3/4] mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
