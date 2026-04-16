import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAutoSave } from './use-auto-save'
import { ProductData, DraftState } from '../types'
import { getProductDraftKey } from '../utils/storage-keys'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock product data
const mockProductData: ProductData = {
  images: [],
  imageOrder: [],
  name: 'Test Product',
  description: 'Test description',
  price: 100,
  hasDiscount: false,
  categoryId: 'dogs',
  subCategory: 'collars',
  sizes: ['M', 'L'],
  colors: ['black', 'red'],
  stock: 10,
  bestSeller: false,
  active: true,
}

describe('useAutoSave', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    // Clear all timers
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Debounced Auto-Save', () => {
    it('should save after 2 seconds of inactivity', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, true)
      )

      // Initially, nothing should be saved
      expect(result.current.lastSaved).toBeNull()

      // Fast-forward time by 2 seconds
      await act(async () => {
        vi.advanceTimersByTime(2000)
        await vi.runAllTimersAsync()
      })

      // Verify data was saved to localStorage
      const key = getProductDraftKey()
      const stored = localStorageMock.getItem(key)
      expect(stored).not.toBeNull()

      const draft: DraftState = JSON.parse(stored!)
      expect(draft.data.name).toBe('Test Product')
      expect(draft.step).toBe(1)
      expect(result.current.lastSaved).not.toBeNull()

      vi.useRealTimers()
    })

    it('should debounce multiple rapid changes', async () => {
      vi.useFakeTimers()

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, 1, true),
        { initialProps: { data: mockProductData } }
      )

      // Make multiple rapid changes
      const updatedData1 = { ...mockProductData, name: 'Update 1' }
      rerender({ data: updatedData1 })

      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      const updatedData2 = { ...mockProductData, name: 'Update 2' }
      rerender({ data: updatedData2 })

      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      const updatedData3 = { ...mockProductData, name: 'Update 3' }
      rerender({ data: updatedData3 })

      // Fast-forward to complete debounce
      await act(async () => {
        vi.advanceTimersByTime(2000)
        await vi.runAllTimersAsync()
      })

      // Should only save the last change
      const key = getProductDraftKey()
      const stored = localStorageMock.getItem(key)
      const draft: DraftState = JSON.parse(stored!)
      expect(draft.data.name).toBe('Update 3')
      expect(result.current.lastSaved).not.toBeNull()

      vi.useRealTimers()
    })

    it('should not save when isDirty is false', async () => {
      vi.useFakeTimers()

      renderHook(() => useAutoSave(mockProductData, 1, false))

      await act(async () => {
        vi.advanceTimersByTime(2000)
        await vi.runAllTimersAsync()
      })

      // Nothing should be saved
      const key = getProductDraftKey()
      const stored = localStorageMock.getItem(key)
      expect(stored).toBeNull()

      vi.useRealTimers()
    })
  })

  describe('Save on Step Navigation', () => {
    it('should save immediately when step changes', async () => {
      const { result, rerender } = renderHook(
        ({ step }) => useAutoSave(mockProductData, step, true),
        { initialProps: { step: 1 } }
      )

      // Change step
      await act(async () => {
        rerender({ step: 2 })
      })

      // Should save immediately without waiting for debounce
      expect(result.current.lastSaved).not.toBeNull()

      const key = getProductDraftKey()
      const stored = localStorageMock.getItem(key)
      const draft: DraftState = JSON.parse(stored!)
      expect(draft.step).toBe(2)
    })

    it('should save on multiple step changes', async () => {
      const { result, rerender } = renderHook(
        ({ step }) => useAutoSave(mockProductData, step, true),
        { initialProps: { step: 1 } }
      )

      // Navigate through steps
      await act(async () => {
        rerender({ step: 2 })
      })
      expect(result.current.lastSaved).not.toBeNull()

      const firstSave = result.current.lastSaved

      await act(async () => {
        rerender({ step: 3 })
      })
      expect(result.current.lastSaved).not.toBe(firstSave)

      const key = getProductDraftKey()
      const stored = localStorageMock.getItem(key)
      const draft: DraftState = JSON.parse(stored!)
      expect(draft.step).toBe(3)
    })
  })

  describe('Manual Save', () => {
    it('should save immediately when saveNow is called', async () => {
      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, true)
      )

      expect(result.current.lastSaved).toBeNull()

      // Manually trigger save
      await act(async () => {
        result.current.saveNow()
      })

      expect(result.current.lastSaved).not.toBeNull()

      const key = getProductDraftKey()
      const stored = localStorageMock.getItem(key)
      expect(stored).not.toBeNull()
    })

    it('should cancel pending debounced save when saveNow is called', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, true)
      )

      // Start debounce timer
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      // Manually save before debounce completes
      await act(async () => {
        result.current.saveNow()
      })

      expect(result.current.lastSaved).not.toBeNull()

      const firstSave = result.current.lastSaved

      // Advance remaining time - should not trigger another save
      await act(async () => {
        vi.advanceTimersByTime(2000)
        await vi.runAllTimersAsync()
      })

      expect(result.current.lastSaved).toBe(firstSave)

      vi.useRealTimers()
    })
  })

  describe('Load Draft', () => {
    it('should load existing draft from localStorage', () => {
      // Save a draft first
      const key = getProductDraftKey()
      const draft: DraftState = {
        data: mockProductData,
        step: 3,
        timestamp: new Date().toISOString(),
      }
      localStorageMock.setItem(key, JSON.stringify(draft))

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, false)
      )

      const loaded = result.current.loadDraft()
      expect(loaded).not.toBeNull()
      expect(loaded!.data.name).toBe('Test Product')
      expect(loaded!.step).toBe(3)
    })

    it('should return null when no draft exists', () => {
      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, false)
      )

      const loaded = result.current.loadDraft()
      expect(loaded).toBeNull()
    })

    it('should return null and clear expired draft', () => {
      // Save a draft with old timestamp (8 days ago)
      const key = getProductDraftKey()
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 8)
      const draft: DraftState = {
        data: mockProductData,
        step: 3,
        timestamp: oldDate.toISOString(),
      }
      localStorageMock.setItem(key, JSON.stringify(draft))

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, false)
      )

      const loaded = result.current.loadDraft()
      expect(loaded).toBeNull()

      // Verify draft was cleared
      const stored = localStorageMock.getItem(key)
      expect(stored).toBeNull()
    })

    it('should load draft for specific product ID', () => {
      const productId = 'abc123'
      const key = getProductDraftKey(productId)
      const draft: DraftState = {
        data: mockProductData,
        step: 5,
        timestamp: new Date().toISOString(),
      }
      localStorageMock.setItem(key, JSON.stringify(draft))

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, false, productId)
      )

      const loaded = result.current.loadDraft(productId)
      expect(loaded).not.toBeNull()
      expect(loaded!.step).toBe(5)
    })
  })

  describe('Clear Draft', () => {
    it('should clear draft from localStorage', () => {
      // Save a draft first
      const key = getProductDraftKey()
      const draft: DraftState = {
        data: mockProductData,
        step: 3,
        timestamp: new Date().toISOString(),
      }
      localStorageMock.setItem(key, JSON.stringify(draft))

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, false)
      )

      // Clear the draft
      act(() => {
        result.current.clearDraft()
      })

      // Verify draft was removed
      const stored = localStorageMock.getItem(key)
      expect(stored).toBeNull()
      expect(result.current.lastSaved).toBeNull()
    })

    it('should clear draft for specific product ID', () => {
      const productId = 'abc123'
      const key = getProductDraftKey(productId)
      const draft: DraftState = {
        data: mockProductData,
        step: 5,
        timestamp: new Date().toISOString(),
      }
      localStorageMock.setItem(key, JSON.stringify(draft))

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, false, productId)
      )

      act(() => {
        result.current.clearDraft(productId)
      })

      const stored = localStorageMock.getItem(key)
      expect(stored).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage quota exceeded error', async () => {
      // Mock setItem to throw QuotaExceededError
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, true)
      )

      act(() => {
        result.current.saveNow()
      })

      await waitFor(() => {
        expect(result.current.saveError).not.toBeNull()
        expect(result.current.saveError).toContain('espacio')
      })

      // Restore original setItem
      localStorageMock.setItem = originalSetItem
    })

    it('should handle generic save errors', async () => {
      // Mock setItem to throw generic error
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('Generic error')
      })

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, true)
      )

      act(() => {
        result.current.saveNow()
      })

      await waitFor(() => {
        expect(result.current.saveError).not.toBeNull()
        expect(result.current.saveError).toContain('No se pudo guardar')
      })

      // Restore original setItem
      localStorageMock.setItem = originalSetItem
    })

    it('should handle malformed JSON when loading draft', () => {
      const key = getProductDraftKey()
      localStorageMock.setItem(key, 'invalid json {')

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, false)
      )

      const loaded = result.current.loadDraft()
      expect(loaded).toBeNull()
    })
  })

  describe('Saving State', () => {
    it('should set isSaving to true during save operation', async () => {
      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, true)
      )

      act(() => {
        result.current.saveNow()
      })

      // isSaving should be true briefly, then false
      await waitFor(() => {
        expect(result.current.isSaving).toBe(false)
      })
    })

    it('should clear saveError on successful save', async () => {
      // First, cause an error
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('Error')
      })

      const { result } = renderHook(() =>
        useAutoSave(mockProductData, 1, true)
      )

      await act(async () => {
        result.current.saveNow()
      })

      expect(result.current.saveError).not.toBeNull()

      // Restore setItem and save again
      localStorageMock.setItem = originalSetItem

      await act(async () => {
        result.current.saveNow()
      })

      expect(result.current.saveError).toBeNull()
    })
  })
})
