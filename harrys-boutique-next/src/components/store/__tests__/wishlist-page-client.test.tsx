import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WishlistPageClient } from '@/components/store/wishlist-page-client'

vi.mock('@/components/store/product-card', () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}))

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('WishlistPageClient', () => {
  it('ofrece rutas distintas para explorar y conocer el Atelier cuando está vacío', () => {
    render(<WishlistPageClient wishlist={[]} />)

    expect(screen.getByRole('heading', { name: /tus favoritos están listos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar tienda' })).toHaveAttribute('href', '/tienda')
    expect(screen.getByRole('link', { name: 'Conocer el Atelier' })).toHaveAttribute(
      'href',
      '/experiencias#atelier',
    )
  })

  it('distingue ver producto de consultar personalización cuando tiene favoritos', () => {
    render(
      <WishlistPageClient
        wishlist={[
          {
            id: 'wishlist-1',
            productId: 'poleron-artesanal',
            product: {
              id: 'poleron-artesanal',
              name: 'Polerón artesanal',
              price: 25000,
              images: ['/poleron.jpg'],
              ratingAverage: 0,
              ratingCount: 0,
            },
          },
        ]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Mis favoritos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver producto' })).toHaveAttribute(
      'href',
      '/product/poleron-artesanal',
    )
    expect(screen.getByRole('link', { name: 'Consultar personalización' })).toHaveAttribute(
      'href',
      '/experiencias#atelier',
    )
    expect(
      screen.getByRole('button', { name: 'Eliminar Polerón artesanal de favoritos' }),
    ).toBeInTheDocument()
  })
})
