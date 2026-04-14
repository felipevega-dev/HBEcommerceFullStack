import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  name: 'Collar para perro',
  price: 15000,
  images: ['/collar.jpg'],
}

describe('ProductCard — tests de ejemplo', () => {
  it('muestra placeholder con ícono y nombre cuando no hay imagen', () => {
    render(<ProductCard product={{ ...baseProduct, images: [] }} />)

    // El nombre del producto debe aparecer en el placeholder (span dentro del placeholder)
    const placeholderName = document.querySelector('.line-clamp-2:not(h3)')
    expect(placeholderName).toBeInTheDocument()
    expect(placeholderName?.textContent).toBe('Collar para perro')
    // No debe haber ninguna imagen
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('muestra el nombre del producto', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('Collar para perro')).toBeInTheDocument()
  })

  it('muestra el precio formateado', () => {
    render(<ProductCard product={baseProduct} />)
    // formatPrice con es-CL y CLP
    expect(screen.getByText(/15\.000/)).toBeInTheDocument()
  })

  it('muestra el badge Best Seller cuando bestSeller es true', () => {
    render(<ProductCard product={{ ...baseProduct, bestSeller: true }} />)
    expect(screen.getByText('Más Vendido')).toBeInTheDocument()
  })

  it('no muestra el badge Best Seller cuando bestSeller es false', () => {
    render(<ProductCard product={{ ...baseProduct, bestSeller: false }} />)
    expect(screen.queryByText('Más Vendido')).not.toBeInTheDocument()
  })

  it('muestra precio tachado cuando hay originalPrice mayor al precio', () => {
    render(<ProductCard product={{ ...baseProduct, price: 10000, originalPrice: 20000 }} />)
    const struckEl = document.querySelector('.line-through')
    expect(struckEl).toBeInTheDocument()
  })

  it('no muestra precio tachado cuando no hay originalPrice', () => {
    render(<ProductCard product={baseProduct} />)
    expect(document.querySelector('.line-through')).not.toBeInTheDocument()
  })

  it('muestra las estrellas cuando ratingCount > 0', () => {
    render(<ProductCard product={{ ...baseProduct, ratingCount: 42, ratingAverage: 4.5 }} />)
    expect(screen.getByText('(42)')).toBeInTheDocument()
  })

  it('no muestra estrellas cuando ratingCount es 0', () => {
    render(<ProductCard product={{ ...baseProduct, ratingCount: 0, ratingAverage: 4.5 }} />)
    expect(document.querySelector('[aria-label*="estrellas"]')).not.toBeInTheDocument()
  })

  it('muestra la segunda imagen cuando hay 2 imágenes', () => {
    render(<ProductCard product={{ ...baseProduct, images: ['/img1.jpg', '/img2.jpg'] }} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(2)
    expect(imgs[1]).toHaveAttribute('src', '/img2.jpg')
  })

  it('enlaza al producto correcto', () => {
    render(<ProductCard product={baseProduct} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/product/prod-1')
  })
})
