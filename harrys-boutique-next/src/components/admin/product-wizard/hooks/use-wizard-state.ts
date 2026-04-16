import { useState, useCallback } from 'react'
import { ProductData } from '../types'

/**
 * Default empty product data for new products
 */
const defaultProductData: ProductData = {
  images: [],
  imageOrder: [],
  name: '',
  description: '',
  price: 0,
  hasDiscount: false,
  originalPrice: undefined,
  categoryId: '',
  subCategory: '',
  sizes: [],
  colors: [],
  stock: 0,
  bestSeller: false,
  active: true,
}

/**
 * Return type for the useWizardState hook
 */
export interface UseWizardStateReturn {
  /** Current step number (1-7) */
  currentStep: number
  /** Complete product data */
  productData: ProductData
  /** Whether the wizard has unsaved changes */
  isDirty: boolean
  /** Whether the wizard is currently saving */
  isSaving: boolean
  /** Update a single field in product data */
  updateField: <K extends keyof ProductData>(field: K, value: ProductData[K]) => void
  /** Navigate to the next step */
  nextStep: () => void
  /** Navigate to the previous step */
  prevStep: () => void
  /** Jump to a specific step */
  goToStep: (step: number) => void
  /** Reset wizard to initial state */
  resetWizard: () => void
  /** Mark wizard as clean (no unsaved changes) */
  markClean: () => void
  /** Set saving state */
  setSaving: (saving: boolean) => void
}

/**
 * Core wizard state management hook
 * 
 * Manages the wizard's current step, product data, and navigation.
 * This is the central state management for the entire 7-step wizard.
 * 
 * @param initialProduct - Optional initial product data (for edit mode)
 * @returns Wizard state and control functions
 * 
 * @example
 * ```tsx
 * const wizard = useWizardState(existingProduct)
 * 
 * // Update a field
 * wizard.updateField('name', 'Collar para Perro')
 * 
 * // Navigate
 * wizard.nextStep()
 * wizard.prevStep()
 * wizard.goToStep(5)
 * 
 * // Reset
 * wizard.resetWizard()
 * ```
 */
export function useWizardState(initialProduct?: ProductData): UseWizardStateReturn {
  // Initialize product data with provided data or defaults
  const [productData, setProductData] = useState<ProductData>(
    initialProduct || defaultProductData
  )
  
  // Track current step (1-7)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Track whether there are unsaved changes
  const [isDirty, setIsDirty] = useState(false)
  
  // Track whether the wizard is currently saving
  const [isSaving, setIsSaving] = useState(false)

  /**
   * Update a single field in the product data
   * Marks the wizard as dirty when any field is updated
   */
  const updateField = useCallback(<K extends keyof ProductData>(
    field: K,
    value: ProductData[K]
  ) => {
    setProductData(prev => ({
      ...prev,
      [field]: value,
    }))
    setIsDirty(true)
  }, [])

  /**
   * Navigate to the next step
   * Maximum step is 7 (Review)
   */
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 7))
  }, [])

  /**
   * Navigate to the previous step
   * Minimum step is 1 (Photos)
   */
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  /**
   * Jump directly to a specific step
   * Clamps the step number between 1 and 7
   * 
   * @param step - Target step number (1-7)
   */
  const goToStep = useCallback((step: number) => {
    const clampedStep = Math.max(1, Math.min(step, 7))
    setCurrentStep(clampedStep)
  }, [])

  /**
   * Reset the wizard to initial state
   * Clears all product data and returns to step 1
   */
  const resetWizard = useCallback(() => {
    setProductData(defaultProductData)
    setCurrentStep(1)
    setIsDirty(false)
  }, [])

  /**
   * Mark the wizard as clean (no unsaved changes)
   * Used after successful save or when draft is restored
   */
  const markClean = useCallback(() => {
    setIsDirty(false)
  }, [])
  
  /**
   * Set the saving state
   * Used to show loading indicators during save operation
   */
  const setSaving = useCallback((saving: boolean) => {
    setIsSaving(saving)
  }, [])

  return {
    currentStep,
    productData,
    isDirty,
    isSaving,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    markClean,
    setSaving,
  }
}
