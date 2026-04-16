'use client'

import { ProductData } from '../types'
import { Tooltip } from '../components/tooltip'
import { formatSelectionCount } from '../utils/format-helpers'

interface Step5SizesColorsProps {
  productData: ProductData
  updateField: <K extends keyof ProductData>(field: K, value: ProductData[K]) => void
  errors?: Record<string, string>
}

// Available sizes
const SIZES = ['XS', 'S', 'M', 'L', 'XL']

// Available colors with display info
const COLORS = [
  { id: 'black', name: 'Negro', hex: '#000000' },
  { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
  { id: 'red', name: 'Rojo', hex: '#EF4444' },
  { id: 'blue', name: 'Azul', hex: '#3B82F6' },
  { id: 'green', name: 'Verde', hex: '#10B981' },
  { id: 'yellow', name: 'Amarillo', hex: '#F59E0B' },
  { id: 'pink', name: 'Rosa', hex: '#EC4899' },
  { id: 'brown', name: 'Marrón', hex: '#92400E' },
  { id: 'gray', name: 'Gris', hex: '#6B7280' },
  { id: 'orange', name: 'Naranja', hex: '#F97316' },
]

/**
 * Step 5: Sizes and Colors
 * 
 * Multi-select for product sizes and colors with visual feedback.
 * Features:
 * - Size toggle buttons
 * - Color swatches with names
 * - Multi-select support
 * - Selection counters
 * - Visual selection feedback
 */
export function Step5SizesColors({ productData, updateField, errors = {} }: Step5SizesColorsProps) {
  const { sizes = [], colors = [] } = productData

  const toggleSize = (size: string) => {
    const newSizes = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size]
    updateField('sizes', newSizes)
  }

  const toggleColor = (colorId: string) => {
    const newColors = colors.includes(colorId)
      ? colors.filter((c) => c !== colorId)
      : [...colors, colorId]
    updateField('colors', newColors)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          📏 Tallas y Colores
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Seleccioná las opciones disponibles para tu producto
        </p>
      </div>

      {/* Sizes Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <span className="inline-flex items-center">
            Tallas disponibles *
            <Tooltip content="Seleccioná todas las tallas disponibles para este producto" />
          </span>
        </label>

        <div className="flex flex-wrap gap-3">
          {SIZES.map((size) => {
            const isSelected = sizes.includes(size)
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-6 py-3 rounded-lg border-2 font-medium transition-all hover:scale-105 ${
                  isSelected
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>

        {/* Selection Counter */}
        <p className="mt-2 text-sm text-gray-600">
          {formatSelectionCount(sizes.length, 'talla')}
        </p>

        {/* Error Message */}
        {errors.sizes && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errors.sizes}</span>
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <span className="inline-flex items-center">
            Colores disponibles *
            <Tooltip content="Seleccioná todos los colores disponibles para este producto" />
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {COLORS.map((color) => {
            const isSelected = colors.includes(color.id)
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => toggleColor(color.id)}
                className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {/* Color Swatch */}
                  <div
                    className="w-12 h-12 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  
                  {/* Color Name */}
                  <span className="text-sm font-medium text-gray-900">{color.name}</span>
                </div>

                {/* Checkmark Overlay */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Selection Counter */}
        <p className="mt-2 text-sm text-gray-600">
          {formatSelectionCount(colors.length, 'color')}
        </p>

        {/* Error Message */}
        {errors.colors && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errors.colors}</span>
          </div>
        )}
      </div>
    </div>
  )
}
