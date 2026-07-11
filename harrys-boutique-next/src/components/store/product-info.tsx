'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { toast } from 'react-toastify'
import { colorToHex } from '@/lib/utils'
import { ButtonWithFeedback } from '@/components/ui/button-with-feedback'
import { Button } from '@/components/ui/button'
import { BrandIcon } from '@/components/ui/brand-icon'
import { TrustStrip } from '@/components/ui/trust-strip'
import { StickyAddToCart } from '@/components/store/sticky-add-to-cart'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  description: string
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
  const outOfStock = selectedStock === 0

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.warning('Por favor selecciona una talla')
      throw new Error('No size selected')
    }

    if (selectedStock < quantity) {
      toast.warning('No hay stock suficiente para esta talla/color')
      throw new Error('Insufficient stock')
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

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
    <>
      <div className="flex-1 space-y-6">
        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href="/" className="transition-colors hover:text-[var(--color-text-primary)]">
                Inicio
              </Link>
            </li>
            {categoryName && (
              <>
                <li>/</li>
                <li>
                  <Link
                    href="/collection"
                    className="transition-colors hover:text-[var(--color-text-primary)]"
                  >
                    {categoryName}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li
              className="max-w-[200px] truncate font-medium text-[var(--color-text-primary)]"
              aria-current="page"
            >
              {product.name}
            </li>
          </ol>
        </nav>

        <div>
          <h1 className="text-2xl font-medium md:text-3xl">{product.name}</h1>
          {product.ratingCount > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(product.ratingAverage) ? 'text-[var(--color-gold)]' : 'text-[var(--color-border-strong)]'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>({product.ratingCount})</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-medium">${price.toLocaleString('es-CL')}</span>
          {product.originalPrice && product.originalPrice > price && (
            <>
              <span className="text-lg text-[var(--color-text-muted)] line-through">
                ${product.originalPrice.toLocaleString('es-CL')}
              </span>
              <span className="rounded-full bg-[var(--color-accent-light)] px-2 py-0.5 text-sm font-medium text-[var(--color-accent-dark)]">
                -{Math.round((1 - price / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        {product.stock !== undefined && (
          <div className="text-sm">
            {outOfStock ? (
              <span className="font-medium text-[var(--color-error)]">Sin stock</span>
            ) : selectedStock <= 5 ? (
              <span className="font-medium text-[var(--color-warning)]">
                Últimas {selectedStock} unidades
              </span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-[var(--color-success)]">
                <BrandIcon name="check" className="h-4 w-4" />
                En stock
              </span>
            )}
          </div>
        )}

        {product.colors.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-medium">
              Color: <span className="font-normal">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => {
                const colorHasStock =
                  !hasVariantStock ||
                  activeVariants.some((variant) => variant.color === color && variant.stock > 0)

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    disabled={!colorHasStock}
                    title={color}
                    className={`h-8 w-8 rounded-full border-2 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${selectedColor === color ? 'scale-110 border-[var(--color-accent)]' : 'border-[var(--color-border-strong)] hover:border-[var(--color-accent-dark)]'}`}
                    style={{ backgroundColor: colorToHex(color) }}
                  />
                )
              })}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-medium">Talla</p>
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
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    disabled={!sizeHasStock}
                    className={`rounded-[var(--radius-md)] border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${selectedSize === size ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-[var(--color-border-strong)] hover:border-[var(--color-accent-dark)]'}`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <p className="mb-3 text-sm font-medium">Cantidad</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() =>
                setQuantity((value) => Math.min(selectedStock || value + 1, value + 1))
              }
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
              aria-label="Aumentar cantidad"
              disabled={selectedStock > 0 && quantity >= selectedStock}
            >
              +
            </button>
          </div>
        </div>

        <div id="product-add-to-cart" className="space-y-3">
          {outOfStock ? (
            <Button disabled className="w-full">
              Sin stock
            </Button>
          ) : (
            <ButtonWithFeedback
              onClick={handleAddToCart}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Añadir al carrito
            </ButtonWithFeedback>
          )}
          <TrustStrip variant="inline" />
        </div>

        {description && (
          <div className="border-t border-[var(--color-border)] pt-6">
            <h2 className="mb-3 text-sm font-medium">Descripción</h2>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {description}
            </p>
          </div>
        )}
      </div>

      <StickyAddToCart
        productName={product.name}
        price={price}
        disabled={outOfStock}
        onAddToCart={handleAddToCart}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-6">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-medium">Producto agregado</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                aria-label="Cerrar"
              >
                <BrandIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4">
              {product.images[0] && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Talla: {selectedSize}</p>
                <p className="mt-2 text-sm font-medium">
                  ${(price * quantity).toLocaleString('es-CL')}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Seguir comprando
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowModal(false)
                  router.push('/cart')
                }}
              >
                Ver carrito
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
