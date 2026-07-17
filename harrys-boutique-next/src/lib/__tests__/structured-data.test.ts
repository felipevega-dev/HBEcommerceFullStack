import { describe, expect, it } from 'vitest'
import { getProductStructuredData } from '@/lib/structured-data'

const baseProduct = {
  id: 'product-1',
  name: 'Polerón artesanal',
  description: 'Prenda de prueba',
  images: ['https://example.com/product.jpg'],
  category: 'Ropa > Polerones',
  price: 15000,
  stock: 5,
  ratingAverage: 0,
  ratingCount: 0,
  url: 'https://harrysboutique.cl/product/poleron-artesanal',
}

describe('getProductStructuredData', () => {
  it('includes local availability for a direct product', () => {
    const data = getProductStructuredData({ ...baseProduct, mercadoLibreUrl: null })

    expect(data.offers).toMatchObject({
      availability: 'https://schema.org/InStock',
    })
  })

  it('omits local availability for a Mercado Libre product', () => {
    const data = getProductStructuredData({
      ...baseProduct,
      mercadoLibreUrl: 'https://articulo.mercadolibre.cl/MLC-4144018020-poleron-artesanal-_JM',
    })

    expect(data.offers).not.toHaveProperty('availability')
  })

  it('keeps aggregate ratings when reviews exist', () => {
    const data = getProductStructuredData({
      ...baseProduct,
      ratingAverage: 4.8,
      ratingCount: 12,
    })

    expect(data.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      reviewCount: 12,
    })
  })
})
