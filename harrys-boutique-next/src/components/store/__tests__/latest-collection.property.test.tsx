/**
 * Feature: ui-ux-redesign
 * Property 13: Skeletons presentes en estado de carga
 * Validates: Requirements 4.7, 16.4
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { SkeletonCard } from '@/components/ui/skeleton-card'

describe('SkeletonCard — Property 13: Skeletons presentes en estado de carga', () => {
  /**
   * Validates: Requirements 4.7, 16.4
   * Para cualquier componente de listado en estado de carga, debe renderizar
   * elementos skeleton con la clase animate-pulse.
   */
  it('renderiza el elemento raíz con clase animate-pulse', () => {
    fc.assert(
      fc.property(
        // Número de skeletons a renderizar (simula distintas grillas)
        fc.integer({ min: 1, max: 20 }),
        (count) => {
          const { container, unmount } = render(
            <div>
              {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>,
          )
          const skeletons = container.querySelectorAll('.animate-pulse')
          unmount()
          // Debe haber exactamente `count` elementos con animate-pulse
          return skeletons.length === count
        },
      ),
      { numRuns: 100 },
    )
  })

  it('cada SkeletonCard contiene placeholders de imagen y texto', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), (count) => {
        const { container, unmount } = render(
          <div>
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>,
        )
        const skeletons = container.querySelectorAll('.animate-pulse')
        let allHaveChildren = true
        skeletons.forEach((skeleton) => {
          // Cada skeleton debe tener al menos 2 hijos (imagen + texto)
          if (skeleton.children.length < 2) {
            allHaveChildren = false
          }
        })
        unmount()
        return allHaveChildren
      }),
      { numRuns: 100 },
    )
  })
})
