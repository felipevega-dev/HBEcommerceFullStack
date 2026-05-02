'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'

/**
 * Error boundary for the edit product wizard page
 * 
 * Catches and displays errors that occur during wizard initialization,
 * product fetching, or category fetching.
 */
export default function EditProductWizardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Edit Product Wizard Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BrandIcon name="x-circle" className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar el producto
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Ocurrió un error al cargar el producto para editar. 
            El producto puede no existir o hubo un problema de conexión.
          </p>
          {error.message && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Intentar de nuevo
          </button>
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
