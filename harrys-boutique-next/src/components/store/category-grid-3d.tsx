'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { BrandIcon, type BrandIconName } from '@/components/ui/brand-icon'

interface Category {
  id: string
  name: string
  subcategories: string[]
}

const categoryImages: Record<string, { icon: BrandIconName; gradient: string; description: string }> = {
  Ropa: {
    icon: 'shirt',
    gradient: 'from-blue-500 to-purple-600',
    description: 'Estilo y comodidad',
  },
  Accesorios: {
    icon: 'sparkles',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Detalles que enamoran',
  },
  Juguetes: {
    icon: 'toy',
    gradient: 'from-green-500 to-emerald-600',
    description: 'Diversión garantizada',
  },
  Camas: {
    icon: 'bed',
    gradient: 'from-indigo-500 to-blue-600',
    description: 'Descanso premium',
  },
  Collares: {
    icon: 'circle',
    gradient: 'from-orange-500 to-amber-600',
    description: 'Seguridad con estilo',
  },
  Comederos: {
    icon: 'food',
    gradient: 'from-red-500 to-pink-600',
    description: 'Hora de comer',
  },
}

export function CategoryGrid3D({ categories }: { categories: Category[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  // If no categories from DB, use defaults
  const displayCategories =
    categories.length > 0
      ? categories
      : Object.keys(categoryImages).map((name) => ({
          id: name.toLowerCase(),
          name,
          subcategories: [],
        }))

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Explora por{' '}
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
              Categoría
            </span>
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Encuentra exactamente lo que tu mascota necesita
          </p>
        </motion.div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {displayCategories.slice(0, 6).map((category, index) => {
            const categoryData = categoryImages[category.name] || {
              icon: 'paw',
              gradient: 'from-gray-500 to-gray-600',
              description: 'Ver productos',
            }

            return (
              <CategoryCard
                key={category.id}
                category={category}
                categoryData={categoryData}
                index={index}
                isInView={isInView}
              />
            )
          })}
        </div>

        {/* View all link */}
        {displayCategories.length > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] font-medium transition-colors"
            >
              Ver todas las categorías
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function CategoryCard({
  category,
  categoryData,
  index,
  isInView,
}: {
  category: Category
  categoryData: { icon: BrandIconName; gradient: string; description: string }
  index: number
  isInView: boolean
}) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = ((y - centerY) / centerY) * -10
    const rotateYValue = ((x - centerX) / centerX) * 10

    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        perspective: '1000px',
      }}
    >
      <Link href={`/collection?category=${category.id}`}>
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{
            rotateX,
            rotateY,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${categoryData.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}
          />

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              transform: 'translateZ(20px)',
            }}
          />

          {/* Content */}
          <div
            className="relative h-full flex flex-col items-center justify-center p-4 text-white"
            style={{
              transform: 'translateZ(30px)',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="mb-3 drop-shadow-lg"
            >
              <BrandIcon name={categoryData.icon} className="h-12 w-12 sm:h-14 sm:w-14" />
            </motion.div>

            {/* Category name */}
            <h3 className="text-lg sm:text-xl font-bold text-center mb-1 drop-shadow-md">
              {category.name}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-white/90 text-center drop-shadow">
              {categoryData.description}
            </p>

            {/* Subcategories count */}
            {category.subcategories.length > 0 && (
              <div className="mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                {category.subcategories.length} subcategorías
              </div>
            )}
          </div>

          {/* Hover arrow */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            style={{
              transform: 'translateZ(40px)',
            }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </motion.div>

          {/* Border glow on hover */}
          <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/30 transition-colors" />
        </motion.div>
      </Link>
    </motion.div>
  )
}
