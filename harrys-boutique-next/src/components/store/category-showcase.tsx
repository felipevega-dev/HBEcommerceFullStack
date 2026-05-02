'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BrandIcon } from '@/components/ui/brand-icon'

interface Category {
  id: string
  name: string
  subcategories: string[]
  productImage?: string | null
  productCount?: number
}

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const displayCategories = categories.length > 0 ? categories : []

  return (
    <section ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-8"
      >
        <h2
          className="mb-1 text-2xl font-medium text-[var(--color-text-primary)] sm:mb-2 sm:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Categorías destacadas
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] sm:text-base">
          Encuentra lo que tu mascota necesita
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {displayCategories.slice(0, 3).map((category, index) => {
          const hasProducts = (category.productCount ?? 0) > 0
          const href = hasProducts
            ? `/collection?category=${encodeURIComponent(category.name)}`
            : '/collection'

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={href}
                className="group grid grid-cols-[88px_1fr] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-all hover:shadow-[var(--shadow-hover)] sm:relative sm:block sm:aspect-[4/3] sm:border-0 sm:shadow-sm"
              >
                {category.productImage ? (
                  <div className="relative h-24 sm:absolute sm:inset-0 sm:h-auto">
                    <Image
                      src={category.productImage}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 sm:group-hover:scale-110"
                      sizes="(max-width: 640px) 88px, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div
                    className={`h-24 sm:absolute sm:inset-0 sm:h-auto ${
                      index === 0
                        ? 'bg-gradient-to-br from-rose-300 to-pink-500'
                        : index === 1
                          ? 'bg-gradient-to-br from-amber-300 to-orange-500'
                          : 'bg-gradient-to-br from-sky-300 to-blue-500'
                    }`}
                  />
                )}

                <div className="hidden sm:absolute sm:inset-0 sm:block sm:bg-gradient-to-t sm:from-black/70 sm:via-black/20 sm:to-transparent" />

                <div className="flex min-w-0 flex-col justify-center p-4 sm:absolute sm:inset-0 sm:justify-end sm:p-6">
                  <h3 className="mb-1 text-base font-medium text-[var(--color-text-primary)] sm:text-2xl sm:font-bold sm:text-white">
                    {category.name}
                  </h3>
                  {hasProducts && (
                    <p className="text-sm text-[var(--color-text-secondary)] sm:mb-3 sm:text-white/80">
                      {category.productCount} productos
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] sm:mt-0 sm:gap-2 sm:text-sm sm:text-white sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    Ver productos
                    <BrandIcon
                      name="chevron-right"
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {displayCategories.length > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-5 text-center sm:mt-8"
        >
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-dark)] sm:text-base"
          >
            Ver todas las categorías
            <BrandIcon name="chevron-right" className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </motion.div>
      )}
    </section>
  )
}
