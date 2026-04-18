'use client'

import Link from 'next/link'

interface LowStockProduct {
  id: string
  name: string
  stock: number
  images: string[] | null
}

export function LowStockAlert({ products }: { products: LowStockProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <h3 className="text-lg font-semibold mb-4">Alertas de inventario</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Sin alertas de stock</p>
        </div>
      </div>
    )
  }

  const outOfStock = products.filter(p => p.stock === 0).length
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Alertas de inventario</h3>
        {(outOfStock > 0 || lowStock > 0) && (
          <div className="flex gap-2">
            {outOfStock > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                {outOfStock} sin stock
              </span>
            )}
            {lowStock > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                {lowStock} bajo stock
              </span>
            )}
          </div>
        )}
      </div>
      <div className="space-y-3">
        {products.slice(0, 5).map((product) => (
          <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {product.images?.[0] && (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className={`text-xs ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {product.stock === 0 ? 'Sin stock' : `${product.stock} unidades`}
              </p>
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
      {products.length > 5 && (
        <Link href="/admin/products?stock=low" className="block text-center text-sm text-blue-600 mt-4 hover:underline">
          Ver todos los productos con bajo stock ({products.length})
        </Link>
      )}
    </div>
  )
}