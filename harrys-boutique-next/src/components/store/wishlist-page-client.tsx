'use client'

import { useState } from 'react'
import Link from 'next/link'
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
      <div className="border-t py-10 sm:py-14">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border border-[#deded9] bg-[linear-gradient(135deg,#ffffff_0%,#f1f1ee_100%)] p-8 text-center shadow-[0_16px_40px_rgba(20,20,20,0.05)] sm:p-12">
          <div className="pointer-events-none absolute inset-3 rounded-[1.1rem] border border-dashed border-[#d5d5cf]" />
          <div className="relative">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-[#3d3d39] shadow-[0_4px_14px_rgba(20,20,20,0.06)]">
              <BrandIcon name="heart" className="h-6 w-6" />
            </span>
            <p className="ui-eyebrow mt-5">Tu selección personal</p>
            <h1
              className="mt-3 text-4xl text-[var(--color-text-primary)] sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
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
        </div>
      </div>
    )
  }

  return (
    <div className="border-t py-10">
      <div className="mb-10 grid gap-5 rounded-[1.25rem] border border-[#deded9] bg-white p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="ui-eyebrow">Tu selección personal</p>
          <h1
            className="mt-3 text-4xl text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Mis favoritos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
            Compara estilos, guarda prendas para una ocasión especial y vuelve cuando quieras
            decidir con calma.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-[#efefec] p-2 text-[#3d3d39]">
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
                  className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--color-accent)]"
                >
                  Ver producto
                </Link>
                <Link
                  href="/experiencias#atelier"
                  className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--color-accent)]"
                >
                  Consultar personalización
                </Link>
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
              aria-label={`Eliminar ${product.name} de favoritos`}
              className="absolute right-2 top-2 rounded-full bg-white p-1 text-red-500 shadow hover:bg-red-50"
            >
              <BrandIcon name="heart" className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
