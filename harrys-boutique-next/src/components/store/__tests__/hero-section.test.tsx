import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
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

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

const mockSlide = {
  id: 'slide-1',
  title: 'Nueva Colección Verano',
  subtitle: 'Temporada 2025',
  image: '/hero-image.jpg',
  product: { id: 'prod-1', name: 'Vestido Floral' },
}

describe('HeroSection — tests de ejemplo', () => {
  it('muestra el banner fallback cuando no hay slides', () => {
    render(<HeroSection slides={[]} />)

    expect(screen.getByText('Moda para tu mejor amigo')).toBeInTheDocument()
    expect(screen.getByAltText("Harry's Boutique")).toBeInTheDocument()
    const ctaLink = screen.getByRole('link', { name: /ver colección/i })
    expect(ctaLink).toHaveAttribute('href', '/collection')
  })

  it('muestra el botón CTA en el slide', () => {
    render(<HeroSection slides={[mockSlide]} />)

    const ctaLink = screen.getByRole('link', { name: /comprar ahora/i })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', `/product/${mockSlide.product.id}`)
  })

  it('muestra el título y subtítulo del slide', () => {
    render(<HeroSection slides={[mockSlide]} />)

    expect(screen.getByText(mockSlide.title)).toBeInTheDocument()
    expect(screen.getByText(mockSlide.subtitle)).toBeInTheDocument()
  })

  it('muestra flechas de navegación con múltiples slides', () => {
    const slides = [
      mockSlide,
      {
        ...mockSlide,
        id: 'slide-2',
        title: 'Colección Otoño',
        product: { id: 'prod-2', name: 'Abrigo' },
      },
    ]
    render(<HeroSection slides={slides} />)

    expect(screen.getByLabelText('Slide anterior')).toBeInTheDocument()
    expect(screen.getByLabelText('Slide siguiente')).toBeInTheDocument()
  })

  it('no muestra flechas de navegación con un solo slide', () => {
    render(<HeroSection slides={[mockSlide]} />)

    expect(screen.queryByLabelText('Slide anterior')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Slide siguiente')).not.toBeInTheDocument()
  })
})
