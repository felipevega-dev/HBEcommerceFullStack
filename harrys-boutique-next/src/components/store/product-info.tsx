'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { toast } from 'react-toastify'
import { colorToHex } from '@/lib/utils'
import { ButtonWithFeedback } from '@/components/ui/button-with-feedback'
import { BrandIcon } from '@/components/ui/brand-icon'
import { trackAnalyticsEvent } from '@/lib/analytics'
import { resolveMercadoLibreListing, type MercadoLibreListingStatus } from '@/lib/mercado-libre'
import { MercadoLibreLink } from './mercado-libre-link'

interface Product {
  id: string
  slug?: string
  name: string
  price: number
  originalPrice?: number | null
  description: string
  mercadoLibreUrl?: string | null
  mercadoLibreItemId?: string | null
  mercadoLibreStatus?: MercadoLibreListingStatus
  sizes: unknown
  colors: string[]
  images: string[]
  stock?: number
  variants?: { id: string; size: string; color: string; stock: number; active: boolean }[]
  ratingAverage: number
  ratingCount: number
}

const stripEmoji = (text: string) =>
  text.replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')

export function ProductInfo({
  product,
  categoryName,
}: {
  product: Product
  categoryName?: string
}) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '')
  const [quantity, setQuantity] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const mercadoLibreListing = resolveMercadoLibreListing(product)

  const sizes = Array.isArray(product.sizes) ? (product.sizes as string[]) : []
  const activeVariants = product.variants?.filter((variant) => variant.active) ?? []
  const hasVariantStock = activeVariants.length > 0
  const selectedVariant = hasVariantStock
    ? activeVariants.find(
        (variant) => variant.size === selectedSize && variant.color === (selectedColor ?? ''),
      )
    : null
  const selectedStock = hasVariantStock ? (selectedVariant?.stock ?? 0) : (product.stock ?? 0)
  const price = product.price
  const description = stripEmoji(product.description)
    .replace(/\s{2,}/g, ' ')
    .trim()

  useEffect(() => {
    const item = { item_id: product.id, item_name: product.name }
    trackAnalyticsEvent('view_item', item)

    if (mercadoLibreListing) return
    trackAnalyticsEvent(
      product.mercadoLibreUrl || product.mercadoLibreItemId
        ? 'invalid_mercadolibre_link'
        : 'product_without_mercadolibre_listing',
      item,
    )
  }, [
    mercadoLibreListing,
    product.id,
    product.mercadoLibreItemId,
    product.mercadoLibreUrl,
    product.name,
  ])

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.warning('Por favor selecciona una talla')
      throw new Error('No size selected')
    }

    if (selectedStock < quantity) {
      toast.warning('No hay stock suficiente para esta talla/color')
      throw new Error('Insufficient stock')
    }

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500))

    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0] ?? '',
    })

    setShowModal(true)
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
          <li>
            <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">
              Inicio
            </Link>
          </li>
          {categoryName && (
            <>
              <li>/</li>
              <li>
                <Link
                  href="/tienda"
                  className="hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {categoryName}
                </Link>
              </li>
            </>
          )}
          <li>/</li>
          <li
            className="text-[var(--color-text-primary)] font-medium truncate max-w-[200px]"
            aria-current="page"
          >
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Name + rating */}
      <div>
        <h1 className="text-2xl font-medium">{product.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${star <= Math.round(product.ratingAverage) ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500">({product.ratingCount} valoraciones)</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-medium">${price.toLocaleString('es-CL')}</span>
        {product.originalPrice && product.originalPrice > price && (
          <>
            <span className="text-lg text-[var(--color-text-muted)] line-through">
              ${product.originalPrice.toLocaleString('es-CL')}
            </span>
            <span className="text-sm bg-[var(--color-accent-light)] text-[var(--color-accent-dark)] px-2 py-0.5 rounded-full font-medium">
              -{Math.round((1 - price / product.originalPrice) * 100)}%
            </span>
          </>
        )}
      </div>
      {mercadoLibreListing && (
        <p className="-mt-2 text-xs text-[var(--color-text-muted)]">
          Precio referencial. Confirma el precio vigente en la publicación oficial.
        </p>
      )}

      {/* Stock indicator */}
      {!mercadoLibreListing && product.stock !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          {selectedStock === 0 ? (
            <span className="text-[var(--color-error)] font-medium">Sin stock</span>
          ) : selectedStock <= 5 ? (
            <span className="text-[var(--color-warning)] font-medium">
              ¡Últimas {selectedStock} unidades!
            </span>
          ) : (
            <span className="text-[var(--color-success)] font-medium flex items-center gap-1">
              <BrandIcon name="check" className="h-4 w-4" />
              En stock
            </span>
          )}
        </div>
      )}

      <p className="text-gray-600 leading-relaxed">{description}</p>

      <div className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <BrandIcon name="ruler" className="h-4 w-4 text-[var(--color-accent-dark)]" />
            Fit Lab
          </div>
          <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
            Si dudas entre tallas, mide cuello, pecho y largo. Elige la talla que deje movimiento
            comodo antes que un calce apretado.
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <BrandIcon name="design" className="h-4 w-4 text-[var(--color-accent-dark)]" />
            Harry&apos;s Atelier
          </div>
          <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
            Para un nombre bordado, un conjunto coordinado o un regalo especial, revisa el Atelier.
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex text-xs font-semibold text-[var(--color-accent-dark)] hover:text-[var(--color-primary)]"
          >
            Ver opciones custom
          </Link>
        </div>
      </div>

      {/* Colors */}
      {!mercadoLibreListing && product.colors.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3">
            Color: <span className="font-normal">{selectedColor}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((color) => {
              const colorHasStock =
                !hasVariantStock ||
                activeVariants.some((variant) => variant.color === color && variant.stock > 0)

              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    trackAnalyticsEvent('select_item_variant', {
                      item_id: product.id,
                      item_name: product.name,
                      color,
                    })
                  }}
                  disabled={!colorHasStock}
                  title={color}
                  className={`w-8 h-8 rounded-full border-2 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${selectedColor === color ? 'border-[var(--color-accent)] scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                  style={{ backgroundColor: colorToHex(color) }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {!mercadoLibreListing && sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3">Selecciona Talla</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const sizeHasStock =
                !hasVariantStock ||
                activeVariants.some(
                  (variant) =>
                    variant.size === size &&
                    variant.color === (selectedColor ?? '') &&
                    variant.stock > 0,
                )

              return (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size)
                    trackAnalyticsEvent('select_item_variant', {
                      item_id: product.id,
                      item_name: product.name,
                      size,
                      color: selectedColor,
                    })
                  }}
                  disabled={!sizeHasStock}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${selectedSize === size ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      {!mercadoLibreListing && (
        <div>
          <p className="text-sm font-medium mb-3">Cantidad</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 text-lg"
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(selectedStock || q + 1, q + 1))}
              className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 text-lg"
              aria-label="Aumentar cantidad"
              disabled={selectedStock > 0 && quantity >= selectedStock}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* A valid Mercado Libre URL is the exclusive purchase channel for this product. */}
      {mercadoLibreListing && (
        <div className="rounded-xl border border-[#ffe1a6] bg-[#fff8e8] p-4">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Compra y pago mediante Mercado Libre
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
            Precio, disponibilidad, talla, color, cantidad, protección y despacho se confirman
            directamente en la publicación oficial.
          </p>
          <MercadoLibreLink
            href={mercadoLibreListing.url}
            itemId={mercadoLibreListing.itemId}
            productId={product.id}
            productName={product.name}
            productSlug={product.slug}
            location="product_page"
            className="ui-button ui-button-secondary mt-3 w-full justify-center !border-[#e8c56c] !bg-[#ffefc5] !text-[#684707] hover:!bg-[#ffe5a3]"
          >
            Comprar en Mercado Libre
          </MercadoLibreLink>
          <p className="mt-2 text-center text-[11px] text-[var(--color-text-muted)]">
            Selecciona las variantes disponibles directamente en Mercado Libre.
          </p>
        </div>
      )}

      {/* Add to cart */}
      {!mercadoLibreListing &&
        (selectedStock === 0 ? (
          <button
            disabled
            className="w-full py-3 rounded-lg font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            Sin stock
          </button>
        ) : (
          <ButtonWithFeedback
            onClick={handleAddToCart}
            variant="primary"
            size="lg"
            className="w-full !bg-black !text-white hover:!bg-gray-800"
          >
            {mercadoLibreListing ? "Comprar directo en Harry's" : 'Añadir al carrito'}
          </ButtonWithFeedback>
        ))}

      {/* Features */}
      <div className="pt-4 border-t space-y-2 text-sm text-gray-500">
        <p className="flex items-center gap-2">
          <BrandIcon name="check" className="h-4 w-4" />
          Producto 100% original
        </p>
        {mercadoLibreListing ? (
          <>
            <p className="flex items-center gap-2">
              <BrandIcon name="check" className="h-4 w-4" />
              Pago protegido mediante Mercado Libre
            </p>
            <p className="flex items-center gap-2">
              <BrandIcon name="check" className="h-4 w-4" />
              Despacho y devoluciones según la publicación oficial
            </p>
          </>
        ) : (
          <p className="flex items-center gap-2">
            <BrandIcon name="check" className="h-4 w-4" />
            Retracto de 10 días en productos estándar
          </p>
        )}
        <p className="flex items-center gap-2">
          <BrandIcon name="check" className="h-4 w-4" />
          Servicio de asistencia al cliente
        </p>
        <p className="flex items-center gap-2">
          <BrandIcon name="camera" className="h-4 w-4" />
          Comparte su estilo con la comunidad Harry&apos;s
        </p>
      </div>

      {/* Cart modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="p-6 rounded-lg max-w-md w-full"
            style={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">¡Producto agregado!</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <BrandIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {product.images[0] && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">Talla: {selectedSize}</p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm text-gray-600">Cantidad: {quantity}</p>
                  <p className="text-sm font-medium">
                    ${(price * quantity).toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                style={{ border: '1px solid var(--color-border)' }}
                autoFocus
              >
                Seguir comprando
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  router.push('/cart')
                }}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
              >
                Ver carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
