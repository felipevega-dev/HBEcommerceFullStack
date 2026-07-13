'use client'

import { useState } from 'react'
import { ProductCard } from './product-card'
import { toast } from 'react-toastify'
import { BrandIcon } from '@/components/ui/brand-icon'

interface WishlistProduct {
  id: string
  name: string
  price: number
  images: string[]
  ratingAverage: number
  ratingCount: number
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
      <div className="border-t py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-sm)]">
          <BrandIcon name="heart" className="mx-auto h-8 w-8 text-[var(--color-accent-dark)]" />
          <h1 className="mb-4 mt-4 text-3xl font-medium">Mis Favoritos</h1>
          <p className="text-gray-500">
            Aun no tienes favoritos. Empieza con el quiz de estilo y guarda looks para cumpleanos,
            drops o matching outfits.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/collection" className="ui-button ui-button-primary">
              Explorar colecciÃ³n
            </a>
            <a
              href="/collection"
              className="rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-semibold hover:border-[var(--color-accent)]"
            >
              Ver tienda
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t py-10">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
            Smart wishlist
          </p>
          <h1 className="mt-2 text-3xl font-medium">Mis Favoritos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Guarda prendas para cumpleanos, compara estilos y vuelve cuando haya drops o nuevas
            combinaciones para tu mascota.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-[var(--color-accent-light)] p-2 text-[var(--color-accent-dark)]">
              <BrandIcon name="sparkles" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-[var(--color-text-primary)]">
                Proximo look sugerido
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {heroProduct?.name} puede convertirse en birthday look, fit check o parte de un
                matching outfit.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/collection?sort=newest"
                  className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--color-accent)]"
                >
                  Guardar para cumpleanos
                </a>
                <a
                  href="/contact"
                  className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--color-accent)]"
                >
                  Convertir en fit check
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {wishlist.map(({ product }) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <button
              onClick={() => remove(product.id)}
              className="absolute right-2 top-2 rounded-full bg-white p-1 text-red-500 shadow hover:bg-red-50"
              title="Eliminar de favoritos"
            >
              <BrandIcon name="heart" className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
