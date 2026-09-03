import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StoreCategoryRow, StoreEditorialHeader } from '../store-editorial-header'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const categories = [
  {
    id: 'prendas',
    name: 'Prendas',
    homeImage: 'https://images.example.com/prendas.jpg',
    homeDescription: 'Ropa handmade',
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    homeImage: 'https://images.example.com/accesorios.jpg',
    homeDescription: 'Detalles para cada día',
  },
]

describe('StoreEditorialHeader', () => {
  it('mantiene el lenguaje editorial del Home', () => {
    render(<StoreEditorialHeader />)

    expect(
      screen.getByRole('heading', { name: /Prendas con oficio, pensadas para acompañarlos/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Hecho a mano en Chile')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver colecciones/i })).toHaveAttribute(
      'href',
      '#catalogo',
    )
  })
})

describe('StoreCategoryRow', () => {
  it('enlaza cada categoría destacada a /tienda', () => {
    render(<StoreCategoryRow categories={categories} />)

    expect(screen.getByRole('link', { name: /Prendas/i })).toHaveAttribute(
      'href',
      '/tienda?category=Prendas',
    )
    expect(screen.getByRole('link', { name: /Accesorios/i })).toHaveAttribute(
      'href',
      '/tienda?category=Accesorios',
    )
  })
})
