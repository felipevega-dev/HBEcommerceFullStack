import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/site'

const BASE_URL = getSiteUrl()

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: `${BASE_URL}/tienda`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    {
      url: `${BASE_URL}/envios`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/devoluciones`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        select: { id: true, slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        select: { name: true, createdAt: true },
        orderBy: { name: 'asc' },
      }),
    ])

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${BASE_URL}/product/${p.slug || p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${BASE_URL}/tienda?category=${encodeURIComponent(category.name)}`,
      lastModified: category.createdAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticPages, ...categoryUrls, ...productUrls]
  } catch (error) {
    console.error('[sitemap] Failed to load product URLs', error)
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
    return staticPages
  }
}
