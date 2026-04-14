import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { HeroManager } from '@/components/admin/hero-manager'

export const metadata: Metadata = { title: "Hero Slides — Admin Harry's Boutique" }

export default async function AdminHeroPage() {
  const [rawSlides, rawProducts] = await Promise.all([
    prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
      include: { product: { select: { id: true, name: true } } },
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, images: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const slides = rawSlides.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    image: s.image,
    order: s.order,
    product: { id: s.product.id, name: s.product.name },
  }))

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    images: p.images,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Hero Slides</h1>
      <HeroManager slides={slides} products={products} />
    </div>
  )
}
