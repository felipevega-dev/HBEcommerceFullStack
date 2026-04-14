/**
 * Feature: ui-ux-redesign
 * Example tests for CollectionFilters
 * Task 8.3: estado vacío cuando no hay productos con filtros
 */

import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CollectionFilters } from '../collection-filters'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/collection',
  useSearchParams: () => new URLSearchParams(),
}))

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

const categories = [
  { id: '1', name: 'Ropa', subcategories: ['Camisetas'] },
  { id: '2', name: 'Accesorios', subcategories: ['Collares'] },
]
const colors = ['Rojo', 'Azul']
const sizes = ['S', 'M', 'L']

describe('CollectionFilters — example tests', () => {
  it('muestra el título "Filtros"', () => {
    render(
      <CollectionFilters
        categories={categories}
        colors={colors}
        sizes={sizes}
        currentParams={{}}
      />,
    )
    expect(screen.getAllByText('Filtros').length).toBeGreaterThan(0)
  })

  it('no muestra chips ni "Limpiar todos" cuando no hay filtros activos', () => {
    render(
      <CollectionFilters
        categories={categories}
        colors={colors}
        sizes={sizes}
        currentParams={{}}
      />,
    )
    expect(screen.queryByText('Limpiar todos')).toBeNull()
  })

  it('muestra chips de filtros activos cuando hay categorías seleccionadas', () => {
    render(
      <CollectionFilters
        categories={categories}
        colors={colors}
        sizes={sizes}
        currentParams={{ category: 'Ropa' }}
      />,
    )
    // "Ropa" should appear as a chip label (in addition to the checkbox label)
    const ropaElements = screen.getAllByText('Ropa')
    expect(ropaElements.length).toBeGreaterThanOrEqual(2) // chip + checkbox label
    expect(screen.getAllByText('Limpiar todos').length).toBeGreaterThan(0)
  })

  it('muestra chips para colores y tallas seleccionados', () => {
    render(
      <CollectionFilters
        categories={categories}
        colors={colors}
        sizes={sizes}
        currentParams={{ colors: 'Rojo', sizes: 'M' }}
      />,
    )
    expect(screen.getAllByText('Rojo').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('M').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Limpiar todos').length).toBeGreaterThan(0)
  })

  it('muestra el botón "Filtros" en mobile (visible en DOM)', () => {
    render(
      <CollectionFilters
        categories={categories}
        colors={colors}
        sizes={sizes}
        currentParams={{}}
      />,
    )
    // The mobile button has aria-label "Abrir filtros"
    expect(screen.getByLabelText('Abrir filtros')).toBeTruthy()
  })

  it('muestra el mensaje "Selecciona una categoría" cuando las categorías no tienen subcategorías', () => {
    const categoriesWithoutSubs = [{ id: '1', name: 'Ropa', subcategories: [] }]
    render(
      <CollectionFilters
        categories={categoriesWithoutSubs}
        colors={colors}
        sizes={sizes}
        currentParams={{}}
      />,
    )
    expect(screen.getAllByText('Selecciona una categoría').length).toBeGreaterThan(0)
  })
})
