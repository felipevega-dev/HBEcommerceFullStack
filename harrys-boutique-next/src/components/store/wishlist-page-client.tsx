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
      <div className="py-10 border-t text-center">
        <h1 className="text-3xl font-medium mb-4">Mis Favoritos</h1>
        <p className="text-gray-500">Aún no tienes favoritos.</p>
      </div>
    )
  }

  return (
    <div className="py-10 border-t">
      <h1 className="text-3xl font-medium mb-8">Mis Favoritos</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map(({ product }) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <button
              onClick={() => remove(product.id)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-red-500 hover:bg-red-50"
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
