'use client'

import { ProductData } from '../types'
import { Tooltip } from '../components/tooltip'
import { BrandIcon } from '@/components/ui/brand-icon'

interface Step6OptionsProps {
  productData: ProductData
  updateField: <K extends keyof ProductData>(field: K, value: ProductData[K]) => void
  errors?: Record<string, string>
}

/**
 * Step 6: Final Options
 * 
 * Collects final product configuration options.
 * Features:
 * - Stock quantity input
 * - Best seller checkbox
 * - Active/visible checkbox
 * - Warning when product is inactive
 * - Contextual help tooltips
 */
export function Step6Options({ productData, updateField, errors = {} }: Step6OptionsProps) {
  const { stock = 0, bestSeller = false, active = true } = productData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <BrandIcon name="settings" className="mr-2 h-5 w-5" />
          Opciones Finales
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Configurá las opciones adicionales del producto
        </p>
      </div>

      {/* Stock Input */}
      <div>
        <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 mb-1">
          <span className="inline-flex items-center">
            Cantidad en Stock
            <Tooltip content="Dejá en 0 si no manejás stock o está agotado" />
          </span>
        </label>
        <input
          type="number"
          id="product-stock"
          value={stock}
          onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="1"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
            errors.stock ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!errors.stock}
          aria-describedby={errors.stock ? 'stock-error' : 'stock-helper'}
        />
        
        {/* Helper Text */}
        <p id="stock-helper" className="mt-1 text-sm text-gray-500">
          Dejá en 0 si no manejás stock
        </p>

        {/* Error Message */}
        {errors.stock && (
          <div id="stock-error" className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errors.stock}</span>
          </div>
        )}
      </div>

      {/* Best Seller Checkbox */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={bestSeller}
            onChange={(e) => updateField('bestSeller', e.target.checked)}
            className="w-5 h-5 mt-0.5 text-black border-gray-300 rounded focus:ring-2 focus:ring-black cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                Mostrar como Más Vendido
              </span>
              <Tooltip content="Aparecerá en la sección de productos destacados" />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Este producto se destacará en la tienda
            </p>
          </div>
        </label>
      </div>

      {/* Active Checkbox */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => updateField('active', e.target.checked)}
            className="w-5 h-5 mt-0.5 text-black border-gray-300 rounded focus:ring-2 focus:ring-black cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                Producto Activo (visible en la tienda)
              </span>
              <Tooltip content="Los clientes podrán ver y comprar este producto" />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Desactivá si querés ocultar el producto temporalmente
            </p>
          </div>
        </label>
      </div>

      {/* Inactive Warning */}
      {!active && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">
                Este producto no estará visible en la tienda
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Los clientes no podrán verlo ni comprarlo hasta que lo actives
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
