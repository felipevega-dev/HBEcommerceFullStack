import { renderHook, act } from '@testing-library/react'
import { useWizardState } from './use-wizard-state'
import { ProductData } from '../types'

describe('useWizardState', () => {
  describe('initialization', () => {
    it('should initialize with default values when no initial product provided', () => {
      const { result } = renderHook(() => useWizardState())

      expect(result.current.currentStep).toBe(1)
      expect(result.current.isDirty).toBe(false)
      expect(result.current.productData).toEqual({
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
      })
    })

    it('should initialize with provided product data in edit mode', () => {
      const existingProduct: ProductData = {
        images: ['https://example.com/image1.jpg'],
        imageOrder: [0],
        name: 'Collar para Perro',
        description: 'Un collar ajustable de nylon resistente',
        price: 2500,
        hasDiscount: true,
        originalPrice: 3500,
        categoryId: 'dogs',
        subCategory: 'collars',
        sizes: ['S', 'M', 'L'],
        colors: ['black', 'red'],
        stock: 15,
        bestSeller: true,
        active: true,
        id: 'product-123',
      }

      const { result } = renderHook(() => useWizardState(existingProduct))

      expect(result.current.productData).toEqual(existingProduct)
      expect(result.current.currentStep).toBe(1)
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('updateField', () => {
    it('should update a single field in product data', () => {
      const { result } = renderHook(() => useWizardState())

      act(() => {
        result.current.updateField('name', 'Collar para Perro')
      })

      expect(result.current.productData.name).toBe('Collar para Perro')
      expect(result.current.isDirty).toBe(true)
    })

    it('should update multiple fields independently', () => {
      const { result } = renderHook(() => useWizardState())

      act(() => {
        result.current.updateField('name', 'Collar para Perro')
        result.current.updateField('price', 2500)
        result.current.updateField('stock', 10)
      })

      expect(result.current.productData.name).toBe('Collar para Perro')
      expect(result.current.productData.price).toBe(2500)
      expect(result.current.productData.stock).toBe(10)
    })

    it('should update array fields correctly', () => {
      const { result } = renderHook(() => useWizardState())

      act(() => {
        result.current.updateField('sizes', ['S', 'M', 'L'])
        result.current.updateField('colors', ['black', 'white'])
      })

      expect(result.current.productData.sizes).toEqual(['S', 'M', 'L'])
      expect(result.current.productData.colors).toEqual(['black', 'white'])
    })

    it('should update boolean fields correctly', () => {
      const { result } = renderHook(() => useWizardState())

      act(() => {
        result.current.updateField('hasDiscount', true)
        result.current.updateField('bestSeller', true)
        result.current.updateField('active', false)
      })

      expect(result.current.productData.hasDiscount).toBe(true)
      expect(result.current.productData.bestSeller).toBe(true)
      expect(result.current.productData.active).toBe(false)
    })

    it('should mark wizard as dirty after any field update', () => {
      const { result } = renderHook(() => useWizardState())

      expect(result.current.isDirty).toBe(false)

      act(() => {
        result.current.updateField('name', 'Test')
      })

      expect(result.current.isDirty).toBe(true)
    })
  })

  describe('navigation', () => {
    describe('nextStep', () => {
      it('should advance to the next step', () => {
        const { result } = renderHook(() => useWizardState())

        act(() => {
          result.current.nextStep()
        })

        expect(result.current.currentStep).toBe(2)

        act(() => {
          result.current.nextStep()
        })

        expect(result.current.currentStep).toBe(3)
      })

      it('should not advance beyond step 7', () => {
        const { result } = renderHook(() => useWizardState())

        act(() => {
          result.current.goToStep(7)
        })

        expect(result.current.currentStep).toBe(7)

        act(() => {
          result.current.nextStep()
        })

        expect(result.current.currentStep).toBe(7)
      })
    })

    describe('prevStep', () => {
      it('should go back to the previous step', () => {
        const { result } = renderHook(() => useWizardState())

        act(() => {
          result.current.goToStep(5)
        })

        expect(result.current.currentStep).toBe(5)

        act(() => {
          result.current.prevStep()
        })

        expect(result.current.currentStep).toBe(4)

        act(() => {
          result.current.prevStep()
        })

        expect(result.current.currentStep).toBe(3)
      })

      it('should not go below step 1', () => {
        const { result } = renderHook(() => useWizardState())

        expect(result.current.currentStep).toBe(1)

        act(() => {
          result.current.prevStep()
        })

        expect(result.current.currentStep).toBe(1)
      })
    })

    describe('goToStep', () => {
      it('should jump to a specific step', () => {
        const { result } = renderHook(() => useWizardState())

        act(() => {
          result.current.goToStep(5)
        })

        expect(result.current.currentStep).toBe(5)

        act(() => {
          result.current.goToStep(2)
        })

        expect(result.current.currentStep).toBe(2)
      })

      it('should clamp step to minimum of 1', () => {
        const { result } = renderHook(() => useWizardState())

        act(() => {
          result.current.goToStep(0)
        })

        expect(result.current.currentStep).toBe(1)

        act(() => {
          result.current.goToStep(-5)
        })

        expect(result.current.currentStep).toBe(1)
      })

      it('should clamp step to maximum of 7', () => {
        const { result } = renderHook(() => useWizardState())

        act(() => {
          result.current.goToStep(8)
        })

        expect(result.current.currentStep).toBe(7)

        act(() => {
          result.current.goToStep(100)
        })

        expect(result.current.currentStep).toBe(7)
      })
    })
  })

  describe('resetWizard', () => {
    it('should reset all product data to defaults', () => {
      const { result } = renderHook(() => useWizardState())

      // Make some changes
      act(() => {
        result.current.updateField('name', 'Collar para Perro')
        result.current.updateField('price', 2500)
        result.current.updateField('sizes', ['S', 'M'])
        result.current.goToStep(5)
      })

      expect(result.current.productData.name).toBe('Collar para Perro')
      expect(result.current.currentStep).toBe(5)
      expect(result.current.isDirty).toBe(true)

      // Reset
      act(() => {
        result.current.resetWizard()
      })

      expect(result.current.productData).toEqual({
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
      })
      expect(result.current.currentStep).toBe(1)
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('markClean', () => {
    it('should mark wizard as clean without changing data', () => {
      const { result } = renderHook(() => useWizardState())

      act(() => {
        result.current.updateField('name', 'Collar para Perro')
      })

      expect(result.current.isDirty).toBe(true)
      expect(result.current.productData.name).toBe('Collar para Perro')

      act(() => {
        result.current.markClean()
      })

      expect(result.current.isDirty).toBe(false)
      expect(result.current.productData.name).toBe('Collar para Perro')
    })
  })

  describe('complex workflows', () => {
    it('should handle a complete wizard flow', () => {
      const { result } = renderHook(() => useWizardState())

      // Step 1: Photos
      act(() => {
        result.current.updateField('images', ['image1.jpg', 'image2.jpg'])
        result.current.updateField('imageOrder', [0, 1])
        result.current.nextStep()
      })

      expect(result.current.currentStep).toBe(2)

      // Step 2: Basic Info
      act(() => {
        result.current.updateField('name', 'Collar para Perro Ajustable')
        result.current.updateField('description', 'Collar ajustable de nylon resistente para perros')
        result.current.nextStep()
      })

      expect(result.current.currentStep).toBe(3)

      // Step 3: Pricing
      act(() => {
        result.current.updateField('price', 2500)
        result.current.updateField('hasDiscount', true)
        result.current.updateField('originalPrice', 3500)
        result.current.nextStep()
      })

      expect(result.current.currentStep).toBe(4)

      // Step 4: Category
      act(() => {
        result.current.updateField('categoryId', 'dogs')
        result.current.updateField('subCategory', 'collars')
        result.current.nextStep()
      })

      expect(result.current.currentStep).toBe(5)

      // Step 5: Sizes and Colors
      act(() => {
        result.current.updateField('sizes', ['S', 'M', 'L'])
        result.current.updateField('colors', ['black', 'red'])
        result.current.nextStep()
      })

      expect(result.current.currentStep).toBe(6)

      // Step 6: Final Options
      act(() => {
        result.current.updateField('stock', 15)
        result.current.updateField('bestSeller', true)
        result.current.updateField('active', true)
        result.current.nextStep()
      })

      expect(result.current.currentStep).toBe(7)

      // Verify all data is correct
      expect(result.current.productData).toEqual({
        images: ['image1.jpg', 'image2.jpg'],
        imageOrder: [0, 1],
        name: 'Collar para Perro Ajustable',
        description: 'Collar ajustable de nylon resistente para perros',
        price: 2500,
        hasDiscount: true,
        originalPrice: 3500,
        categoryId: 'dogs',
        subCategory: 'collars',
        sizes: ['S', 'M', 'L'],
        colors: ['black', 'red'],
        stock: 15,
        bestSeller: true,
        active: true,
      })
      expect(result.current.isDirty).toBe(true)
    })

    it('should allow editing from review step', () => {
      const { result } = renderHook(() => useWizardState())

      // Complete wizard
      act(() => {
        result.current.updateField('name', 'Original Name')
        result.current.goToStep(7)
      })

      expect(result.current.currentStep).toBe(7)

      // Go back to edit step 2
      act(() => {
        result.current.goToStep(2)
      })

      expect(result.current.currentStep).toBe(2)

      // Update name
      act(() => {
        result.current.updateField('name', 'Updated Name')
      })

      expect(result.current.productData.name).toBe('Updated Name')

      // Return to review
      act(() => {
        result.current.goToStep(7)
      })

      expect(result.current.currentStep).toBe(7)
      expect(result.current.productData.name).toBe('Updated Name')
    })
  })
})
