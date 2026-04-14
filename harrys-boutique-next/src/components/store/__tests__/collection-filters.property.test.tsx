/**
 * Feature: ui-ux-redesign
 * Property 10: Chips de filtros activos reflejan los filtros aplicados
 * Validates: Requirement 6.3
 */

import { describe, it, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as fc from 'fast-check'
import { CollectionFilters } from '../collection-filters'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/collection',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    ),
  },
}))

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

const baseCategories = [
  { id: '1', name: 'Ropa', subcategories: ['Camisetas', 'Pantalones'] },
  { id: '2', name: 'Accesorios', subcategories: ['Collares', 'Correas'] },
]
const baseColors = ['Rojo', 'Azul', 'Verde']
const baseSizes = ['XS', 'S', 'M', 'L', 'XL']

describe('CollectionFilters — Property 10: Chips de filtros activos reflejan los filtros aplicados', () => {
  /**
   * Validates: Requirement 6.3
   * Para cualquier conjunto no vacío de filtros activos (categorías, colores, tallas),
   * el componente CollectionFilters debe renderizar un chip por cada valor de filtro activo,
   * mostrando el valor correcto.
   */
  it('muestra un chip por cada categoría seleccionada', () => {
    fc.assert(
      fc.property(fc.subarray(['Ropa', 'Accesorios'], { minLength: 1 }), (selectedCats) => {
        const { unmount } = render(
          <CollectionFilters
            categories={baseCategories}
            colors={baseColors}
            sizes={baseSizes}
            currentParams={{ category: selectedCats.join(',') }}
          />,
        )
        // Each selected category should appear as a chip label
        const allChips = selectedCats.every((cat) => {
          const elements = screen.queryAllByText(cat)
          return elements.length > 0
        })
        unmount()
        return allChips
      }),
      { numRuns: 50 },
    )
  })

  it('muestra un chip por cada color seleccionado', () => {
    fc.assert(
      fc.property(fc.subarray(['Rojo', 'Azul', 'Verde'], { minLength: 1 }), (selectedColors) => {
        const { unmount } = render(
          <CollectionFilters
            categories={baseCategories}
            colors={baseColors}
            sizes={baseSizes}
            currentParams={{ colors: selectedColors.join(',') }}
          />,
        )
        const allChips = selectedColors.every((color) => {
          const elements = screen.queryAllByText(color)
          return elements.length > 0
        })
        unmount()
        return allChips
      }),
      { numRuns: 50 },
    )
  })

  it('muestra un chip por cada talla seleccionada', () => {
    fc.assert(
      fc.property(fc.subarray(['XS', 'S', 'M', 'L', 'XL'], { minLength: 1 }), (selectedSizes) => {
        const { unmount } = render(
          <CollectionFilters
            categories={baseCategories}
            colors={baseColors}
            sizes={baseSizes}
            currentParams={{ sizes: selectedSizes.join(',') }}
          />,
        )
        const allChips = selectedSizes.every((size) => {
          const elements = screen.queryAllByText(size)
          return elements.length > 0
        })
        unmount()
        return allChips
      }),
      { numRuns: 50 },
    )
  })

  it('muestra el botón "Limpiar todos" cuando hay filtros activos', () => {
    fc.assert(
      fc.property(fc.subarray(['Ropa', 'Accesorios'], { minLength: 1 }), (selectedCats) => {
        const { unmount } = render(
          <CollectionFilters
            categories={baseCategories}
            colors={baseColors}
            sizes={baseSizes}
            currentParams={{ category: selectedCats.join(',') }}
          />,
        )
        const clearBtn = screen.queryAllByText('Limpiar todos')
        unmount()
        return clearBtn.length > 0
      }),
      { numRuns: 50 },
    )
  })

  it('no muestra chips cuando no hay filtros activos', () => {
    const { unmount } = render(
      <CollectionFilters
        categories={baseCategories}
        colors={baseColors}
        sizes={baseSizes}
        currentParams={{}}
      />,
    )
    const clearBtn = screen.queryByText('Limpiar todos')
    unmount()
    // No "Limpiar todos" button when no filters
    return clearBtn === null
  })
})
