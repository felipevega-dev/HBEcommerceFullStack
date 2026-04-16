'use client'

import { ProductData } from '../types'
import { Tooltip } from '../components/tooltip'
import { CharacterCounter } from '../components/character-counter'

interface Step2BasicInfoProps {
  productData: ProductData
  updateField: <K extends keyof ProductData>(field: K, value: ProductData[K]) => void
  errors?: Record<string, string>
  clearFieldError?: (field: string) => void
}

/**
 * Step 2: Basic Information
 * 
 * Collects product name and description with character counters and helpful tooltips.
 * Features:
 * - Name input (3-100 characters)
 * - Description textarea (10-500 characters)
 * - Real-time character counting
 * - Contextual help tooltips
 * - Example placeholders
 */
export function Step2BasicInfo({ productData, updateField, errors = {}, clearFieldError }: Step2BasicInfoProps) {
  const { name = '', description = '' } = productData

  const MAX_NAME_LENGTH = 100
  const MAX_DESCRIPTION_LENGTH = 500
  
  /**
   * Handle name change and clear error if exists
   */
  const handleNameChange = (value: string) => {
    updateField('name', value)
    if (errors.name && clearFieldError) {
      clearFieldError('name')
    }
  }
  
  /**
   * Handle description change and clear error if exists
   */
  const handleDescriptionChange = (value: string) => {
    updateField('description', value)
    if (errors.description && clearFieldError) {
      clearFieldError('description')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          📝 Información Básica
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Contanos sobre tu producto
        </p>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Producto *
        </label>
        <input
          type="text"
          id="product-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Ej: Collar para Perro Ajustable"
          maxLength={MAX_NAME_LENGTH}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        
        {/* Character Counter */}
        <div className="mt-1">
          <CharacterCounter current={name.length} max={MAX_NAME_LENGTH} />
        </div>

        {/* Error Message */}
        {errors.name && (
          <div id="name-error" className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errors.name}</span>
          </div>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">
          <span className="inline-flex items-center">
            Descripción *
            <Tooltip content="Describí las características principales: material, tamaño, para qué mascota es" />
          </span>
        </label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Ej: Collar ajustable de nylon resistente, ideal para perros de todas las razas. Incluye hebilla de seguridad y anillo para correa. Disponible en varios colores y tallas."
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        
        {/* Character Counter - showing trimmed length */}
        <div className="mt-1 flex items-center justify-between">
          <CharacterCounter current={description.trim().length} max={MAX_DESCRIPTION_LENGTH} />
          {description.trim().length !== description.length && (
            <span className="text-xs text-gray-400">
              ({description.length} con espacios)
            </span>
          )}
        </div>

        {/* Error Message */}
        {errors.description && (
          <div id="description-error" className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errors.description}</span>
          </div>
        )}

        {/* Helpful Tip */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Tip para una buena descripción:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Mencioná el material y la calidad</li>
                <li>Indicá para qué tipo de mascota es</li>
                <li>Destacá características especiales</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
