import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const getProductByIdOrSlug = cache(async (idOrSlug: string) => {
  return prisma.product.findFirst({
    where: { active: true, OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      price: true,
      originalPrice: true,
      images: true,
      colors: true,
      sizes: true,
      stock: true,
      ratingAverage: true,
      ratingCount: true,
      categoryId: true,
      subCategory: true,
      category: { select: { name: true } },
    },
  })
})
