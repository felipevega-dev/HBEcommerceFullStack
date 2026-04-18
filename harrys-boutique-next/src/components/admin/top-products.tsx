'use client'

import Link from 'next/link'

interface TopProduct {
  id: string
  name: string
  images: string[]
  price: number
  totalSold: number
}

export function TopProducts({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <h3 className="text-lg font-semibold mb-4">Top productos más vendidos</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No hay datos de ventas aún</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
      <h3 className="text-lg font-semibold mb-4">Top productos más vendidos</h3>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {product.images[0] && (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-gray-500">${product.price.toLocaleString('es-CL')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-600">{product.totalSold}</p>
              <p className="text-xs text-gray-500">vendidos</p>
            </div>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="text-xs text-blue-600 hover:underline"
            >
              Editar
            </Link>
          </div>
        ))}
      </div>
      <Link href="/admin/products?sort=sales" className="block text-center text-sm text-blue-600 mt-4 hover:underline">
        Ver todos los productos
      </Link>
    </div>
  )
}