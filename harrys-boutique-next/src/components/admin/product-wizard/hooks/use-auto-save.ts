import { useState, useEffect, useCallback, useRef } from 'react'
import { ProductData, DraftState } from '../types'
import { getProductDraftKey, isDraftExpired } from '../utils/storage-keys'

/**
 * Return type for the useAutoSave hook
 */
export interface UseAutoSaveReturn {
  /** Timestamp of the last successful save, or null if never saved */
  lastSaved: Date | null
  /** Manually trigger a save (useful for step navigation) */
  saveNow: () => void
  /** Load a draft from localStorage */
  loadDraft: (productId?: string) => DraftState | null
  /** Clear a draft from localStorage */
  clearDraft: (productId?: string) => void
  /** Whether a save operation is currently in progress */
  isSaving: boolean
  /** Error message if save failed, null otherwise */
  saveError: string | null
}

/**
 * Auto-save hook for the Product Wizard
 * 
 * Automatically saves wizard progress to localStorage with debouncing.
 * Saves occur 2 seconds after the last change, or immediately on step navigation.
 * 
 * @param productData - Current product data to save
 * @param currentStep - Current wizard step (1-7)
 * @param isDirty - Whether there are unsaved changes
 * @param productId - Product ID for edit mode (optional)
 * @returns Auto-save state and control functions
 * 
 * @example
 * ```tsx
 * const { lastSaved, saveNow, loadDraft, clearDraft } = useAutoSave(
 *   productData,
 *   currentStep,
 *   isDirty,
 *   productId
 * )
 * 
 * // Load draft on mount
 * useEffect(() => {
 *   const draft = loadDraft(productId)
 *   if (draft) {
 *     // Restore draft...
 *   }
 * }, [])
 * 
 * // Save before navigation
 * const handleNext = () => {
 *   saveNow()
 *   nextStep()
 * }
 * 
 * // Clear on successful save
 * const handleSave = async () => {
 *   await saveProduct()
 *   clearDraft(productId)
 * }
 * ```
 */
export function useAutoSave(
  productData: ProductData,
  currentStep: number,
  isDirty: boolean,
  productId?: string
): UseAutoSaveReturn {
  // Track last save timestamp
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Track save operation state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  
  // Debounce timer reference
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Previous step reference to detect step changes
  const prevStepRef = useRef<number>(currentStep)

  /**
   * Performs the actual save operation to localStorage
   * Handles quota exceeded errors gracefully
   */
  const performSave = useCallback(() => {
    // Don't save if there are no changes
    if (!isDirty) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const key = getProductDraftKey(productId)
      const draftState: DraftState = {
        data: productData,
        step: currentStep,
        timestamp: new Date().toISOString(),
      }

      // Attempt to save to localStorage
      localStorage.setItem(key, JSON.stringify(draftState))
      
      // Update last saved timestamp
      setLastSaved(new Date())
      setIsSaving(false)
    } catch (error) {
      // Handle localStorage quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        setSaveError('No hay suficiente espacio para guardar. Intentá liberar espacio en el navegador.')
        console.error('LocalStorage quota exceeded:', error)
      } else {
        setSaveError('No se pudo guardar el progreso. Intentá de nuevo.')
        console.error('Error saving draft to localStorage:', error)
      }
      setIsSaving(false)
    }
  }, [productData, currentStep, isDirty, productId])

  /**
   * Manually trigger a save immediately
   * Useful for saving before step navigation
   */
  const saveNow = useCallback(() => {
    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    
    performSave()
  }, [performSave])

  /**
   * Load a draft from localStorage
   * Returns null if no draft exists or if draft is expired
   * 
   * @param productId - Product ID for edit mode (optional)
   * @returns Draft state or null
   */
  const loadDraft = useCallback((productId?: string): DraftState | null => {
    try {
      const key = getProductDraftKey(productId)
      const stored = localStorage.getItem(key)
      
      if (!stored) {
        return null
      }

      const draft: DraftState = JSON.parse(stored)
      
      // Check if draft is expired (older than 7 days)
      if (isDraftExpired(draft.timestamp)) {
        // Clear expired draft
        localStorage.removeItem(key)
        return null
      }

      return draft
    } catch (error) {
      console.error('Error loading draft from localStorage:', error)
      return null
    }
  }, [])

  /**
   * Clear a draft from localStorage
   * 
   * @param productId - Product ID for edit mode (optional)
   */
  const clearDraft = useCallback((productId?: string): void => {
    try {
      const key = getProductDraftKey(productId)
      localStorage.removeItem(key)
      setLastSaved(null)
      setSaveError(null)
    } catch (error) {
      console.error('Error clearing draft from localStorage:', error)
    }
  }, [])

  /**
   * Effect: Debounced auto-save
   * Saves 2 seconds after the last change
   */
  useEffect(() => {
    // Don't auto-save if there are no changes
    if (!isDirty) {
      return
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new debounce timer (2 seconds)
    debounceTimerRef.current = setTimeout(() => {
      performSave()
    }, 2000)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [productData, currentStep, isDirty, performSave])

  /**
   * Effect: Save on step navigation
   * Immediately saves when the user navigates to a different step
   */
  useEffect(() => {
    // Check if step has changed
    if (prevStepRef.current !== currentStep) {
      // Save immediately on step change
      saveNow()
      
      // Update previous step reference
      prevStepRef.current = currentStep
    }
  }, [currentStep, saveNow])

  /**
   * Effect: Cleanup on unmount
   * Clear any pending timers
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    lastSaved,
    saveNow,
    loadDraft,
    clearDraft,
    isSaving,
    saveError,
  }
}
