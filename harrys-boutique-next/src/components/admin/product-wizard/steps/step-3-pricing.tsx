'use client'

import { ProductData } from '../types'
import { Tooltip } from '../components/tooltip'
import { calculateDiscountPercentage } from '../utils/format-helpers'

interface Step3PricingProps {
  productData: ProductData
  updateField: <K extends keyof ProductData>(field: K, value: ProductData[K]) => void
  errors?: Record<string, string>
}

/**
 * Step 3: Pricing
 * 
 * Collects product pricing information with optional discount calculation.
 * Features:
 * - Selling price input
 * - Optional discount toggle
 * - Original price input (when discount enabled)
 * - Automatic discount percentage calculation
 * - Contextual help tooltips
 */
export function Step3Pricing({ productData, updateField, errors = {} }: Step3PricingProps) {
  const { price = 0, hasDiscount = false, originalPrice } = productData

  const discountPercentage = hasDiscount && originalPrice && price
    ? calculateDiscountPercentage(originalPrice, price)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          💰 Precio
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Configurá el precio de tu producto
        </p>
      </div>

      {/* Selling Price */}
      <div>
        <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
          <span className="inline-flex items-center">
            Precio de Venta *
            <Tooltip content="El precio que verán tus clientes en la tienda" />
          </span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            $
          </span>
          <input
            type="number"
            id="product-price"
            value={price || ''}
            onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
            placeholder="2500"
            min="0"
            step="1"
            className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.price}
            aria-describedby={errors.price ? 'price-error' : undefined}
          />
        </div>

        {/* Error Message */}
        {errors.price && (
          <div id="price-error" className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errors.price}</span>
          </div>
        )}
      </div>

      {/* Discount Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasDiscount}
            onChange={(e) => {
              updateField('hasDiscount', e.target.checked)
              if (!e.target.checked) {
                updateField('originalPrice', undefined)
              }
            }}
            className="w-5 h-5 text-black border-gray-300 rounded focus:ring-2 focus:ring-black cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">
            Este producto tiene descuento
          </span>
        </label>
      </div>

      {/* Original Price (conditional) */}
      {hasDiscount && (
        <div className="space-y-4 pl-8 border-l-2 border-gray-200">
          <div>
            <label htmlFor="original-price" className="block text-sm font-medium text-gray-700 mb-1">
              <span className="inline-flex items-center">
                Precio Original (antes del descuento) *
                <Tooltip content="El precio anterior tachado que se mostrará junto al descuento" />
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                id="original-price"
                value={originalPrice || ''}
                onChange={(e) => updateField('originalPrice', parseFloat(e.target.value) || undefined)}
                placeholder="3500"
                min="0"
                step="1"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                  errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={!!errors.originalPrice}
                aria-describedby={errors.originalPrice ? 'original-price-error' : undefined}
              />
            </div>

            {/* Error Message */}
            {errors.originalPrice && (
              <div id="original-price-error" className="flex items-center gap-2 text-red-600 text-sm mt-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errors.originalPrice}</span>
              </div>
            )}
          </div>

          {/* Discount Percentage Display */}
          {discountPercentage > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-lg font-semibold text-green-800">
                    {discountPercentage}% de descuento
                  </p>
                  <p className="text-sm text-green-700">
                    Tus clientes ahorran ${Math.round((originalPrice || 0) - price)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
