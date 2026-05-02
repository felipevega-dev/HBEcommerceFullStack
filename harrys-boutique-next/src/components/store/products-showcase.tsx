'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductCard } from './product-card'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandIcon } from '@/components/ui/brand-icon'

interface Product {
  id: string
  slug?: string
  name: string
  price: number
  images: string[]
  ratingAverage: number
  ratingCount: number
  categoryId?: string
}

interface Category {
  id: string
  name: string
}

export function ProductsShowcase({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const [activeTab, setActiveTab] = useState<string>('all')

  // Filtrar productos por categoría
  const filteredProducts =
    activeTab === 'all'
      ? products
      : products.filter((p) => p.categoryId === activeTab)

  // Tabs: Todos + categorías principales
  const tabs = [
    { id: 'all', name: 'Todos' },
    ...categories.slice(0, 7).map((c) => ({ id: c.id, name: c.name })),
  ]

  return (
    <section className="space-y-8">
      {/* Tabs */}
      <div className="border-b border-[var(--color-border)]">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {tab.name}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-muted)]">
                No hay productos en esta categoría
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
              {filteredProducts.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* View all button */}
      <div className="text-center pt-4">
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-text-primary)] px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-text-primary)] hover:text-white"
        >
          Ver todos los productos
          <BrandIcon name="chevron-right" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
