import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroCompact } from '../hero-compact'

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

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

describe('HeroCompact', () => {
  it('muestra fallback cuando no hay slides', () => {
    render(<HeroCompact slides={[]} />)

    expect(screen.getByText('Moda premium para tu mascota')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver colección/i })).toHaveAttribute(
      'href',
      '/collection',
    )
  })

  it('muestra CTA al producto del slide', () => {
    render(<HeroCompact slides={[mockSlide]} />)

    expect(screen.getByText(mockSlide.title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /comprar ahora/i })).toHaveAttribute(
      'href',
      `/product/${mockSlide.product.id}`,
    )
  })
})
