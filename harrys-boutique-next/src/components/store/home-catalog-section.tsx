'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/store/product-card'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  slug?: string
  name: string
  price: number
  images: string[]
  ratingAverage: number
  ratingCount: number
  categoryId?: string
  bestSeller?: boolean
}

interface Category {
  id: string
  name: string
}

export function HomeCatalogSection({
  products,
  categories,
  bestSellers = [],
}: {
  products: Product[]
  categories: Category[]
  bestSellers?: Product[]
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const chips = useMemo(
    () => [{ id: 'all', name: 'Todos' }, ...categories.slice(0, 6)],
    [categories],
  )

  const filteredProducts = useMemo(() => {
    const base =
      activeCategory === 'all'
        ? products
        : products.filter((product) => product.categoryId === activeCategory)
    return base.slice(0, 12)
  }, [activeCategory, products])

  const bestSellerProducts = bestSellers.slice(0, 5)

  return (
    <div className="space-y-16">
      <section aria-labelledby="home-catalog-heading" className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2
              id="home-catalog-heading"
              className="text-2xl font-medium text-[var(--color-text-primary)] md:text-3xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Colección
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Prendas seleccionadas para comprar ahora
            </p>
          </div>
          <Button href="/collection" variant="outline" size="sm">
            Ver todo
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActiveCategory(chip.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === chip.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {chip.name}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--color-text-muted)]">
            No hay productos en esta categoría.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {bestSellerProducts.length > 0 && (
        <section aria-labelledby="home-bestsellers-heading" className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <h2
                id="home-bestsellers-heading"
                className="text-2xl font-medium text-[var(--color-text-primary)] md:text-3xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Más vendidos
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Favoritos de nuestros clientes
              </p>
            </div>
            <Link
              href="/collection?bestSeller=true"
              className="text-sm font-medium text-[var(--color-text-primary)] underline-offset-4 hover:underline"
            >
              Ver más
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
            {bestSellerProducts.map((product) => (
              <ProductCard key={product.id} product={{ ...product, bestSeller: true }} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
