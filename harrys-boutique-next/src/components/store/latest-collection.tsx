import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from './product-card'

export async function LatestCollection() {
  let products: {
    id: string
    slug?: string
    name: string
    price: number
    images: string[]
    ratingAverage: number
    ratingCount: number
  }[] = []
  try {
    const raw = await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        images: true,
        ratingAverage: true,
        ratingCount: true,
      },
    })
    products = raw.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price.toNumber(),
      images: p.images,
      ratingAverage: p.ratingAverage,
      ratingCount: p.ratingCount,
    }))
  } catch {
    // DB not connected
  }

  return (
    <section className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-medium">Últimas Colecciones</h1>
        <p className="text-gray-600 text-sm max-w-2xl mx-auto">
          Descubre nuestras últimas novedades, diseños exclusivos que reflejan las últimas
          tendencias en moda
        </p>
      </div>

      {products.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-[3/4] mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="text-center">
        <Link href="/collection">
          <button className="px-8 py-3 border border-gray-800 hover:bg-gray-800 hover:text-white transition-colors rounded-md">
            Ver Toda la Colección
          </button>
        </Link>
      </div>
    </section>
  )
}
