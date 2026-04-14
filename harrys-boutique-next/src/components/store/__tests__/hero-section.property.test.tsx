/**
 * Feature: ui-ux-redesign
 * Property 4: Controles de navegación del Hero presentes con múltiples slides
 * Property 5: Contenido del slide siempre visible
 */

import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as fc from 'fast-check'
import { HeroSection } from '../hero-section'

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

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode
      className?: string
      [key: string]: unknown
    }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}))

// Suppress console errors from React
beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

const slideArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  subtitle: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  image: fc.constant('/test-image.jpg'),
  product: fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
  }),
})

describe('HeroSection — Property 4: Controles de navegación presentes con múltiples slides', () => {
  /**
   * Validates: Requirements 3.2
   * Para cualquier array de slides con longitud >= 2, el componente debe renderizar
   * los controles de navegación (flechas prev/next).
   */
  it('muestra flechas prev/next cuando hay 2 o más slides', () => {
    fc.assert(
      fc.property(fc.array(slideArbitrary, { minLength: 2, maxLength: 5 }), (slides) => {
        const { unmount } = render(<HeroSection slides={slides} />)
        const prevBtn = screen.queryByLabelText('Slide anterior')
        const nextBtn = screen.queryByLabelText('Slide siguiente')
        unmount()
        return prevBtn !== null && nextBtn !== null
      }),
      { numRuns: 100 },
    )
  })

  it('no muestra flechas cuando hay exactamente 1 slide', () => {
    fc.assert(
      fc.property(fc.array(slideArbitrary, { minLength: 1, maxLength: 1 }), (slides) => {
        const { unmount } = render(<HeroSection slides={slides} />)
        const prevBtn = screen.queryByLabelText('Slide anterior')
        const nextBtn = screen.queryByLabelText('Slide siguiente')
        unmount()
        return prevBtn === null && nextBtn === null
      }),
      { numRuns: 50 },
    )
  })
})

describe('HeroSection — Property 5: Contenido del slide siempre visible', () => {
  /**
   * Validates: Requirements 3.3
   * Para cualquier slide con título y subtítulo no vacíos, el componente debe
   * renderizar ambos textos en el DOM.
   */
  it('renderiza el título y subtítulo del slide activo', () => {
    fc.assert(
      fc.property(fc.array(slideArbitrary, { minLength: 1, maxLength: 5 }), (slides) => {
        const { container, unmount } = render(<HeroSection slides={slides} />)
        const firstSlide = slides[0]
        // Use textContent to avoid HTML entity encoding issues
        const allText = container.textContent ?? ''
        const titleFound = allText.includes(firstSlide.title.trim())
        const subtitleFound = allText.includes(firstSlide.subtitle.trim())
        unmount()
        return titleFound && subtitleFound
      }),
      { numRuns: 100 },
    )
  })
})
