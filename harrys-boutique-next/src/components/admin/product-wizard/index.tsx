/**
 * Product Wizard - Main Container Component
 * 
 * A 7-step guided interface for creating and editing products in the admin panel.
 * Designed for non-technical users with visual feedback, validation, and auto-save.
 * 
 * Features:
 * - Step-by-step navigation with progress indicator
 * - Auto-save to localStorage
 * - Drag-and-drop image upload
 * - Real-time validation
 * - Responsive design (mobile, tablet, desktop)
 * - Keyboard navigation and accessibility
 * 
 * @see requirements.md for detailed requirements
 * @see design.md for architecture and UI design
 */

'use client';

import { useEffect, useState } from 'react'
import { useWizardState } from './hooks/use-wizard-state'
import { useAutoSave } from './hooks/use-auto-save'
import { useValidation } from './hooks/use-validation'
import type { ProductData } from './types'
import {
  Step1Photos,
  Step2BasicInfo,
  Step3Pricing,
  Step4Category,
  Step5SizesColors,
  Step6Options,
  Step7Review,
} from './steps'
import { SuccessModal, ErrorModal } from './modals'

interface ProductWizardProps {
  /**
   * Product ID for edit mode. If undefined, wizard is in create mode.
   */
  productId?: string;
  
  /**
   * Initial product data for edit mode
   */
  initialData?: ProductData;
  
  /**
   * Available categories for Step 4 (Category Selection)
   */
  categories?: any[];
}

/**
 * Main Product Wizard component
 * 
 * Orchestrates all 7 steps of the product creation/editing wizard.
 * Manages state, validation, auto-save, and step navigation.
 * 
 * Steps:
 * 1. Photo Upload
 * 2. Basic Information
 * 3. Pricing
 * 4. Category Selection
 * 5. Sizes and Colors
 * 6. Final Options
 * 7. Review
 */
