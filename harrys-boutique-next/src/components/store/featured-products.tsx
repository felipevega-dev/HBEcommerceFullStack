import { ProductCard } from './product-card'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  ratingAverage: number
  ratingCount: number
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section>
      <h2 className="text-2xl font-medium mb-6">Más vendidos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
