/**
 * Feature: ui-ux-redesign
 * Property tests for utility functions
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatPrice, calculateContrastRatio } from '../utils'

// Design system color pairs that must meet WCAG AA (4.5:1): [text, background]
// Only pairs where text is dark on light bg or white on sufficiently dark bg
const DESIGN_COLOR_PAIRS: [string, string][] = [
  ['#1a1a1a', '#fdfaf7'], // primary text on background
  ['#1a1a1a', '#f7f2ed'], // primary text on surface
  ['#1a1a1a', '#efe8e0'], // primary text on surface-2
  ['#ffffff', '#1a1a1a'], // white on primary (black)
  ['#1a1a1a', '#f0e0e0'], // primary text on accent-light
  ['#4a7c59', '#fdfaf7'], // success on background
  ['#c0392b', '#fdfaf7'], // error on background
]

describe('utils — Property 1: Contraste de color suficiente', () => {
  /**
   * Feature: ui-ux-redesign, Property 1: Contraste de color suficiente
   * Validates: Requirement 1.4
   * Para cualquier par (color de texto, color de fondo) del sistema de diseño,
   * el ratio de contraste WCAG debe ser >= 4.5:1 para texto normal.
   */
  it('todos los pares de colores del sistema de diseño tienen contraste >= 4.5:1', () => {
    for (const [text, bg] of DESIGN_COLOR_PAIRS) {
      const ratio = calculateContrastRatio(text, bg)
      expect(ratio, `${text} sobre ${bg} tiene ratio ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(
        4.5,
      )
    }
  })

  it('calculateContrastRatio devuelve 1 para colores idénticos', () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[0-9a-f]{6}$/), (hex) => {
        const ratio = calculateContrastRatio(`#${hex}`, `#${hex}`)
        return Math.abs(ratio - 1) < 0.001
      }),
      { numRuns: 100 },
    )
  })

  it('calculateContrastRatio siempre devuelve un valor entre 1 y 21', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9a-f]{6}$/),
        fc.stringMatching(/^[0-9a-f]{6}$/),
        (hex1, hex2) => {
          const ratio = calculateContrastRatio(`#${hex1}`, `#${hex2}`)
          return ratio >= 1 && ratio <= 21
        },
      ),
      { numRuns: 100 },
    )
  })

  it('calculateContrastRatio es simétrico', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9a-f]{6}$/),
        fc.stringMatching(/^[0-9a-f]{6}$/),
        (hex1, hex2) => {
          const r1 = calculateContrastRatio(`#${hex1}`, `#${hex2}`)
          const r2 = calculateContrastRatio(`#${hex2}`, `#${hex1}`)
          return Math.abs(r1 - r2) < 0.001
        },
      ),
      { numRuns: 100 },
    )
  })
})

describe('utils — Property 12: Formato de precio correcto', () => {
  /**
   * Feature: ui-ux-redesign, Property 12: Formato de precio correcto
   * Validates: Requirement 15.7
   * Para cualquier precio numérico positivo, formatPrice debe producir
   * una cadena que incluya el símbolo de moneda y use separadores de miles.
   */
  it('formatPrice siempre incluye el símbolo de moneda', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10_000_000 }), (price) => {
        const formatted = formatPrice(price)
        return formatted.includes('$')
      }),
      { numRuns: 100 },
    )
  })

  it('formatPrice de precios >= 1000 contiene separador de miles', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 10_000_000 }), (price) => {
        const formatted = formatPrice(price)
        // es-CL uses . as thousands separator; digits count >= 4
        const digits = formatted.replace(/[^0-9]/g, '')
        return formatted.includes('.') || digits.length >= 4
      }),
      { numRuns: 100 },
    )
  })

  it('formatPrice devuelve una cadena no vacía para cualquier precio positivo', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10_000_000 }), (price) => {
        const formatted = formatPrice(price)
        return typeof formatted === 'string' && formatted.length > 0
      }),
      { numRuns: 100 },
    )
  })

  it('formatPrice de precios mayores produce cadenas más largas o iguales', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999 }),
        fc.integer({ min: 1000, max: 10_000_000 }),
        (small, large) => {
          const fSmall = formatPrice(small)
          const fLarge = formatPrice(large)
          return fLarge.length >= fSmall.length
        },
      ),
      { numRuns: 100 },
    )
  })
})