export default function ProductWizard({ productId, initialData, categories }: ProductWizardProps) {
  // Wizard state management
  const wizard = useWizardState(initialData)
  
  // Validation
  const validation = useValidation(wizard.currentStep, wizard.productData)
  
  // Loading states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [savedProductId, setSavedProductId] = useState<string | undefined>(productId)
  
  /**
   * Handle next step navigation
   * Validates current step before advancing
   */
  const handleNext = () => {
    // Validate current step
    const isValid = validation.validateStep()
    
    if (!isValid) {
      // Focus first error field
      validation.focusFirstError()
      return
    }
    
    // Clear errors and advance
    validation.clearErrors()
    wizard.nextStep()
  }
  
  /**
   * Handle previous step navigation
   * No validation required for going back
   */
  const handlePrevious = () => {
    validation.clearErrors()
    wizard.prevStep()
  }
  
  /**
   * Handle cancel button
   * Navigate back to products list
   */
  const handleCancel = () => {
    window.location.href = '/admin/products'
  }
  
  /**
   * Handle final save
   * Uploads images and saves product data
   */
  const handleSave = async () => {
    // Final validation
    const isValid = validation.validateStep()
    
    if (!isValid) {
      validation.focusFirstError()
      return
    }
    
    // Set saving state
    wizard.setSaving(true)
    
    try {
      // Step 1: Upload new images to Vercel Blob Storage
      const imageUrls = await uploadImages(wizard.productData.images)
      
      // Step 2: Prepare product data payload
      const payload = prepareProductPayload(wizard.productData, imageUrls)
      
      // Step 3: Save to API with retry logic
      const response = await saveProductWithRetry(payload, productId)
      
      if (!response.success) {
        throw new Error(response.message || 'Error al guardar el producto')
      }
      
      // Step 4: Success - no draft to clear
      
      // Step 5: Store the saved product ID for navigation
      setSavedProductId(response.product?._id || response.product?.id || productId)
      
      // Step 6: Show success modal
      setShowSuccessModal(true)
      
    } catch (error) {
      console.error('Error saving product:', error)
      
      // Show error modal with message
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      setErrorMessage(errorMsg)
      setShowErrorModal(true)
      
    } finally {
      wizard.setSaving(false)
    }
  }
  
  /**
   * Upload images to Vercel Blob Storage
   * Handles both new File objects and existing URL strings
   */
  const uploadImages = async (images: File[] | string[]): Promise<string[]> => {
    const urls: string[] = []
    
    for (const image of images) {
      // If it's already a URL (existing image in edit mode), keep it
      if (typeof image === 'string') {
        urls.push(image)
        continue
      }
      
      // If it's a File object, upload it
      try {
        const formData = new FormData()
        formData.append('images', image)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error(`Error al subir imagen: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!data.success || !data.urls || data.urls.length === 0) {
          throw new Error('No se recibió URL de la imagen subida')
        }
        
        urls.push(data.urls[0])
      } catch (error) {
        console.error('Error uploading image:', error)
        throw new Error('Error al subir las imágenes. Por favor intentá de nuevo.')
      }
    }
    
    return urls
  }
  
  /**
   * Prepare product data payload for API
   */
  const prepareProductPayload = (data: ProductData, imageUrls: string[]) => {
    const payload: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      images: imageUrls,
      categoryId: data.categoryId,
      subCategory: data.subCategory,
      colors: data.colors,
      sizes: data.sizes,
      bestSeller: data.bestSeller,
      active: data.active,
      stock: data.stock,
    }
    
    // Only include originalPrice if there's a discount and it's a valid number
    if (data.hasDiscount && data.originalPrice && data.originalPrice > 0) {
      payload.originalPrice = data.originalPrice
    }
    
    return payload
  }
  
  /**
   * Save product to API with retry logic
   * Retries up to 3 times on network failures
   */
  const saveProductWithRetry = async (
    payload: any,
    productId?: string,
    retries = 3
  ): Promise<any> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await saveProduct(payload, productId)
      } catch (error) {
        // If this was the last attempt, throw the error
        if (attempt === retries) {
          throw error
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        console.log(`Retry attempt ${attempt + 1}/${retries}...`)
      }
    }
    
    throw new Error('Failed after maximum retries')
  }
  
  /**
   * Save product to API
   */
  const saveProduct = async (payload: any, productId?: string) => {
    console.log('Sending payload to API:', JSON.stringify(payload, null, 2))
    
    const url = productId ? `/api/products/${productId}` : '/api/products'
    const method = productId ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error Response:', errorData)
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  /**
   * Handle creating another product from success modal
   */
  const handleCreateAnother = () => {
    // Clear all data
    wizard.resetWizard()
    // Go back to step 1
    wizard.goToStep(1)
    // Close modal
    setShowSuccessModal(false)
  }
  
  /**
   * Handle retry from error modal
   */
  const handleRetry = () => {
    setShowErrorModal(false)
    setErrorMessage('')
    // Retry the save operation
    handleSave()
  }
  
  /**
   * Handle close error modal (return to wizard)
   */
  const handleCloseError = () => {
    setShowErrorModal(false)
    setErrorMessage('')
  }
  
  /**
   * Render current step component
   */
  const renderStep = () => {
    const commonProps = {
      productData: wizard.productData,
      updateField: wizard.updateField,
      errors: validation.errors,
      clearFieldError: validation.clearFieldError,
    }

    switch (wizard.currentStep) {
      case 1:
        return <Step1Photos {...commonProps} />
      case 2:
        return <Step2BasicInfo {...commonProps} />
      case 3:
        return <Step3Pricing {...commonProps} />
      case 4:
        return <Step4Category {...commonProps} categories={categories} />
      case 5:
        return <Step5SizesColors {...commonProps} />
      case 6:
        return <Step6Options {...commonProps} />
      case 7:
        return <Step7Review productData={wizard.productData} goToStep={wizard.goToStep} />
      default:
        return null
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {productId ? 'Editar Producto' : 'Crear Producto'}
        </h1>
        <button
          onClick={handleCancel}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancelar
        </button>
      </div>
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 7 ? 'flex-1' : ''}`}
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step < wizard.currentStep ? 'bg-green-500 text-white' : ''}
                    ${step === wizard.currentStep ? 'bg-black text-white' : ''}
                    ${step > wizard.currentStep ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {step < wizard.currentStep ? '✓' : step}
                </div>
                {step < 7 && (
                  <div
                    className={`
                      h-0.5 flex-1 mx-2
                      ${step < wizard.currentStep ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            Paso {wizard.currentStep} de 7
          </div>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        {renderStep()}
      </div>
      
      {/* Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            {wizard.currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Anterior
              </button>
            )}
          </div>
          
          <div className="flex-1 text-center">
            {/* Space for future features */}
          </div>
          
          <div>
            {wizard.currentStep < 7 ? (
              <button
                onClick={handleNext}
                disabled={validation.hasErrors()}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={wizard.isSaving}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {wizard.isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>💾 Guardar Producto</>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Validation Errors Summary */}
        {validation.hasErrors() && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              Por favor corregí los errores antes de continuar
            </p>
          </div>
        )}
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        productId={savedProductId}
        onCreateAnother={handleCreateAnother}
        onClose={() => setShowSuccessModal(false)}
      />
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        errorMessage={errorMessage}
        onRetry={handleRetry}
        onClose={handleCloseError}
      />
    </div>
  )
}
