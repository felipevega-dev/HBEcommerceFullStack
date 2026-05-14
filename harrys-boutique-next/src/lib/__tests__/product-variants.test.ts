import { describe, expect, it } from 'vitest'
import {
  buildDefaultVariants,
  findMatchingVariant,
  getAvailableStockForSelection,
} from '../product-variants'
import { resolveCheckoutItems } from '../checkout'

const baseProduct = {
  id: 'p1',
  name: 'Polera',
  price: 10000,
  images: ['https://example.com/polera.webp'],
  stock: 20,
  active: true,
  colors: ['Negro', 'Blanco'],
  sizes: ['S', 'M'],
}

describe('product variants', () => {
  it('builds one draft variant per size/color pair', () => {
    expect(buildDefaultVariants(['S', 'M'], ['Negro', 'Blanco'])).toMatchObject([
      { size: 'S', color: 'Negro', stock: 0 },
      { size: 'S', color: 'Blanco', stock: 0 },
      { size: 'M', color: 'Negro', stock: 0 },
      { size: 'M', color: 'Blanco', stock: 0 },
    ])
  })

  it('finds only active matching variants', () => {
    const variants = [
      { id: 'v1', size: 'S', color: 'Negro', stock: 0, active: false },
      { id: 'v2', size: 'S', color: 'Negro', stock: 3, active: true },
    ]

    expect(findMatchingVariant(variants, 'S', 'Negro')?.id).toBe('v2')
  })

  it('uses variant stock when variants exist and product stock as fallback otherwise', () => {
    expect(
      getAvailableStockForSelection(
        {
          id: 'p1',
          name: 'Polera',
          stock: 20,
          variants: [{ id: 'v1', size: 'M', color: 'Negro', stock: 4, active: true }],
        },
        'M',
        'Negro',
      ),
    ).toBe(4)

    expect(getAvailableStockForSelection({ id: 'p1', name: 'Polera', stock: 20 }, 'M')).toBe(20)
  })

  it('resolves checkout item with variant id and variant stock', () => {
    const [item] = resolveCheckoutItems(
      [{ productId: 'p1', quantity: 2, size: 'M', color: 'Negro' }],
      [
        {
          ...baseProduct,
          variants: [{ id: 'v1', size: 'M', color: 'Negro', stock: 2, active: true }],
        },
      ],
    )

    expect(item.variantId).toBe('v1')
  })

  it('rejects checkout item above selected variant stock', () => {
    expect(() =>
      resolveCheckoutItems(
        [{ productId: 'p1', quantity: 3, size: 'M', color: 'Negro' }],
        [
          {
            ...baseProduct,
            variants: [{ id: 'v1', size: 'M', color: 'Negro', stock: 2, active: true }],
          },
        ],
      ),
    ).toThrow('Stock insuficiente')
  })
})
