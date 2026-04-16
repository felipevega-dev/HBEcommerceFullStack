/**
 * Formatting helper functions for the Product Wizard
 * 
 * This file contains utility functions for formatting prices,
 * calculating discounts, and other display-related transformations.
 */

/**
 * Formats a number as Argentine Peso currency
 * 
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "$2.500")
 * 
 * @example
 * ```ts
 * formatPrice(2500) // "$2.500"
 * formatPrice(150000) // "$150.000"
 * formatPrice(99.99) // "$100"
 * ```
 */
export function formatPrice(amount: number): string {
  // Round to nearest integer (Argentine pesos don't use decimals in practice)
  const rounded = Math.round(amount)
  
  // Format with thousands separator (dot in Argentina)
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  return `$${formatted}`
}

/**
 * Calculates discount percentage between original and sale price
 * 
 * @param originalPrice - Original price before discount
 * @param salePrice - Current sale price
 * @returns Discount percentage rounded to nearest integer
 * 
 * @example
 * ```ts
 * calculateDiscountPercentage(3500, 2500) // 28
 * calculateDiscountPercentage(1000, 750) // 25
 * calculateDiscountPercentage(100, 100) // 0
 * ```
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  salePrice: number
): number {
  if (originalPrice <= 0 || salePrice <= 0) {
    return 0
  }
  
  if (salePrice >= originalPrice) {
    return 0
  }
  
  const discount = ((originalPrice - salePrice) / originalPrice) * 100
  return Math.round(discount)
}

/**
 * Formats discount information for display
 * 
 * @param originalPrice - Original price before discount
 * @param salePrice - Current sale price
 * @returns Formatted discount string (e.g., "28% de descuento")
 * 
 * @example
 * ```ts
 * formatDiscount(3500, 2500) // "28% de descuento"
 * formatDiscount(1000, 1000) // ""
 * ```
 */
export function formatDiscount(originalPrice: number, salePrice: number): string {
  const percentage = calculateDiscountPercentage(originalPrice, salePrice)
  
  if (percentage === 0) {
    return ''
  }
  
  return `${percentage}% de descuento`
}

/**
 * Formats a price with discount information
 * 
 * @param salePrice - Current sale price
 * @param originalPrice - Original price before discount (optional)
 * @returns Formatted price string with discount info
 * 
 * @example
 * ```ts
 * formatPriceWithDiscount(2500, 3500) 
 * // "$2.500 (28% off - antes $3.500)"
 * 
 * formatPriceWithDiscount(2500)
 * // "$2.500"
 * ```
 */
export function formatPriceWithDiscount(
  salePrice: number,
  originalPrice?: number
): string {
  const formattedSalePrice = formatPrice(salePrice)
  
  if (!originalPrice || originalPrice <= salePrice) {
    return formattedSalePrice
  }
  
  const percentage = calculateDiscountPercentage(originalPrice, salePrice)
  const formattedOriginalPrice = formatPrice(originalPrice)
  
  return `${formattedSalePrice} (${percentage}% off - antes ${formattedOriginalPrice})`
}

/**
 * Formats a relative timestamp (e.g., "hace 2 minutos")
 * 
 * @param date - Date to format
 * @returns Relative time string in Spanish
 * 
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 60000)) // "hace 1 minuto"
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "hace 1 hora"
 * ```
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSeconds < 60) {
    return 'hace unos segundos'
  }
  
  if (diffMinutes < 60) {
    return `hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
  }
  
  if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  }
  
  if (diffDays < 7) {
    return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  }
  
  // For older dates, show formatted date
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formats an array of items as a comma-separated list
 * 
 * @param items - Array of strings to format
 * @param maxItems - Maximum items to show before truncating
 * @returns Formatted list string
 * 
 * @example
 * ```ts
 * formatList(["S", "M", "L"]) // "S, M, L"
 * formatList(["S", "M", "L", "XL"], 2) // "S, M, +2 más"
 * ```
 */
export function formatList(items: string[], maxItems?: number): string {
  if (!items || items.length === 0) {
    return ''
  }
  
  if (!maxItems || items.length <= maxItems) {
    return items.join(', ')
  }
  
  const visible = items.slice(0, maxItems)
  const remaining = items.length - maxItems
  
  return `${visible.join(', ')}, +${remaining} más`
}

/**
 * Truncates text to a maximum length with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 * 
 * @example
 * ```ts
 * truncateText("Collar ajustable de nylon", 15) // "Collar ajust..."
 * truncateText("Corto", 15) // "Corto"
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Formats a character count for display
 * 
 * @param current - Current character count
 * @param max - Maximum allowed characters
 * @returns Formatted count string (e.g., "25/100 caracteres")
 * 
 * @example
 * ```ts
 * formatCharacterCount(25, 100) // "25/100 caracteres"
 * formatCharacterCount(0, 500) // "0/500 caracteres"
 * ```
 */
export function formatCharacterCount(current: number, max: number): string {
  return `${current}/${max} caracteres`
}

/**
 * Formats a selection count for display
 * 
 * @param count - Number of items selected
 * @param itemType - Type of item (e.g., "tallas", "colores")
 * @returns Formatted count string
 * 
 * @example
 * ```ts
 * formatSelectionCount(3, "tallas") // "3 tallas seleccionadas"
 * formatSelectionCount(1, "color") // "1 color seleccionado"
 * ```
 */
export function formatSelectionCount(count: number, itemType: string): string {
  if (count === 0) {
    return `Ningún ${itemType} seleccionado`
  }
  
  if (count === 1) {
    // Singular form
    const singular = itemType.endsWith('s') ? itemType.slice(0, -1) : itemType
    return `1 ${singular} seleccionado`
  }
  
  // Plural form
  const plural = itemType.endsWith('s') ? itemType : `${itemType}s`
  return `${count} ${plural} seleccionadas`
}
