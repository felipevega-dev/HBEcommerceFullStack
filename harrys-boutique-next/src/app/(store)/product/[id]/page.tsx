import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductGallery } from '@/components/store/product-gallery'
import { ProductInfo } from '@/components/store/product-info'
import { ProductReviews } from '@/components/store/product-reviews'
import { RelatedProducts } from '@/components/store/related-products'
import { getProductByIdOrSlug } from '@/lib/catalog'
import { getSiteUrl } from '@/lib/site'
import { getProductStructuredData, stringifyJsonLd } from '@/lib/structured-data'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductByIdOrSlug(id)
  if (!product) return { title: 'Producto no encontrado' }

  const baseUrl = getSiteUrl()
  const canonical = `${baseUrl}/product/${product.slug || product.id}`
  const title = product.seoTitle?.trim() || `${product.name} | Harry's Boutique`
  const description = product.seoDescription?.trim() || product.description.slice(0, 160)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
      type: 'website',
      siteName: "Harry's Boutique",
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params

  const rawProduct = await getProductByIdOrSlug(id)

  if (!rawProduct) notFound()

  const product = {
    id: rawProduct.id,
    slug: rawProduct.slug,
    name: rawProduct.name,
    description: rawProduct.description,
    seoTitle: rawProduct.seoTitle,
    seoDescription: rawProduct.seoDescription,
    mercadoLibreUrl: rawProduct.mercadoLibreUrl,
    mercadoLibreItemId: rawProduct.mercadoLibreItemId,
    mercadoLibreStatus: rawProduct.mercadoLibreStatus,
    price: Number(rawProduct.price),
    originalPrice: rawProduct.originalPrice ? Number(rawProduct.originalPrice) : null,
    images: rawProduct.images,
    colors: rawProduct.colors,
    sizes: rawProduct.sizes,
    stock: rawProduct.stock,
    variants: rawProduct.variants,
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

  const reviews = rawReviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    user: { name: review.user.name, profileImage: review.user.profileImage },
  }))

  const productUrl = `${getSiteUrl()}/product/${product.slug || product.id}`
  const productStructuredData = getProductStructuredData({
    id: product.id,
    name: product.name,
    description: product.description,
    images: product.images,
    category: [product.category.name, product.subCategory].filter(Boolean).join(' > '),
    price: product.price,
    stock: product.stock,
    ratingAverage: product.ratingAverage,
    ratingCount: product.ratingCount,
    mercadoLibreUrl: product.mercadoLibreUrl,
    mercadoLibreItemId: product.mercadoLibreItemId,
    mercadoLibreStatus: product.mercadoLibreStatus,
    url: productUrl,
  })

  return (
    <div className="border-t pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(productStructuredData) }}
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
