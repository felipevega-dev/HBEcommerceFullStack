/**
 * Validation hook for Product Wizard
 * 
 * This hook provides validation functionality for each wizard step,
 * including error management and focus handling for invalid fields.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ProductData, ValidationError } from '../types'
import { validateWizardStep } from '../utils/validation-rules'

/**
 * Errors object with field names as keys and error messages as values
 */
type ErrorsObject = Record<string, string>

/**
 * Hook for managing wizard validation
 * 
 * @param currentStep - Current wizard step number (1-7)
 * @param productData - Current product data to validate
 * @returns Validation functions and error state
 */
export function useValidation(currentStep: number, productData: ProductData) {
  const [errors, setErrors] = useState<ErrorsObject>({})
  const errorFieldRefs = useRef<Map<string, HTMLElement>>(new Map())
  
  /**
   * Auto-clear errors when productData changes
   * This provides real-time feedback as the user corrects their input
   */
  useEffect(() => {
    // Only clear errors if there are any
    if (Object.keys(errors).length === 0) return
    
    // Re-validate silently to check if errors should be cleared
    const result = validateWizardStep(currentStep, productData)
    
    if (result.valid) {
      // All errors fixed, clear them
      setErrors({})
    } else {
      // Some errors remain, update the errors object
      const newErrors: ErrorsObject = {}
      result.errors.forEach((error: ValidationError) => {
        newErrors[error.field] = error.message
      })
      
      // Only update if errors actually changed
      const hasChanged = Object.keys(newErrors).length !== Object.keys(errors).length ||
        Object.keys(newErrors).some(key => newErrors[key] !== errors[key])
      
      if (hasChanged) {
        setErrors(newErrors)
      }
    }
  }, [productData, currentStep]) // Removed 'errors' from dependencies

  /**
   * Validates the current step and returns whether it's valid
   * 
   * @returns true if step is valid, false otherwise
   */
  const validateStep = useCallback((): boolean => {
    const result = validateWizardStep(currentStep, productData)
    
    if (!result.valid) {
      // Convert ValidationError[] to ErrorsObject
      const errorsObject: ErrorsObject = {}
      result.errors.forEach((error: ValidationError) => {
        errorsObject[error.field] = error.message
      })
      setErrors(errorsObject)
      return false
    }
    
    // Clear errors if validation passed
    setErrors({})
    return true
  }, [currentStep, productData])

  /**
   * Clears all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  /**
   * Clears error for a specific field
   * 
   * @param field - Field name to clear error for
   */
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  /**
   * Registers a field element for focus management
   * 
   * @param field - Field name
   * @param element - HTML element to focus
   */
  const registerField = useCallback((field: string, element: HTMLElement | null) => {
    if (element) {
      errorFieldRefs.current.set(field, element)
    } else {
      errorFieldRefs.current.delete(field)
    }
  }, [])

  /**
   * Focuses the first field with a validation error
   * 
   * This helps users quickly identify and fix validation issues
   */
  const focusFirstError = useCallback(() => {
    const errorFields = Object.keys(errors)
    if (errorFields.length === 0) return

    const firstErrorField = errorFields[0]
    const element = errorFieldRefs.current.get(firstErrorField)
    
    if (element) {
      // Focus the element
      element.focus()
      
      // Scroll into view if needed
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [errors])

  /**
   * Gets error message for a specific field
   * 
   * @param field - Field name
   * @returns Error message or undefined if no error
   */
  const getFieldError = useCallback((field: string): string | undefined => {
    return errors[field]
  }, [errors])

  /**
   * Checks if a specific field has an error
   * 
   * @param field - Field name
   * @returns true if field has error, false otherwise
   */
  const hasFieldError = useCallback((field: string): boolean => {
    return field in errors
  }, [errors])

  /**
   * Checks if there are any validation errors
   * 
   * @returns true if there are errors, false otherwise
   */
  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0
  }, [errors])

  return {
    /** Object containing field-level error messages */
    errors,
    /** Validates the current step */
    validateStep,
    /** Clears all validation errors */
    clearErrors,
    /** Clears error for a specific field */
    clearFieldError,
    /** Focuses the first field with an error */
    focusFirstError,
    /** Registers a field element for focus management */
    registerField,
    /** Gets error message for a specific field */
    getFieldError,
    /** Checks if a specific field has an error */
    hasFieldError,
    /** Checks if there are any validation errors */
    hasErrors
  }
}
