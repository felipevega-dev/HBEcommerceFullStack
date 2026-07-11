'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductCard } from './product-card'
import { toast } from 'react-toastify'
import { BrandIcon } from '@/components/ui/brand-icon'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'

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
      <div>
        <PageHeader
          title="Favoritos"
          breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Favoritos' }]}
        />
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <BrandIcon name="heart" className="mx-auto h-8 w-8 text-[var(--color-accent-dark)]" />
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Aún no tienes productos guardados.
          </p>
          <Button href="/collection" className="mt-6">
            Ver colección
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Favoritos"
        description={`${wishlist.length} ${wishlist.length === 1 ? 'producto guardado' : 'productos guardados'}`}
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Favoritos' }]}
      />

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {wishlist.map(({ product }) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <button
              type="button"
              onClick={() => remove(product.id)}
              className="absolute right-2 top-2 rounded-full bg-[var(--color-background)] p-1 text-[var(--color-error)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-surface)]"
              title="Eliminar de favoritos"
            >
              <BrandIcon name="heart" className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button href="/collection" variant="outline">
          Seguir comprando
        </Button>
      </div>
    </div>
  )
}
