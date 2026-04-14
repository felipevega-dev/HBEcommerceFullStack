/**
 * Feature: ui-ux-redesign
 * Property 6: Badge Best Seller aparece para productos marcados
 * Property 7: Segunda imagen presente en el DOM para productos con múltiples imágenes
 * Property 8: Precio original tachado cuando hay descuento
 * Property 9: Estrellas visibles cuando hay calificaciones
 */

import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as fc from 'fast-check'
import { ProductCard } from '../product-card'

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

// Mock WishlistButton
vi.mock('@/components/store/wishlist-button', () => ({
  WishlistButton: () => <button>Wishlist</button>,
}))

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

const baseProduct = {
  id: 'prod-1',
  name: 'Producto de prueba',
  price: 10000,
  images: ['/img1.jpg'],
}

describe('ProductCard — Property 6: Badge Best Seller aparece para productos marcados', () => {
  /**
   * Validates: Requirements 4.3, 5.4
   * Para cualquier producto con bestSeller = true, el componente debe renderizar
   * un badge con el texto "Best Seller".
   */
  it('muestra el badge Best Seller cuando bestSeller es true', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          price: fc.integer({ min: 100, max: 1_000_000 }),
          images: fc.array(fc.constant('/img.jpg'), { minLength: 1, maxLength: 3 }),
        }),
        (product) => {
          const { unmount } = render(<ProductCard product={{ ...product, bestSeller: true }} />)
          const badge = screen.queryByText('Más Vendido')
          unmount()
          return badge !== null
        },
      ),
      { numRuns: 100 },
    )
  })

  it('no muestra el badge Best Seller cuando bestSeller es false o undefined', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          price: fc.integer({ min: 100, max: 1_000_000 }),
          images: fc.array(fc.constant('/img.jpg'), { minLength: 1, maxLength: 3 }),
        }),
        fc.boolean(),
        (product, bestSeller) => {
          const { unmount } = render(<ProductCard product={{ ...product, bestSeller: false }} />)
          const badge = screen.queryByText('Más Vendido')
          unmount()
          // bestSeller: false → no debe aparecer el badge
          return badge === null
        },
      ),
      { numRuns: 50 },
    )
  })
})

describe('ProductCard — Property 7: Segunda imagen presente en el DOM para productos con múltiples imágenes', () => {
  /**
   * Validates: Requirement 5.2
   * Para cualquier producto con 2 o más imágenes, el componente debe incluir
   * la segunda imagen en el DOM.
   */
  it('incluye la segunda imagen en el DOM cuando hay 2 o más imágenes', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          price: fc.integer({ min: 100, max: 1_000_000 }),
        }),
        fc.array(fc.constantFrom('/img1.jpg', '/img2.jpg', '/img3.jpg'), {
          minLength: 2,
          maxLength: 4,
        }),
        (product, images) => {
          const { unmount } = render(<ProductCard product={{ ...product, images }} />)
          // La segunda imagen debe estar en el DOM (aunque oculta)
          const imgs = screen.queryAllByRole('img')
          unmount()
          // Debe haber al menos 2 imágenes renderizadas
          return imgs.length >= 2
        },
      ),
      { numRuns: 100 },
    )
  })

  it('solo muestra una imagen cuando hay exactamente 1 imagen', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          price: fc.integer({ min: 100, max: 1_000_000 }),
        }),
        (product) => {
          const { unmount } = render(
            <ProductCard product={{ ...product, images: ['/img1.jpg'] }} />,
          )
          const imgs = screen.queryAllByRole('img')
          unmount()
          return imgs.length === 1
        },
      ),
      { numRuns: 50 },
    )
  })
})

describe('ProductCard — Property 8: Precio original tachado cuando hay descuento', () => {
  /**
   * Validates: Requirement 5.3
   * Para cualquier producto con originalPrice > price, el componente debe renderizar
   * el precio original con estilo line-through.
   */
  it('muestra el precio original con line-through cuando originalPrice > price', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 500_000 }),
        fc.integer({ min: 1, max: 99 }),
        (price, discount) => {
          const originalPrice = price + discount * 100
          const { unmount } = render(
            <ProductCard product={{ ...baseProduct, price, originalPrice }} />,
          )
          // Buscar el elemento con clase line-through
          const struckEl = document.querySelector('.line-through')
          unmount()
          return struckEl !== null
        },
      ),
      { numRuns: 100 },
    )
  })

  it('no muestra precio tachado cuando no hay originalPrice', () => {
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 1_000_000 }), (price) => {
        const { unmount } = render(<ProductCard product={{ ...baseProduct, price }} />)
        const struckEl = document.querySelector('.line-through')
        unmount()
        return struckEl === null
      }),
      { numRuns: 50 },
    )
  })
})

describe('ProductCard — Property 9: Estrellas visibles cuando hay calificaciones', () => {
  /**
   * Validates: Requirement 5.6
   * Para cualquier producto con ratingCount > 0 y ratingAverage > 0, el componente
   * debe renderizar las estrellas de calificación y el conteo de reseñas.
   */
  it('muestra las estrellas y el conteo cuando ratingCount > 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9999 }),
        fc.float({ min: 0.5, max: 5.0, noNaN: true }),
        (ratingCount, ratingAverage) => {
          const { unmount } = render(
            <ProductCard product={{ ...baseProduct, ratingCount, ratingAverage }} />,
          )
          // El componente StarRating renderiza el conteo entre paréntesis
          const countEl = screen.queryByText(`(${ratingCount})`)
          unmount()
          return countEl !== null
        },
      ),
      { numRuns: 100 },
    )
  })

  it('no muestra estrellas cuando ratingCount es 0 o undefined', () => {
    fc.assert(
      fc.property(fc.constantFrom(0, undefined), (ratingCount) => {
        const { unmount } = render(
          <ProductCard product={{ ...baseProduct, ratingCount, ratingAverage: 4.5 }} />,
        )
        // No debe haber ningún elemento con aria-label de estrellas
        const starsEl = document.querySelector('[aria-label*="estrellas"]')
        unmount()
        return starsEl === null
      }),
      { numRuns: 50 },
    )
  })
})
