import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { HeroSection } from '@/components/store/hero-section'
import { LatestCollection } from '@/components/store/latest-collection'
import { BestSeller } from '@/components/store/best-seller'
import { OurPolicy } from '@/components/store/our-policy'
import { NewsletterBox } from '@/components/store/newsletter-box'
import { CategoryGrid } from '@/components/store/category-grid'
import { Testimonials } from '@/components/store/testimonials'
import { SkeletonCard } from '@/components/ui/skeleton-card'

export const revalidate = 60

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
  const [heroSlidesResult, categoriesResult] = await Promise.allSettled([
    prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
      include: { product: { select: { id: true, name: true } } },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, subcategories: true },
    }),
  ])

  const heroSlides =
    heroSlidesResult.status === 'fulfilled'
      ? serialize(heroSlidesResult.value).flatMap((s) => {
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
      : []

  const categories: { id: string; name: string; subcategories: string[] }[] =
    categoriesResult.status === 'fulfilled'
      ? serialize(categoriesResult.value).map((c) => ({
          id: c.id,
          name: c.name,
          subcategories: c.subcategories ?? [],
        }))
      : []

  const skeletonFallback = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )

  return (
    <main className="flex flex-col gap-16 md:gap-24">
      <HeroSection slides={heroSlides} />
      <section aria-label="Contenido principal de la tienda" className="space-y-16 md:space-y-24">
        <CategoryGrid categories={categories} />
        <Suspense fallback={skeletonFallback}>
          <LatestCollection />
        </Suspense>
        <Suspense fallback={skeletonFallback}>
          <BestSeller />
        </Suspense>
        <Testimonials />
        <OurPolicy />
        <NewsletterBox />
      </section>
    </main>
  )
}
