import { prisma } from '@/lib/prisma'
import { SectionTitle } from './editorial'
import { ProductCard } from './product-card'

interface Props {
  categoryId: string
  subCategory: string
  excludeId: string
}

export async function RelatedProducts({ categoryId, subCategory, excludeId }: Props) {
  const raw = await prisma.product.findMany({
    where: {
      categoryId,
      subCategory,
      id: { not: excludeId },
      active: true,
    },
    take: 5,
    orderBy: { ratingAverage: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      images: true,
      ratingAverage: true,
      ratingCount: true,
      mercadoLibreUrl: true,
      mercadoLibreItemId: true,
      mercadoLibreStatus: true,
    },
  })
  const products = raw.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price.toNumber(),
    images: p.images,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    mercadoLibreUrl: p.mercadoLibreUrl,
    mercadoLibreItemId: p.mercadoLibreItemId,
    mercadoLibreStatus: p.mercadoLibreStatus,
  }))

  if (products.length === 0) return null

  return (
    <section className="border-t border-[var(--color-stitch-line)] py-16">
      <div className="space-y-12">
        <SectionTitle eyebrow="MÁS DEL ATELIER" title="Productos relacionados" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
