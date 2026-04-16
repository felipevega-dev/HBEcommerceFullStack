/**
 * LocalStorage key constants for the Product Wizard
 * 
 * This file centralizes all localStorage keys used for auto-save
 * and draft management functionality.
 */

/**
 * Base prefix for all product wizard localStorage keys
 */
const WIZARD_PREFIX = 'product-wizard'

/**
 * Generates a localStorage key for a product draft
 * 
 * @param productId - Product ID for edit mode, or 'new' for create mode
 * @returns LocalStorage key string
 * 
 * @example
 * ```ts
 * // Create mode
 * getProductDraftKey() // "product-wizard-draft-new"
 * 
 * // Edit mode
 * getProductDraftKey("abc123") // "product-wizard-draft-abc123"
 * ```
 */
export function getProductDraftKey(productId?: string): string {
  return `${WIZARD_PREFIX}-draft-${productId || 'new'}`
}

/**
 * Key for storing the last auto-save timestamp
 */
export const LAST_SAVE_TIMESTAMP_KEY = `${WIZARD_PREFIX}-last-save`

/**
 * Key for storing user preferences (e.g., dismissed hints)
 */
export const USER_PREFERENCES_KEY = `${WIZARD_PREFIX}-preferences`

/**
 * Maximum age of a draft in milliseconds (7 days)
 * Drafts older than this will be considered expired
 */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Checks if a draft timestamp is expired
 * 
 * @param timestamp - ISO timestamp string
 * @returns True if draft is expired, false otherwise
 * 
 * @example
 * ```ts
 * const draft = JSON.parse(localStorage.getItem(key))
 * if (isDraftExpired(draft.timestamp)) {
 *   // Clear expired draft
 *   localStorage.removeItem(key)
 * }
 * ```
 */
export function isDraftExpired(timestamp: string): boolean {
  const draftDate = new Date(timestamp)
  const now = new Date()
  const ageMs = now.getTime() - draftDate.getTime()
  return ageMs > DRAFT_MAX_AGE_MS
}

/**
 * Clears all product wizard related data from localStorage
 * 
 * @param productId - Optional product ID to clear specific draft
 * 
 * @example
 * ```ts
 * // Clear specific product draft
 * clearWizardStorage("abc123")
 * 
 * // Clear all wizard data
 * clearWizardStorage()
 * ```
 */
export function clearWizardStorage(productId?: string): void {
  if (productId) {
    // Clear specific product draft
    localStorage.removeItem(getProductDraftKey(productId))
  } else {
    // Clear all wizard-related keys
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(WIZARD_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }
}

/**
 * Gets all product draft keys from localStorage
 * 
 * @returns Array of draft keys
 * 
 * @example
 * ```ts
 * const draftKeys = getAllDraftKeys()
 * console.log(`Found ${draftKeys.length} drafts`)
 * ```
 */
export function getAllDraftKeys(): string[] {
  const keys = Object.keys(localStorage)
  return keys.filter(key => key.startsWith(`${WIZARD_PREFIX}-draft-`))
}
