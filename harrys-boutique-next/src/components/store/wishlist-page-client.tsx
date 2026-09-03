'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EditorialPanel } from './editorial'
import { ProductCard } from './product-card'
import { toast } from 'react-toastify'
import { BrandIcon } from '@/components/ui/brand-icon'
import type { MercadoLibreListingStatus } from '@/lib/mercado-libre'

interface WishlistProduct {
  id: string
  name: string
  price: number
  images: string[]
  ratingAverage: number
  ratingCount: number
  mercadoLibreUrl?: string | null
  mercadoLibreItemId?: string | null
  mercadoLibreStatus?: MercadoLibreListingStatus
}

export interface WishlistWithProduct {
  id: string
  productId: string
  product: WishlistProduct
}

export function WishlistPageClient({ wishlist: initial }: { wishlist: WishlistWithProduct[] }) {
  const [wishlist, setWishlist] = useState(initial)
  const heroProduct = wishlist[0]?.product

  const remove = async (productId: string) => {
    try {
      await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' })
      setWishlist((prev) => prev.filter((w) => w.productId !== productId))
      toast.success('Eliminado de favoritos')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (wishlist.length === 0) {
    return (
      <div className="py-10 sm:py-14">
        <EditorialPanel className="mx-auto max-w-3xl p-8 text-center sm:p-12" tone="soft">
          <div className="relative">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[var(--shadow-editorial)]">
              <BrandIcon name="heart" className="h-6 w-6" />
            </span>
            <p className="ui-eyebrow mt-5">Tu selección personal</p>
            <h1 className="ui-display mt-3 text-4xl sm:text-5xl">
              Tus favoritos están listos para comenzar.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Guarda prendas para una ocasión especial, compara estilos y vuelve cuando encuentres
              la combinación perfecta para tu mascota.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/tienda" className="ui-button ui-button-primary">
                Explorar tienda
              </Link>
              <Link href="/experiencias#atelier" className="ui-button ui-button-secondary">
                Conocer el Atelier
              </Link>
            </div>
          </div>
        </EditorialPanel>
      </div>
    )
  }

  return (
    <div className="py-10">
      <EditorialPanel className="mb-10 p-6 sm:p-8" tone="cream">
        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="ui-eyebrow">Tu selección personal</p>
            <h1 className="ui-display mt-3 text-4xl">Mis favoritos</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Compara estilos, guarda prendas para una ocasión especial y vuelve cuando quieras
              decidir con calma.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-stitch-line)] bg-[var(--color-panel-soft)] p-5">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-[var(--color-surface)] p-2 text-[var(--color-gold-dark)]">
                <BrandIcon name="sparkles" className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">
                  Una idea para tu próximo conjunto
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {heroProduct?.name} puede ser el punto de partida para combinar colores o preparar
                  un regalo especial.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/product/${heroProduct?.id}`}
                    className="rounded-full border border-[var(--color-stitch-line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--color-gold)]"
                  >
                    Ver producto
                  </Link>
                  <Link
                    href="/experiencias#atelier"
                    className="rounded-full border border-[var(--color-stitch-line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--color-gold)]"
                  >
                    Consultar personalización
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EditorialPanel>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {wishlist.map(({ product }) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <button
              onClick={() => remove(product.id)}
              aria-label={`Eliminar ${product.name} de favoritos`}
              className="absolute right-2 top-2 rounded-full bg-[var(--color-surface)] p-1 text-[var(--color-error)] shadow hover:bg-[var(--color-accent-light)]"
            >
              <BrandIcon name="heart" className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
