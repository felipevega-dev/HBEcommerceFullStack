import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { HeroCompact } from '@/components/store/hero-compact'
import { CategoryPills } from '@/components/store/category-pills'
import { HomeCatalogSection } from '@/components/store/home-catalog-section'
import { Testimonials } from '@/components/store/testimonials'
import { TrustStrip } from '@/components/ui/trust-strip'
import { Section } from '@/components/ui/section'
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
  description:
    'Compra ropa y accesorios premium para tu mascota. Catálogo curado, envío a todo Chile.',
  openGraph: {
    title: "Harry's Boutique — Ropa y accesorios para mascotas",
    description: 'Compra ropa y accesorios premium para tu mascota.',
    type: 'website',
  },
}

export default async function HomePage() {
  let heroSlidesData: HomeHeroSlide[] = []
  let categoriesData: HomeCategory[] = []
  let productsData: HomeProduct[] = []
  let bestSellersData: HomeProduct[] = []
  let testimonialCount = 0

  try {
    ;[heroSlidesData, categoriesData, productsData, bestSellersData, testimonialCount] =
      await Promise.all([
        prisma.heroSlide.findMany({
          orderBy: { order: 'asc' },
          include: { product: { select: { id: true, name: true } } },
        }),
        prisma.category.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
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
        prisma.product.findMany({
          where: { bestSeller: true, active: true },
          orderBy: { ratingAverage: 'desc' },
          take: 5,
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
        prisma.testimonial.count({ where: { active: true } }),
      ])
  } catch (error) {
    if (!canUseDatabaseFallback(error)) throw error
    logDatabaseFallback('HomePage', error)
  }

  const heroSlides = serialize(heroSlidesData).flatMap((slide) => {
    if (!slide.product) return []
    return [
      {
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        product: { id: slide.product.id, name: slide.product.name },
      },
    ]
  })

  const categories = serialize(categoriesData)
  const mapProduct = (product: HomeProduct) => ({
    id: product.id,
    slug: product.slug || '',
    name: product.name,
    price: product.price.toNumber(),
    images: product.images || [],
    ratingAverage: product.ratingAverage || 0,
    ratingCount: product.ratingCount || 0,
    categoryId: product.categoryId || '',
  })

  const products = productsData.map(mapProduct)
  const bestSellers = bestSellersData.map(mapProduct)

  const skeletonFallback = (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )

  return (
    <div className="space-y-10 md:space-y-14">
      <HeroCompact slides={heroSlides} />

      <Section spacing="sm" className="space-y-6 !py-0">
        <CategoryPills categories={categories} />
        <Suspense fallback={skeletonFallback}>
          <HomeCatalogSection
            products={products}
            categories={categories}
            bestSellers={bestSellers}
          />
        </Suspense>
      </Section>

      {testimonialCount > 0 && (
        <Section spacing="sm">
          <Testimonials />
        </Section>
      )}

      <TrustStrip variant="compact" />
    </div>
  )
}
