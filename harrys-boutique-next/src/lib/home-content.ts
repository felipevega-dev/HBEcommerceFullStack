import { prisma } from '@/lib/prisma'

const FEATURED_SECTION = 'FEATURED'

export type HomeCollection = {
  id: string
  title: string
  description: string | null
  href: string
  image: string | null
}

export type HomeProduct = {
  id: string
  name: string
  image: string | null
  href: string
  isNew: boolean
  price: number
  mercadoLibreUrl: string | null
  mercadoLibreItemId: string | null
}

export type HomeInstagramPost = {
  id: string
  imageUrl: string
  instagramUrl: string
  altText: string
  caption: string | null
  likes: number | null
}

export type HomeTestimonial = {
  name: string
  role: string
  comment: string
  rating: number
  avatar: string | null
}

export type HomeCategoryBlock = {
  categoryId: string
  title: string
  mode: 'AUTO' | 'MANUAL'
  maxItems: number
  order: number
  products: HomeProduct[]
}

export type HomeContent = {
  collections: HomeCollection[]
  products: HomeProduct[]
  instagramPosts: HomeInstagramPost[]
  testimonial: HomeTestimonial | null
  categoryBlocks: HomeCategoryBlock[]
}

function productImage(images: string[]) {
  return images.find((image) => image.trim().length > 0) ?? null
}

function productToHomeProduct(product: {
  id: string
  name: string
  images: string[]
  slug: string
  price: unknown
  createdAt: Date
  mercadoLibreUrl: string | null
  mercadoLibreItemId: string | null
}) {
  return {
    id: product.id,
    name: product.name,
    image: productImage(product.images),
    href: `/product/${product.slug || product.id}`,
    isNew: Date.now() - product.createdAt.getTime() < 1000 * 60 * 60 * 24 * 30,
    price: Number(product.price),
    mercadoLibreUrl: product.mercadoLibreUrl,
    mercadoLibreItemId: product.mercadoLibreItemId,
  }
}

export async function getHomeContent(): Promise<HomeContent> {
  const [categories, configuredProducts, instagramPosts, testimonials, categoryBlocks] =
    await Promise.all([
      prisma.category.findMany({
        where: { active: true, homeVisible: true },
        orderBy: [{ homeOrder: 'asc' }, { name: 'asc' }],
        include: {
          products: {
            where: {
              active: true,
              OR: [{ stock: { gt: 0 } }, { mercadoLibreUrl: { not: null } }],
            },
            orderBy: { updatedAt: 'desc' },
            select: { images: true },
            take: 1,
          },
        },
      }),
      prisma.homeProductSelection.findMany({
        where: { section: FEATURED_SECTION, visible: true, product: { active: true } },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              slug: true,
              price: true,
              createdAt: true,
              mercadoLibreUrl: true,
              mercadoLibreItemId: true,
            },
          },
        },
      }),
      prisma.instagramPost.findMany({
        where: {
          homeVisible: true,
          imageUrl: { not: '' },
          instagramUrl: { not: null },
        },
        orderBy: [{ homeOrder: 'asc' }, { createdAt: 'desc' }],
        take: 6,
      }),
      prisma.testimonial.findFirst({
        where: { active: true, status: 'APPROVED' },
        orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      }),
      prisma.homeCategoryBlock.findMany({
        where: { visible: true, category: { active: true, homeVisible: true } },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          category: {
            select: {
              id: true,
              name: true,
              products: {
                where: {
                  active: true,
                  OR: [{ stock: { gt: 0 } }, { mercadoLibreUrl: { not: null } }],
                },
                orderBy: [{ bestSeller: 'desc' }, { updatedAt: 'desc' }],
                take: 24,
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true,
                  price: true,
                  createdAt: true,
                  mercadoLibreUrl: true,
                  mercadoLibreItemId: true,
                },
              },
            },
          },
          items: {
            where: {
              visible: true,
              product: {
                active: true,
                OR: [{ stock: { gt: 0 } }, { mercadoLibreUrl: { not: null } }],
              },
            },
            orderBy: { order: 'asc' },
            take: 24,
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true,
                  price: true,
                  createdAt: true,
                  mercadoLibreUrl: true,
                  mercadoLibreItemId: true,
                },
              },
            },
          },
        },
      }),
    ])

  const fallbackProducts =
    configuredProducts.length > 0
      ? configuredProducts.map((selection) => productToHomeProduct(selection.product))
      : (
          await prisma.product.findMany({
            where: {
              active: true,
              bestSeller: true,
              OR: [{ stock: { gt: 0 } }, { mercadoLibreUrl: { not: null } }],
            },
            orderBy: [{ ratingAverage: 'desc' }, { createdAt: 'desc' }],
            take: 4,
            select: {
              id: true,
              name: true,
              images: true,
              slug: true,
              price: true,
              createdAt: true,
              mercadoLibreUrl: true,
              mercadoLibreItemId: true,
            },
          })
        ).map(productToHomeProduct)

  return {
    collections: categories.map((category) => ({
      id: category.id,
      title: category.name,
      description: category.homeDescription,
      href: (category.homeHref || `/tienda?category=${encodeURIComponent(category.name)}`).replace(
        /^\/collection(?=\?|$)/,
        '/tienda',
      ),
      image: category.homeImage || productImage(category.products[0]?.images ?? []),
    })),
    products: fallbackProducts,
    instagramPosts: instagramPosts.map((post) => ({
      id: post.id,
      imageUrl: post.imageUrl,
      instagramUrl: post.instagramUrl!,
      altText: post.altText?.trim() || post.title,
      caption: post.homeCaption || post.finalCaption || post.captionDraft,
      likes: post.likes,
    })),
    testimonial: testimonials
      ? {
          name: testimonials.name,
          role: testimonials.role,
          comment: testimonials.comment,
          rating: testimonials.rating,
          avatar: testimonials.avatar,
        }
      : null,
    categoryBlocks: categoryBlocks.map((block) => ({
      categoryId: block.category.id,
      title: block.category.name,
      mode: block.mode === 'MANUAL' ? 'MANUAL' : 'AUTO',
      maxItems: block.maxItems,
      order: block.order,
      products: (block.mode === 'MANUAL'
        ? block.items.map((item) => item.product)
        : block.category.products
      )
        .slice(0, block.maxItems)
        .map(productToHomeProduct),
    })),
  }
}
