/**
 * Type definitions for the Product Wizard
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the 7-step product creation/editing wizard.
 */

/**
 * Complete product data structure containing all fields from all 7 wizard steps
 */
export interface ProductData {
  // Step 1: Photo Upload
  /** Array of image files (for new uploads) or URLs (for existing products) */
  images: File[] | string[]
  /** Order of images by index (first is principal) */
  imageOrder: number[]
  
  // Step 2: Basic Information
  /** Product name (3-100 characters) */
  name: string
  /** Product description (10-500 characters) */
  description: string
  
  // Step 3: Pricing
  /** Selling price (must be > 0) */
  price: number
  /** Whether the product has a discount */
  hasDiscount: boolean
  /** Original price before discount (optional, must be > price if provided) */
  originalPrice?: number
  
  // Step 4: Category
  /** Main category ID (e.g., "dogs", "cats", "birds", "other") */
  categoryId: string
  /** Subcategory name (e.g., "collars", "toys", "food", "clothing") */
  subCategory: string
  
  // Step 5: Sizes and Colors
  /** Selected sizes (e.g., ["XS", "S", "M", "L", "XL"]) */
  sizes: string[]
  /** Selected colors (e.g., ["black", "white", "red", "blue"]) */
  colors: string[]
  
  // Step 6: Final Options
  /** Stock quantity (0 or positive integer) */
  stock: number
  /** Whether to show as best seller */
  bestSeller: boolean
  /** Whether product is active and visible in store */
  active: boolean
  
  // Metadata (only present in edit mode)
  /** Product ID (only in edit mode) */
  id?: string
  /** Creation timestamp */
  createdAt?: Date
  /** Last update timestamp */
  updatedAt?: Date
}

/**
 * Represents a single step in the wizard
 */
export interface WizardStep {
  /** Step number (1-7) */
  number: number
  /** Display name of the step */
  name: string
  /** Whether the step has been completed */
  completed: boolean
  /** Whether the step is currently active */
  active: boolean
}

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  /** Field name that has the error */
  field: string
  /** Human-readable error message in Spanish */
  message: string
}

/**
 * Draft state saved to localStorage for auto-save functionality
 */
export interface DraftState {
  /** The product data being edited */
  data: ProductData
  /** Current step number (1-7) */
  step: number
  /** ISO timestamp of when the draft was saved */
  timestamp: string
}

/**
 * Result of a validation check
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Array of validation errors (empty if valid) */
  errors: ValidationError[]
}

/**
 * Available product categories
 */
export type CategoryId = 'dogs' | 'cats' | 'birds' | 'other'

/**
 * Available product sizes
 */
export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL'

/**
 * Available product colors
 */
export type ProductColor = 
  | 'black' 
  | 'white' 
  | 'red' 
  | 'blue' 
  | 'green' 
  | 'yellow' 
  | 'pink' 
  | 'brown' 
  | 'gray' 
  | 'orange'

/**
 * Wizard mode (create new or edit existing)
 */
export type WizardMode = 'create' | 'edit'
