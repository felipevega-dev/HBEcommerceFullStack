import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProductInfo } from '../product-info'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock('@/store/cart-store', () => ({
  useCartStore: (selector: (state: { addItem: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ addItem: vi.fn() }),
}))
vi.mock('@/lib/analytics', () => ({ trackAnalyticsEvent: vi.fn() }))
vi.mock('@/components/ui/brand-icon', () => ({ BrandIcon: () => <span aria-hidden="true" /> }))
vi.mock('@/components/ui/button-with-feedback', () => ({
  ButtonWithFeedback: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}))
vi.mock('../mercado-libre-link', () => ({
  MercadoLibreLink: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const product = {
  id: 'product-1',
  slug: 'poleron-prueba',
  name: 'Polerón de prueba',
  price: 15000,
  description: 'Producto handmade',
  sizes: ['S', 'M'],
  colors: ['black'],
  images: ['/product.jpg'],
  stock: 5,
  ratingAverage: 0,
  ratingCount: 0,
}

describe('ProductInfo purchase channel', () => {
  it('oculta stock y selectores locales cuando la compra ocurre en Mercado Libre', () => {
    render(
      <ProductInfo
        product={{
          ...product,
          mercadoLibreUrl: 'https://articulo.mercadolibre.cl/MLC-4144018020-poleron-de-prueba-_JM',
        }}
      />,
    )

    expect(screen.getByRole('link', { name: 'Comprar en Mercado Libre' })).toBeInTheDocument()
    expect(screen.getByText(/Precio referencial/)).toBeInTheDocument()
    expect(screen.queryByText(/5 unidades/)).not.toBeInTheDocument()
    expect(screen.queryByText('Selecciona Talla')).not.toBeInTheDocument()
    expect(screen.queryByText('Cantidad')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir al carrito' })).not.toBeInTheDocument()
  })

  it('mantiene stock, variantes y carrito para compra directa', () => {
    render(<ProductInfo product={product} />)

    expect(screen.getByText(/5 unidades/)).toBeInTheDocument()
    expect(screen.getByText('Selecciona Talla')).toBeInTheDocument()
    expect(screen.getByText('Cantidad')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Añadir al carrito' })).toBeInTheDocument()
  })
})
