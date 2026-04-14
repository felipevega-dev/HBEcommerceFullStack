import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { ProductCard } from './product-card'

export async function LatestCollection() {
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
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    products = serialize(raw).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      images: p.images,
      ratingAverage: p.ratingAverage,
      ratingCount: p.ratingCount,
    }))
    console.log('[LatestCollection] first product sample:', JSON.stringify(products[0]))
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
