/**
 * Validation rules for each step of the Product Wizard
 * 
 * This file contains validation functions that check user input
 * and return human-readable error messages in Spanish.
 */

import type { ProductData, ValidationError, ValidationResult } from '../types'

/**
 * Validates Step 1: Photo Upload
 * 
 * Requirements:
 * - At least 1 image is required
 * - Maximum 4 images allowed
 * 
 * @param images - Array of image files or URLs
 * @returns Validation result with any errors
 */
export function validateStep1Photos(images: File[] | string[]): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!images || images.length === 0) {
    errors.push({
      field: 'images',
      message: 'Se requiere al menos una imagen'
    })
  }
  
  if (images && images.length > 4) {
    errors.push({
      field: 'images',
      message: 'Máximo 4 imágenes permitidas'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates Step 2: Basic Information
 * 
 * Requirements:
 * - Name: 3-100 characters (trimmed)
 * - Description: 10-500 characters (trimmed)
 * 
 * @param name - Product name
 * @param description - Product description
 * @returns Validation result with any errors
 */
export function validateStep2BasicInfo(
  name: string,
  description: string
): ValidationResult {
  const errors: ValidationError[] = []
  
  const trimmedName = name?.trim() || ''
  const trimmedDescription = description?.trim() || ''
  
  if (trimmedName.length < 3) {
    errors.push({
      field: 'name',
      message: 'El nombre debe tener al menos 3 caracteres'
    })
  }
  
  if (trimmedName.length > 100) {
    errors.push({
      field: 'name',
      message: 'El nombre no puede superar los 100 caracteres'
    })
  }
  
  if (trimmedDescription.length < 10) {
    errors.push({
      field: 'description',
      message: 'La descripción debe tener al menos 10 caracteres (sin contar espacios al inicio o final)'
    })
  }
  
  if (trimmedDescription.length > 500) {
    errors.push({
      field: 'description',
      message: 'La descripción no puede superar los 500 caracteres'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates Step 3: Pricing
 * 
 * Requirements:
 * - Price must be greater than 0
 * - If discount is enabled, original price must be greater than selling price
 * 
 * @param price - Selling price
 * @param hasDiscount - Whether product has discount
 * @param originalPrice - Original price before discount (optional)
 * @returns Validation result with any errors
 */
export function validateStep3Pricing(
  price: number,
  hasDiscount: boolean,
  originalPrice?: number
): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!price || price <= 0) {
    errors.push({
      field: 'price',
      message: 'El precio debe ser mayor a 0'
    })
  }
  
  if (hasDiscount) {
    if (!originalPrice || originalPrice <= 0) {
      errors.push({
        field: 'originalPrice',
        message: 'El precio original es requerido cuando hay descuento'
      })
    } else if (originalPrice <= price) {
      errors.push({
        field: 'originalPrice',
        message: 'El precio original debe ser mayor al precio de venta'
      })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates Step 4: Category Selection
 * 
 * Requirements:
 * - Category ID must be selected
 * - Subcategory must be selected
 * 
 * @param categoryId - Main category ID
 * @param subCategory - Subcategory name
 * @returns Validation result with any errors
 */
export function validateStep4Category(
  categoryId: string,
  subCategory: string
): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!categoryId || categoryId.trim() === '') {
    errors.push({
      field: 'categoryId',
      message: 'Debes seleccionar una categoría'
    })
  }
  
  if (!subCategory || subCategory.trim() === '') {
    errors.push({
      field: 'subCategory',
      message: 'Debes seleccionar una subcategoría'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates Step 5: Sizes and Colors
 * 
 * Requirements:
 * - At least 1 size must be selected
 * - At least 1 color must be selected
 * 
 * @param sizes - Array of selected sizes
 * @param colors - Array of selected colors
 * @returns Validation result with any errors
 */
export function validateStep5SizesColors(
  sizes: string[],
  colors: string[]
): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!sizes || sizes.length === 0) {
    errors.push({
      field: 'sizes',
      message: 'Debes seleccionar al menos una talla'
    })
  }
  
  if (!colors || colors.length === 0) {
    errors.push({
      field: 'colors',
      message: 'Debes seleccionar al menos un color'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates Step 6: Final Options
 * 
 * Requirements:
 * - Stock must be 0 or positive integer
 * 
 * @param stock - Stock quantity
 * @returns Validation result with any errors
 */
export function validateStep6Options(stock: number): ValidationResult {
  const errors: ValidationError[] = []
  
  if (stock < 0) {
    errors.push({
      field: 'stock',
      message: 'El stock no puede ser negativo'
    })
  }
  
  if (!Number.isInteger(stock)) {
    errors.push({
      field: 'stock',
      message: 'El stock debe ser un número entero'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates image file type and size
 * 
 * Requirements:
 * - File must be an image (JPG, PNG, WEBP)
 * - File size must be <= 5MB
 * 
 * @param file - File to validate
 * @returns Validation result with any errors
 */
export function validateImageFile(file: File): ValidationResult {
  const errors: ValidationError[] = []
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    errors.push({
      field: 'image',
      message: 'Solo se permiten archivos de imagen (JPG, PNG, WEBP)'
    })
  }
  
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    errors.push({
      field: 'image',
      message: 'La imagen es muy grande. Máximo 5MB'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates a complete wizard step based on step number
 * 
 * @param stepNumber - Step number (1-7)
 * @param productData - Current product data
 * @returns Validation result with any errors
 */
export function validateWizardStep(
  stepNumber: number,
  productData: ProductData
): ValidationResult {
  switch (stepNumber) {
    case 1:
      return validateStep1Photos(productData.images)
    case 2:
      return validateStep2BasicInfo(productData.name, productData.description)
    case 3:
      return validateStep3Pricing(
        productData.price,
        productData.hasDiscount,
        productData.originalPrice
      )
    case 4:
      return validateStep4Category(productData.categoryId, productData.subCategory)
    case 5:
      return validateStep5SizesColors(productData.sizes, productData.colors)
    case 6:
      return validateStep6Options(productData.stock)
    case 7:
      // Step 7 is review only, no validation needed
      return { valid: true, errors: [] }
    default:
      return { valid: false, errors: [{ field: 'step', message: 'Paso inválido' }] }
  }
}
