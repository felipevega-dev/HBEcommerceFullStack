/**
 * Unit tests for validation rules
 */

import { describe, it, expect } from 'vitest'
import {
  validateStep1Photos,
  validateStep2BasicInfo,
  validateStep3Pricing,
  validateStep4Category,
  validateStep5SizesColors,
  validateStep6Options,
  validateImageFile,
  validateWizardStep
} from '../validation-rules'
import type { ProductData } from '../../types'

describe('validateStep1Photos', () => {
  it('should pass with 1 image', () => {
    const result = validateStep1Photos(['image1.jpg'])
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should pass with 4 images', () => {
    const result = validateStep1Photos(['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'])
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail with no images', () => {
    const result = validateStep1Photos([])
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].field).toBe('images')
    expect(result.errors[0].message).toContain('al menos una imagen')
  })

  it('should fail with more than 4 images', () => {
    const result = validateStep1Photos(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'])
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].field).toBe('images')
    expect(result.errors[0].message).toContain('Máximo 4')
  })
})

describe('validateStep2BasicInfo', () => {
  it('should pass with valid name and description', () => {
    const result = validateStep2BasicInfo(
      'Collar para Perro',
      'Collar ajustable de nylon resistente'
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail with name too short', () => {
    const result = validateStep2BasicInfo('AB', 'Valid description here')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'name')).toBe(true)
  })

  it('should fail with name too long', () => {
    const longName = 'A'.repeat(101)
    const result = validateStep2BasicInfo(longName, 'Valid description')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'name')).toBe(true)
  })

  it('should fail with description too short', () => {
    const result = validateStep2BasicInfo('Valid Name', 'Short')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'description')).toBe(true)
  })

  it('should fail with description too long', () => {
    const longDesc = 'A'.repeat(501)
    const result = validateStep2BasicInfo('Valid Name', longDesc)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'description')).toBe(true)
  })

  it('should trim whitespace when validating', () => {
    const result = validateStep2BasicInfo('  AB  ', '  Short  ')
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(2)
  })
})

describe('validateStep3Pricing', () => {
  it('should pass with valid price and no discount', () => {
    const result = validateStep3Pricing(2500, false)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should pass with valid price and discount', () => {
    const result = validateStep3Pricing(2500, true, 3500)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail with price of 0', () => {
    const result = validateStep3Pricing(0, false)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'price')).toBe(true)
  })

  it('should fail with negative price', () => {
    const result = validateStep3Pricing(-100, false)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'price')).toBe(true)
  })

  it('should fail when discount enabled but no original price', () => {
    const result = validateStep3Pricing(2500, true)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'originalPrice')).toBe(true)
  })

  it('should fail when original price is less than sale price', () => {
    const result = validateStep3Pricing(3500, true, 2500)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'originalPrice')).toBe(true)
  })

  it('should fail when original price equals sale price', () => {
    const result = validateStep3Pricing(2500, true, 2500)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'originalPrice')).toBe(true)
  })
})

describe('validateStep4Category', () => {
  it('should pass with valid category and subcategory', () => {
    const result = validateStep4Category('dogs', 'collars')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail with empty category', () => {
    const result = validateStep4Category('', 'collars')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'categoryId')).toBe(true)
  })

  it('should fail with empty subcategory', () => {
    const result = validateStep4Category('dogs', '')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'subCategory')).toBe(true)
  })

  it('should fail with both empty', () => {
    const result = validateStep4Category('', '')
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(2)
  })
})

describe('validateStep5SizesColors', () => {
  it('should pass with valid sizes and colors', () => {
    const result = validateStep5SizesColors(['S', 'M', 'L'], ['black', 'white'])
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail with no sizes', () => {
    const result = validateStep5SizesColors([], ['black'])
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'sizes')).toBe(true)
  })

  it('should fail with no colors', () => {
    const result = validateStep5SizesColors(['M'], [])
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'colors')).toBe(true)
  })

  it('should fail with both empty', () => {
    const result = validateStep5SizesColors([], [])
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(2)
  })
})

describe('validateStep6Options', () => {
  it('should pass with stock of 0', () => {
    const result = validateStep6Options(0)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should pass with positive stock', () => {
    const result = validateStep6Options(15)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail with negative stock', () => {
    const result = validateStep6Options(-5)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'stock')).toBe(true)
  })

  it('should fail with non-integer stock', () => {
    const result = validateStep6Options(15.5)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.field === 'stock')).toBe(true)
  })
})

describe('validateImageFile', () => {
  it('should pass with valid JPEG file', () => {
    const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should pass with valid PNG file', () => {
    const file = new File(['content'], 'image.png', { type: 'image/png' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should pass with valid WEBP file', () => {
    const file = new File(['content'], 'image.webp', { type: 'image/webp' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail with invalid file type', () => {
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('JPG, PNG, WEBP'))).toBe(true)
  })

  it('should fail with file larger than 5MB', () => {
    const largeContent = new Array(6 * 1024 * 1024).fill('a').join('')
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('5MB'))).toBe(true)
  })
})

describe('validateWizardStep', () => {
  const mockProductData: ProductData = {
    images: ['img1.jpg'],
    imageOrder: [0],
    name: 'Test Product',
    description: 'This is a test product description',
    price: 2500,
    hasDiscount: false,
    categoryId: 'dogs',
    subCategory: 'collars',
    sizes: ['M'],
    colors: ['black'],
    stock: 10,
    bestSeller: false,
    active: true
  }

  it('should validate step 1 correctly', () => {
    const result = validateWizardStep(1, mockProductData)
    expect(result.valid).toBe(true)
  })

  it('should validate step 2 correctly', () => {
    const result = validateWizardStep(2, mockProductData)
    expect(result.valid).toBe(true)
  })

  it('should validate step 3 correctly', () => {
    const result = validateWizardStep(3, mockProductData)
    expect(result.valid).toBe(true)
  })

  it('should validate step 4 correctly', () => {
    const result = validateWizardStep(4, mockProductData)
    expect(result.valid).toBe(true)
  })

  it('should validate step 5 correctly', () => {
    const result = validateWizardStep(5, mockProductData)
    expect(result.valid).toBe(true)
  })

  it('should validate step 6 correctly', () => {
    const result = validateWizardStep(6, mockProductData)
    expect(result.valid).toBe(true)
  })

  it('should always pass step 7 (review)', () => {
    const result = validateWizardStep(7, mockProductData)
    expect(result.valid).toBe(true)
  })

  it('should fail with invalid step number', () => {
    const result = validateWizardStep(99, mockProductData)
    expect(result.valid).toBe(false)
  })
})
