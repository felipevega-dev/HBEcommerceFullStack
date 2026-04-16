'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Error boundary for the new product wizard page
 * 
 * Catches and displays errors that occur during wizard initialization
 * or while fetching categories.
 */
export default function NewProductWizardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('New Product Wizard Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar el wizard
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Ocurrió un error al inicializar el wizard de productos. 
            Por favor intentá de nuevo.
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
