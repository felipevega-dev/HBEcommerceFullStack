/**
 * Tests for useValidation hook
 */

import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useValidation } from './use-validation'
import type { ProductData } from '../types'

// Mock product data for testing
const createMockProductData = (overrides?: Partial<ProductData>): ProductData => ({
  images: ['image1.jpg'],
  imageOrder: [0],
  name: 'Test Product',
  description: 'This is a test product description with enough characters',
  price: 100,
  hasDiscount: false,
  originalPrice: undefined,
  categoryId: 'dogs',
  subCategory: 'collars',
  sizes: ['M'],
  colors: ['black'],
  stock: 10,
  bestSeller: false,
  active: true,
  ...overrides
})

describe('useValidation', () => {
  describe('Step 1: Photo Upload', () => {
    it('should validate successfully with at least one image', () => {
      const productData = createMockProductData()
      const { result } = renderHook(() => useValidation(1, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('should fail validation with no images', () => {
      const productData = createMockProductData({ images: [] })
      const { result } = renderHook(() => useValidation(1, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.images).toBe('Se requiere al menos una imagen')
    })

    it('should fail validation with more than 4 images', () => {
      const productData = createMockProductData({
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg']
      })
      const { result } = renderHook(() => useValidation(1, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.images).toBe('Máximo 4 imágenes permitidas')
    })
  })

  describe('Step 2: Basic Information', () => {
    it('should validate successfully with valid name and description', () => {
      const productData = createMockProductData()
      const { result } = renderHook(() => useValidation(2, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('should fail validation with name less than 3 characters', () => {
      const productData = createMockProductData({ name: 'AB' })
      const { result } = renderHook(() => useValidation(2, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.name).toBe('El nombre debe tener al menos 3 caracteres')
    })

    it('should fail validation with description less than 10 characters', () => {
      const productData = createMockProductData({ description: 'Short' })
      const { result } = renderHook(() => useValidation(2, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.description).toBe(
        'La descripción debe tener al menos 10 caracteres (sin contar espacios al inicio o final)'
      )
    })

    it('should fail validation with name over 100 characters', () => {
      const productData = createMockProductData({
        name: 'A'.repeat(101)
      })
      const { result } = renderHook(() => useValidation(2, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.name).toBe('El nombre no puede superar los 100 caracteres')
    })

    it('should fail validation with description over 500 characters', () => {
      const productData = createMockProductData({
        description: 'A'.repeat(501)
      })
      const { result } = renderHook(() => useValidation(2, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.description).toBe('La descripción no puede superar los 500 caracteres')
    })
  })

  describe('Step 3: Pricing', () => {
    it('should validate successfully with valid price', () => {
      const productData = createMockProductData({ price: 100 })
      const { result } = renderHook(() => useValidation(3, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('should fail validation with price of 0', () => {
      const productData = createMockProductData({ price: 0 })
      const { result } = renderHook(() => useValidation(3, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.price).toBe('El precio debe ser mayor a 0')
    })

    it('should validate successfully with discount when original price is higher', () => {
      const productData = createMockProductData({
        price: 80,
        hasDiscount: true,
        originalPrice: 100
      })
      const { result } = renderHook(() => useValidation(3, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('should fail validation when discount is enabled but original price is missing', () => {
      const productData = createMockProductData({
        price: 80,
        hasDiscount: true,
        originalPrice: undefined
      })
      const { result } = renderHook(() => useValidation(3, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.originalPrice).toBe('El precio original es requerido cuando hay descuento')
    })

    it('should fail validation when original price is not greater than selling price', () => {
      const productData = createMockProductData({
        price: 100,
        hasDiscount: true,
        originalPrice: 90
      })
      const { result } = renderHook(() => useValidation(3, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.originalPrice).toBe('El precio original debe ser mayor al precio de venta')
    })
  })

  describe('Step 4: Category Selection', () => {
    it('should validate successfully with category and subcategory', () => {
      const productData = createMockProductData()
      const { result } = renderHook(() => useValidation(4, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('should fail validation without category', () => {
      const productData = createMockProductData({ categoryId: '' })
      const { result } = renderHook(() => useValidation(4, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.categoryId).toBe('Debes seleccionar una categoría')
    })

    it('should fail validation without subcategory', () => {
      const productData = createMockProductData({ subCategory: '' })
      const { result } = renderHook(() => useValidation(4, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.subCategory).toBe('Debes seleccionar una subcategoría')
    })
  })

  describe('Step 5: Sizes and Colors', () => {
    it('should validate successfully with at least one size and color', () => {
      const productData = createMockProductData()
      const { result } = renderHook(() => useValidation(5, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('should fail validation without sizes', () => {
      const productData = createMockProductData({ sizes: [] })
      const { result } = renderHook(() => useValidation(5, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.sizes).toBe('Debes seleccionar al menos una talla')
    })

    it('should fail validation without colors', () => {
      const productData = createMockProductData({ colors: [] })
      const { result } = renderHook(() => useValidation(5, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.colors).toBe('Debes seleccionar al menos un color')
    })
  })

  describe('Step 6: Final Options', () => {
    it('should validate successfully with valid stock', () => {
      const productData = createMockProductData({ stock: 10 })
      const { result } = renderHook(() => useValidation(6, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('should validate successfully with stock of 0', () => {
      const productData = createMockProductData({ stock: 0 })
      const { result } = renderHook(() => useValidation(6, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('should fail validation with negative stock', () => {
      const productData = createMockProductData({ stock: -5 })
      const { result } = renderHook(() => useValidation(6, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.stock).toBe('El stock no puede ser negativo')
    })
  })

  describe('Step 7: Review', () => {
    it('should always validate successfully (no validation needed)', () => {
      const productData = createMockProductData()
      const { result } = renderHook(() => useValidation(7, productData))

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateStep()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })
  })

  describe('Error management functions', () => {
    it('should clear all errors', () => {
      const productData = createMockProductData({ name: 'AB' })
      const { result } = renderHook(() => useValidation(2, productData))

      act(() => {
        result.current.validateStep()
      })

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)

      act(() => {
        result.current.clearErrors()
      })

      expect(result.current.errors).toEqual({})
    })

    it('should clear specific field error', () => {
      const productData = createMockProductData({ name: 'AB', description: 'Short' })
      const { result } = renderHook(() => useValidation(2, productData))

      act(() => {
        result.current.validateStep()
      })

      expect(result.current.errors.name).toBeDefined()
      expect(result.current.errors.description).toBeDefined()

      act(() => {
        result.current.clearFieldError('name')
      })

      expect(result.current.errors.name).toBeUndefined()
      expect(result.current.errors.description).toBeDefined()
    })

    it('should get field error', () => {
      const productData = createMockProductData({ name: 'AB' })
      const { result } = renderHook(() => useValidation(2, productData))

      act(() => {
        result.current.validateStep()
      })

      expect(result.current.getFieldError('name')).toBe('El nombre debe tener al menos 3 caracteres')
      expect(result.current.getFieldError('description')).toBeUndefined()
    })

    it('should check if field has error', () => {
      const productData = createMockProductData({ name: 'AB' })
      const { result } = renderHook(() => useValidation(2, productData))

      act(() => {
        result.current.validateStep()
      })

      expect(result.current.hasFieldError('name')).toBe(true)
      expect(result.current.hasFieldError('description')).toBe(false)
    })

    it('should check if there are any errors', () => {
      const productData = createMockProductData()
      const { result } = renderHook(() => useValidation(2, productData))

      expect(result.current.hasErrors()).toBe(false)

      act(() => {
        result.current.validateStep()
      })

      expect(result.current.hasErrors()).toBe(false)

      const invalidProductData = createMockProductData({ name: 'AB' })
      const { result: result2 } = renderHook(() => useValidation(2, invalidProductData))

      act(() => {
        result2.current.validateStep()
      })

      expect(result2.current.hasErrors()).toBe(true)
    })
  })

  describe('Focus management', () => {
    it('should register and focus first error field', () => {
      const productData = createMockProductData({ name: 'AB' })
      const { result } = renderHook(() => useValidation(2, productData))

      // Create mock element
      const mockElement = {
        focus: vi.fn(),
        scrollIntoView: vi.fn()
      } as unknown as HTMLElement

      act(() => {
        result.current.registerField('name', mockElement)
      })

      act(() => {
        result.current.validateStep()
      })

      act(() => {
        result.current.focusFirstError()
      })

      expect(mockElement.focus).toHaveBeenCalled()
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      })
    })

    it('should handle unregistered field gracefully', () => {
      const productData = createMockProductData({ name: 'AB' })
      const { result } = renderHook(() => useValidation(2, productData))

      act(() => {
        result.current.validateStep()
      })

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.focusFirstError()
        })
      }).not.toThrow()
    })

    it('should unregister field when element is null', () => {
      const productData = createMockProductData()
      const { result } = renderHook(() => useValidation(2, productData))

      const mockElement = {
        focus: vi.fn(),
        scrollIntoView: vi.fn()
      } as unknown as HTMLElement

      act(() => {
        result.current.registerField('name', mockElement)
      })

      act(() => {
        result.current.registerField('name', null)
      })

      // Should not throw error when trying to focus
      expect(() => {
        act(() => {
          result.current.focusFirstError()
        })
      }).not.toThrow()
    })
  })
})
