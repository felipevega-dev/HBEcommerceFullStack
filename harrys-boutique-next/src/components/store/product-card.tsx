'use client'

import Link from 'next/link'
import Image from 'next/image'
import { WishlistButton } from '@/components/store/wishlist-button'
import { StarRating } from '@/components/ui/star-rating'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  slug?: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  ratingAverage?: number
  ratingCount?: number
  wishlisted?: boolean
  showWishlist?: boolean
  bestSeller?: boolean
}

export function ProductCard({ product }: { product: Product }) {
  const price = product.price
  const image = product.images[0]
  const secondImage = product.images[1]
  // Only use slug if it's a valid slug (non-empty, no spaces, no UUID format)
  const isValidSlug = product.slug && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(product.slug)
  const href = isValidSlug ? `/product/${product.slug}` : `/product/${product.id}`

  return (
    <Link href={href} className="group block">
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] aspect-[3/4] shadow-[var(--shadow-sm)] group-hover:shadow-[var(--shadow-hover)] transition-shadow duration-300">
          {/* Badge Best Seller */}
          {product.bestSeller && (
            <span className="absolute top-2 left-2 z-10 bg-[var(--color-gold)] text-white text-xs font-medium px-2 py-0.5 rounded-full">
              Más Vendido
            </span>
          )}

          {image ? (
            <>
              <Image
                src={image}
                alt={product.name}
                fill
                loading="lazy"
                className={`object-cover object-center transition-opacity duration-300 ${secondImage ? 'group-hover:opacity-0' : ''}`}
              />
              {secondImage && (
                <Image
                  src={secondImage}
                  alt={`${product.name} - vista alternativa`}
                  fill
                  loading="lazy"
                  className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface)] text-[var(--color-text-muted)] gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-xs text-center px-2 line-clamp-2">{product.name}</span>
            </div>
          )}

          {/* Wishlist button */}
          {product.showWishlist && (
            <div
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => e.preventDefault()}
            >
              <WishlistButton
                productId={product.id}
                initialWishlisted={product.wishlisted ?? false}
              />
            </div>
          )}
        </div>

        <div className="space-y-1 px-1">
          <h3 className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.originalPrice && product.originalPrice > price ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {formatPrice(price)}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            </div>
          ) : (
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {formatPrice(price)}
            </p>
          )}

          {product.ratingCount && product.ratingCount > 0 ? (
            <StarRating average={product.ratingAverage ?? 0} count={product.ratingCount} />
          ) : null}
        </div>
      </div>
    </Link>
  )
}
