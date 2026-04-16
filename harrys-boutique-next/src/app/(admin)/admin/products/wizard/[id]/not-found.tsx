import Link from 'next/link'

/**
 * Not Found page for edit product wizard
 * 
 * Displayed when the requested product ID doesn't exist in the database.
 */
export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            El producto que estás buscando no existe o fue eliminado.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/admin/products/wizard/new"
            className="block w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Crear nuevo producto
          </Link>
          <Link
            href="/admin/products"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Volver a productos
          </Link>
        </div>
      </div>
    </div>
  )
}
