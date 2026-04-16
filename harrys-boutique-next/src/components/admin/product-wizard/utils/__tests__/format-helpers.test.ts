/**
 * Unit tests for format helper functions
 */

import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  calculateDiscountPercentage,
  formatDiscount,
  formatPriceWithDiscount,
  formatRelativeTime,
  formatList,
  truncateText,
  formatCharacterCount,
  formatSelectionCount
} from '../format-helpers'

describe('formatPrice', () => {
  it('should format price with thousands separator', () => {
    expect(formatPrice(2500)).toBe('$2.500')
    expect(formatPrice(150000)).toBe('$150.000')
    expect(formatPrice(1000000)).toBe('$1.000.000')
  })

  it('should format small prices without separator', () => {
    expect(formatPrice(100)).toBe('$100')
    expect(formatPrice(999)).toBe('$999')
  })

  it('should round decimal values', () => {
    expect(formatPrice(99.99)).toBe('$100')
    expect(formatPrice(2500.49)).toBe('$2.500')
    expect(formatPrice(2500.51)).toBe('$2.501')
  })

  it('should handle zero', () => {
    expect(formatPrice(0)).toBe('$0')
  })
})

describe('calculateDiscountPercentage', () => {
  it('should calculate discount percentage correctly', () => {
    expect(calculateDiscountPercentage(3500, 2500)).toBe(29) // (3500-2500)/3500 = 28.57% rounds to 29%
    expect(calculateDiscountPercentage(1000, 750)).toBe(25)
    expect(calculateDiscountPercentage(200, 100)).toBe(50)
  })

  it('should round to nearest integer', () => {
    expect(calculateDiscountPercentage(1000, 667)).toBe(33)
    expect(calculateDiscountPercentage(1000, 666)).toBe(33)
  })

  it('should return 0 when prices are equal', () => {
    expect(calculateDiscountPercentage(1000, 1000)).toBe(0)
  })

  it('should return 0 when sale price is higher', () => {
    expect(calculateDiscountPercentage(1000, 1500)).toBe(0)
  })

  it('should return 0 for invalid prices', () => {
    expect(calculateDiscountPercentage(0, 100)).toBe(0)
    expect(calculateDiscountPercentage(100, 0)).toBe(0)
    expect(calculateDiscountPercentage(-100, 50)).toBe(0)
  })
})

describe('formatDiscount', () => {
  it('should format discount with percentage', () => {
    expect(formatDiscount(3500, 2500)).toBe('29% de descuento')
    expect(formatDiscount(1000, 750)).toBe('25% de descuento')
  })

  it('should return empty string when no discount', () => {
    expect(formatDiscount(1000, 1000)).toBe('')
    expect(formatDiscount(1000, 1500)).toBe('')
  })
})

describe('formatPriceWithDiscount', () => {
  it('should format price with discount info', () => {
    const result = formatPriceWithDiscount(2500, 3500)
    expect(result).toContain('$2.500')
    expect(result).toContain('29%')
    expect(result).toContain('$3.500')
  })

  it('should format price without discount when not provided', () => {
    expect(formatPriceWithDiscount(2500)).toBe('$2.500')
  })

  it('should format price without discount when prices are equal', () => {
    expect(formatPriceWithDiscount(2500, 2500)).toBe('$2.500')
  })

  it('should format price without discount when original is lower', () => {
    expect(formatPriceWithDiscount(3500, 2500)).toBe('$3.500')
  })
})

describe('formatRelativeTime', () => {
  it('should format seconds ago', () => {
    const date = new Date(Date.now() - 30 * 1000)
    expect(formatRelativeTime(date)).toBe('hace unos segundos')
  })

  it('should format minutes ago', () => {
    const date1 = new Date(Date.now() - 1 * 60 * 1000)
    expect(formatRelativeTime(date1)).toBe('hace 1 minuto')
    
    const date5 = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(date5)).toBe('hace 5 minutos')
  })

  it('should format hours ago', () => {
    const date1 = new Date(Date.now() - 1 * 60 * 60 * 1000)
    expect(formatRelativeTime(date1)).toBe('hace 1 hora')
    
    const date3 = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelativeTime(date3)).toBe('hace 3 horas')
  })

  it('should format days ago', () => {
    const date1 = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(date1)).toBe('hace 1 día')
    
    const date3 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(date3)).toBe('hace 3 días')
  })

  it('should format old dates with full date', () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(date)
    // Should contain date components
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

describe('formatList', () => {
  it('should format list with all items', () => {
    expect(formatList(['S', 'M', 'L'])).toBe('S, M, L')
    expect(formatList(['Negro', 'Blanco'])).toBe('Negro, Blanco')
  })

  it('should truncate list when exceeding max items', () => {
    expect(formatList(['S', 'M', 'L', 'XL'], 2)).toBe('S, M, +2 más')
    expect(formatList(['A', 'B', 'C', 'D', 'E'], 3)).toBe('A, B, C, +2 más')
  })

  it('should handle empty array', () => {
    expect(formatList([])).toBe('')
  })

  it('should handle single item', () => {
    expect(formatList(['Solo'])).toBe('Solo')
  })
})

describe('truncateText', () => {
  it('should truncate long text', () => {
    expect(truncateText('Collar ajustable de nylon', 15)).toBe('Collar ajust...')
  })

  it('should not truncate short text', () => {
    expect(truncateText('Corto', 15)).toBe('Corto')
  })

  it('should handle exact length', () => {
    expect(truncateText('Exacto', 6)).toBe('Exacto')
  })

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('')
  })
})

describe('formatCharacterCount', () => {
  it('should format character count', () => {
    expect(formatCharacterCount(25, 100)).toBe('25/100 caracteres')
    expect(formatCharacterCount(0, 500)).toBe('0/500 caracteres')
    expect(formatCharacterCount(100, 100)).toBe('100/100 caracteres')
  })
})

describe('formatSelectionCount', () => {
  it('should format zero selections', () => {
    expect(formatSelectionCount(0, 'tallas')).toBe('Ningún tallas seleccionado')
    expect(formatSelectionCount(0, 'color')).toBe('Ningún color seleccionado')
  })

  it('should format single selection', () => {
    expect(formatSelectionCount(1, 'tallas')).toBe('1 talla seleccionado')
    expect(formatSelectionCount(1, 'color')).toBe('1 color seleccionado')
  })

  it('should format multiple selections', () => {
    expect(formatSelectionCount(3, 'tallas')).toBe('3 tallas seleccionadas')
    expect(formatSelectionCount(5, 'colores')).toBe('5 colores seleccionadas')
  })

  it('should handle singular/plural correctly', () => {
    expect(formatSelectionCount(2, 'color')).toBe('2 colors seleccionadas')
    expect(formatSelectionCount(2, 'tallas')).toBe('2 tallas seleccionadas')
  })
})
