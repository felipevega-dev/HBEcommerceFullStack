import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { HeroEpic } from '@/components/store/hero-epic'
import { CategoryShowcase } from '@/components/store/category-showcase'
import { ProductsShowcase } from '@/components/store/products-showcase'
import { BestSeller } from '@/components/store/best-seller'
import { Testimonials } from '@/components/store/testimonials'
import { OurPolicy } from '@/components/store/our-policy'
import { PetCultureGateway } from '@/components/store/pet-culture-gateway'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { canUseDatabaseFallback, logDatabaseFallback } from '@/lib/db-fallback'

export const dynamic = 'force-dynamic'

type HomeHeroSlide = {
  id: string
  title: string
  subtitle: string
  image: string
  product: { id: string; name: string } | null
}

type HomeCategory = {
  id: string
  name: string
  subcategories: string[]
  products: { images: string[] }[]
  _count: { products: number }
}

type HomeProduct = {
  id: string
  slug: string
  name: string
  price: { toNumber: () => number }
  images: string[]
  ratingAverage: number
  ratingCount: number
  categoryId: string
}

export const metadata: Metadata = {
  title: "Harry's Boutique — Ropa y accesorios para mascotas",
  description: 'Descubre nuestra colección exclusiva de ropa y accesorios para tu mascota.',
  openGraph: {
    title: "Harry's Boutique — Ropa y accesorios para mascotas",
    description: 'Descubre nuestra colección exclusiva de ropa y accesorios para tu mascota.',
    type: 'website',
  },
}

export default async function HomePage() {
  let heroSlidesData: HomeHeroSlide[] = []
  let categoriesData: HomeCategory[] = []
  let productsData: HomeProduct[] = []

  try {
    ;[heroSlidesData, categoriesData, productsData] = await Promise.all([
      prisma.heroSlide.findMany({
        orderBy: { order: 'asc' },
        include: { product: { select: { id: true, name: true } } },
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          subcategories: true,
          products: {
            where: { active: true },
            select: { images: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: { select: { products: { where: { active: true } } } },
        },
      }),
      prisma.product.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          images: true,
          ratingAverage: true,
          ratingCount: true,
          categoryId: true,
        },
      }),
    ])
  } catch (error) {
    if (!canUseDatabaseFallback(error)) throw error
    logDatabaseFallback('HomePage', error)
  }

  const heroSlides = serialize(heroSlidesData).flatMap((s) => {
    if (!s.product) return []
    return [
      {
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        image: s.image,
        product: { id: s.product.id, name: s.product.name },
      },
    ]
  })

  const categories = serialize(categoriesData).map((c) => ({
    id: c.id,
    name: c.name,
    subcategories: c.subcategories ?? [],
    productImage: c.products?.[0]?.images?.[0] ?? null,
    productCount: c._count?.products ?? 0,
  }))

  const products = productsData.map((p) => ({
    id: p.id,
    slug: p.slug || '',
    name: p.name,
    price: p.price.toNumber(),
    images: p.images || [],
    ratingAverage: p.ratingAverage || 0,
    ratingCount: p.ratingCount || 0,
    categoryId: p.categoryId || '',
  }))

  const skeletonFallback = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <HeroEpic
        slides={heroSlides}
        stats={{
          customers: 5000,
          products: 500,
          rating: 4.9,
        }}
      />

      {/* Main content - Orden: Categorías → Productos (como Almitas) */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="space-y-16 md:space-y-20 py-12 md:py-16">
          <PetCultureGateway />

          {/* Categorías Destacadas */}
          <CategoryShowcase categories={categories} />

          {/* Productos con Tabs (como Almitas) */}
          <ProductsShowcase products={products} categories={categories} />

          {/* Más Vendidos */}
          <Suspense fallback={skeletonFallback}>
            <BestSeller />
          </Suspense>

          {/* Testimonios */}
          <Testimonials />

          {/* Políticas */}
          <OurPolicy />
        </div>
      </div>
    </main>
  )
}
