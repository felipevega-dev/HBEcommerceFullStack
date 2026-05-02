import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductGallery } from '@/components/store/product-gallery'
import { ProductInfo } from '@/components/store/product-info'
import { ProductReviews } from '@/components/store/product-reviews'
import { RelatedProducts } from '@/components/store/related-products'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  // Support both UUID and slug lookup
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      images: true,
    },
  })
  if (!product) return { title: 'Producto no encontrado' }

  const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://harrys-boutique.com'

  return {
    title: `${product.name} — Harry's Boutique`,
    description: product.description.slice(0, 160),
    alternates: { canonical: `${BASE_URL}/producto/${product.slug || product.id}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params

  // Support both UUID and slug lookup
  const rawProduct = await prisma.product.findFirst({
    where: { active: true, OR: [{ id }, { slug: id }] },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
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

  if (!rawProduct) notFound()

  const product = {
    id: rawProduct.id,
    slug: rawProduct.slug,
    name: rawProduct.name,
    description: rawProduct.description,
    price: Number(rawProduct.price),
    originalPrice: rawProduct.originalPrice ? Number(rawProduct.originalPrice) : null,
    images: rawProduct.images,
    colors: rawProduct.colors,
    sizes: rawProduct.sizes,
    stock: rawProduct.stock,
    ratingAverage: rawProduct.ratingAverage,
    ratingCount: rawProduct.ratingCount,
    categoryId: rawProduct.categoryId,
    subCategory: rawProduct.subCategory,
    category: rawProduct.category,
  }

  const rawReviews = await prisma.review.findMany({
    where: { productId: rawProduct.id, approved: true },
    include: { user: { select: { name: true, profileImage: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const reviews = rawReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    user: { name: r.user.name, profileImage: r.user.profileImage },
  }))

  return (
    <div className="border-t pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.images,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'ARS',
              availability:
                product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
            ...(product.ratingCount > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.ratingAverage,
                reviewCount: product.ratingCount,
              },
            }),
          }),
        }}
      />
      <div className="flex flex-col lg:flex-row gap-12">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} categoryName={product.category.name} />
      </div>
      <ProductReviews
        productId={rawProduct.id}
        reviews={reviews}
        ratingAverage={product.ratingAverage}
        ratingCount={product.ratingCount}
      />
      <RelatedProducts
        categoryId={product.categoryId}
        subCategory={product.subCategory}
        excludeId={rawProduct.id}
      />
    </div>
  )
}
