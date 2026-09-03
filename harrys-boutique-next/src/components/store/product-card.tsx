'use client'

import Link from 'next/link'
import Image from 'next/image'
import { WishlistButton } from '@/components/store/wishlist-button'
import { StarRating } from '@/components/ui/star-rating'
import { formatPrice } from '@/lib/utils'
import { resolveProductPurchaseChannel, type MercadoLibreListingStatus } from '@/lib/mercado-libre'
import { MercadoLibreLink } from './mercado-libre-link'

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
  isNew?: boolean
  mercadoLibreUrl?: string | null
  mercadoLibreItemId?: string | null
  mercadoLibreStatus?: MercadoLibreListingStatus
}

export function ProductCard({ product }: { product: Product }) {
  const price = product.price
  const image = product.images[0]
  const secondImage = product.images[1]
  const isValidSlug = product.slug && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(product.slug)
  const href = isValidSlug ? `/product/${product.slug}` : `/product/${product.id}`
  const purchaseChannel = resolveProductPurchaseChannel(product)

  return (
    <article className="group flex h-full flex-col gap-2.5 rounded-[1.35rem] border border-transparent p-1.5 transition-all duration-300 hover:border-[var(--color-stitch-line)] hover:bg-[var(--color-surface)]/70 hover:shadow-[var(--shadow-editorial)]">
      <div className="flex-1 space-y-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-shadow duration-300 group-hover:shadow-[var(--shadow-hover)]">
          {product.bestSeller && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-[var(--color-gold)] px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-white uppercase">
              Más Vendido
            </span>
          )}
          {product.isNew && !product.bestSeller && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-[var(--color-gold-dark)]">
              NUEVO
            </span>
          )}
          {purchaseChannel.type === 'mercadolibre' && (
            <span className="absolute bottom-2 left-2 right-2 z-10 truncate rounded-full border border-[var(--color-ml-border)] bg-[var(--color-ml-bg)]/95 px-2 py-1 text-center text-[9px] font-semibold text-[var(--color-ml-text)] shadow-sm">
              Disponible en Mercado Libre
            </span>
          )}

          <Link href={href} aria-label={`Ver ${product.name}`} className="block h-full">
            {image ? (
              <>
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
                  loading="lazy"
                  className={`object-cover object-center transition-opacity duration-300 ${secondImage ? 'group-hover:opacity-0' : ''}`}
                />
                {secondImage && (
                  <Image
                    src={secondImage}
                    alt={`${product.name} - vista alternativa`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
                    loading="lazy"
                    className="absolute inset-0 object-cover object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                )}
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--color-surface)] text-[var(--color-text-muted)]">
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
                <span className="line-clamp-2 px-2 text-center text-xs">{product.name}</span>
              </div>
            )}
          </Link>

          {product.showWishlist && (
            <div className="absolute right-2 top-2 z-10 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
              <WishlistButton
                productId={product.id}
                initialWishlisted={product.wishlisted ?? false}
              />
            </div>
          )}
        </div>

        <div className="space-y-1 px-1">
          <Link
            href={href}
            className="line-clamp-2 text-[13px] leading-5 text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-primary)]"
          >
            {product.name}
          </Link>

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

      {purchaseChannel.type === 'mercadolibre' ? (
        <MercadoLibreLink
          href={purchaseChannel.listing.url}
          itemId={purchaseChannel.listing.itemId}
          productId={product.id}
          productName={product.name}
          productSlug={product.slug}
          location="product_card"
          className="ui-button ui-button-ml ui-button-sm w-full justify-center"
        >
          Comprar en Mercado Libre
        </MercadoLibreLink>
      ) : (
        <Link
          href={href}
          className="ui-button ui-button-primary ui-button-sm w-full justify-center"
        >
          Comprar en Harry&apos;s
        </Link>
      )}
    </article>
  )
}
