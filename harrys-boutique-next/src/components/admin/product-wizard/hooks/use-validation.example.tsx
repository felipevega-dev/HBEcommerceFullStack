/**
 * Example usage of useValidation hook
 * 
 * This file demonstrates how to use the validation hook in wizard step components.
 */

import { useState } from 'react'
import { useValidation } from './use-validation'
import type { ProductData } from '../types'

/**
 * Example: Basic usage in a wizard step component
 */
export function ExampleStep2BasicInfo({ 
  productData, 
  currentStep,
  onNext 
}: {
  productData: ProductData
  currentStep: number
  onNext: () => void
}) {
  const {
    errors,
    validateStep,
    clearFieldError,
    registerField,
    focusFirstError,
    getFieldError,
    hasFieldError
  } = useValidation(currentStep, productData)

  const handleNext = () => {
    // Validate before advancing
    const isValid = validateStep()
    
    if (isValid) {
      onNext()
    } else {
      // Focus the first field with an error
      focusFirstError()
    }
  }

  return (
    <div className="space-y-4">
      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nombre del Producto *
        </label>
        <input
          id="name"
          type="text"
          ref={(el) => registerField('name', el)}
          className={`mt-1 block w-full rounded-lg border ${
            hasFieldError('name') 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-black'
          }`}
          onChange={() => {
            // Clear error when user starts typing
            if (hasFieldError('name')) {
              clearFieldError('name')
            }
          }}
        />
        {/* Display error message */}
        {getFieldError('name') && (
          <p className="mt-1 text-sm text-red-500">
            {getFieldError('name')}
          </p>
        )}
      </div>

      {/* Description Textarea */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción *
        </label>
        <textarea
          id="description"
          ref={(el) => registerField('description', el)}
          className={`mt-1 block w-full rounded-lg border ${
            hasFieldError('description')
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-black'
          }`}
          rows={4}
          onChange={() => {
            if (hasFieldError('description')) {
              clearFieldError('description')
            }
          }}
        />
        {getFieldError('description') && (
          <p className="mt-1 text-sm text-red-500">
            {getFieldError('description')}
          </p>
        )}
      </div>

      {/* Navigation Button */}
      <button
        onClick={handleNext}
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        Siguiente
      </button>
    </div>
  )
}

/**
 * Example: Using validation in wizard container
 */
export function ExampleWizardContainer() {
  const [currentStep, setCurrentStep] = useState(1)
  const [productData, setProductData] = useState<ProductData>({
    images: [],
    imageOrder: [],
    name: '',
    description: '',
    price: 0,
    hasDiscount: false,
    categoryId: '',
    subCategory: '',
    sizes: [],
    colors: [],
    stock: 0,
    bestSeller: false,
    active: true
  })

  const {
    validateStep,
    focusFirstError,
    hasErrors
  } = useValidation(currentStep, productData)

  const handleNext = () => {
    // Validate current step
    const isValid = validateStep()
    
    if (isValid) {
      // Advance to next step
      setCurrentStep(prev => prev + 1)
    } else {
      // Focus first error field
      focusFirstError()
    }
  }

  const handleBack = () => {
    // No validation needed when going back
    setCurrentStep(prev => prev - 1)
  }

  return (
    <div>
      {/* Render current step component */}
      {/* ... */}
      
      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <button onClick={handleBack}>
            Anterior
          </button>
        )}
        
        <button 
          onClick={handleNext}
          disabled={hasErrors()}
        >
          {currentStep === 7 ? 'Guardar Producto' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}

/**
 * Example: Programmatic validation without user interaction
 */
export function ExampleProgrammaticValidation() {
  const productData: ProductData = {
    images: ['image1.jpg'],
    imageOrder: [0],
    name: 'Test Product',
    description: 'This is a test description',
    price: 100,
    hasDiscount: false,
    categoryId: 'dogs',
    subCategory: 'collars',
    sizes: ['M'],
    colors: ['black'],
    stock: 10,
    bestSeller: false,
    active: true
  }

  const { validateStep, errors } = useValidation(2, productData)

  // Validate programmatically
  const isValid = validateStep()
  
  if (!isValid) {
    console.log('Validation errors:', errors)
    // errors = { name: 'El nombre debe tener al menos 3 caracteres' }
  }

  return null
}
