import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { ProductCard } from './product-card'

interface Props {
  categoryId: string
  subCategory: string
  excludeId: string
}

export async function RelatedProducts({ categoryId, subCategory, excludeId }: Props) {
  let products: {
    id: string
    name: string
    price: number
    images: string[]
    ratingAverage: number
    ratingCount: number
  }[] = []
  try {
    const raw = await prisma.product.findMany({
      where: {
        categoryId,
        subCategory,
        id: { not: excludeId },
        active: true,
      },
      take: 5,
      orderBy: { ratingAverage: 'desc' },
    })
    products = serialize(raw).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      images: p.images,
      ratingAverage: p.ratingAverage,
      ratingCount: p.ratingCount,
    }))
  } catch {
    // DB not connected
  }

  if (products.length === 0) return null

  return (
    <section className="py-16 border-t">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-medium">Productos Relacionados</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre más productos similares que podrían interesarte
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
